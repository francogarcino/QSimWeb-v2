import React, { useState, useEffect, useRef, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Grid, Paper, Box, Typography, useTheme } from '@material-ui/core';
import computer from '../qweb/qcomputer.js'
import Registers from './Registers.js'
import PaginationTable from './PaginationTable.js'
import FlagsPreview from './FlagsPreview.js'
import Memory from './Memory.js'
import translator from '../qweb/language/translator.js'
import parser from '../qweb/language/parser.js'
import { ImmediateAsTarget, DisabledInstructionError, DisabledRegisterError, DivideByZeroError,
  UndefinedCellValueError, UndefinedLabel, DisabledAddressingModeError, IncompleteRoutineError,
  EmptyStackError } from '../qweb/exceptions.js'
import FlashOnIcon from '@material-ui/icons/FlashOn';
import FlashAutoIcon from '@material-ui/icons/FlashAuto';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import { useSnackbar } from 'notistack';
import { ActionType } from '../action-type.js';
import { toHexa, hexa, getDetails } from '../utils.js';
import AceEditor from "react-ace";
import AceModeQWeb from "../editor/AceModeQWeb.js";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import FileSaver from 'file-saver';
import { ActionMode } from '../action-mode.js';
import qConfig from '../qweb/qConfig.js';
import { useTabs } from '../editor/CodeTabs.js';
import ExecutionButton from './ExecutionButton.js';
import { isMobile } from 'react-device-detect';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { ResultTitle } from '../ui/ResultTitle.js';
import '../App.css';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  results: {
    fontFamily: 'monospace'
  },
  fab: (isMobile ? {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(15),
  } : {})
}));

const SNACKBAR_CONFIG = {
  variant: 'success',
  anchorOrigin: {
    vertical: isMobile ? 'top' : 'bottom',
    horizontal: 'right',
  },
  autoHideDuration: 8000
}

const EXECUTION_MODE_NORMAL = 'EXECUTION_MODE_NORMAL'
const EXECUTION_MODE_ONE_INSTRUCTION = 'EXECUTION_MODE_ONE_INSTRUCTION'
const EXECUTION_MODE_DETAILED = 'EXECUTION_MODE_DETAILED'

const knownErrors = [
  DisabledAddressingModeError,
  DisabledInstructionError,
  DisabledRegisterError,
  DivideByZeroError,
  EmptyStackError,
  IncompleteRoutineError,
  UndefinedCellValueError,
  UndefinedLabel,
  ImmediateAsTarget
]

export default function CodeExecutor() {
  const theme = useTheme()
  const [result, setResult] = useState("")
  const [registers, setRegisters] = useState([])
  const [specialRegisters, setSpecialRegisters] = useState([])
  const [flags, setFlags] = useState([])
  const [programLoaded, setProgramLoaded] = useState(false)
  const [programFinished, setProgramFinished] = useState(false)
  const [memory, setMemory] = useState([])
  const aceEditorRef = useRef(null);
  const [actions, setActions] = useState([])
  const [historicActions, setHistoricActions] = useState([])
  const [aceEditorHeight, setAceEditorHeight] = useState(window.innerHeight - (isMobile ? 100 : 150) + 'px')
  const [aceEditorAnnotations, setAceEditorAnnotations] = useState([])
  const [aceEditorMarkers, setAceEditorMarkers] = useState([])
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const classes = useStyles();
  const [TabsCode, tabs, code, setCode] = useTabs()
  const actionMode = qConfig.getItem('actions_mode')
  const CurrentActionMode = useMemo(() => ActionMode.find_modeclass(actionMode), [actionMode])
  const [currentExecutionMode, setCurrentExecutionMode] = useState(EXECUTION_MODE_NORMAL)
  const markerType = {
    error: {
      type: 'error',
      className: 'error-highlight'
    },
    warning: {
      type: 'warning',
      className: 'warning-highlight'
    }
  };

  useEffect(() => {
    parse_warnings(getCode())
    setResult('')
  }, [code])
  
  function load_program(routines) {
    computer.load_many(routines)
  }

  function getCode() {
    return tabs.map(tab => tab.code).join('\n')
  }

  function parse_and_load_program() {
    let parsed_code = parse_code(getCode())
    let routines = translator.translate_code(parsed_code)
    load_program(routines)
  }

  function execution_on_error(e) {
    let alertConfig = { variant: 'error' }
    qweb_restart()
    if (knownErrors.some(error => e instanceof error)) addAction(e.message, alertConfig)
    else addAction('Hubo un error, es posible que sea de sintaxis', alertConfig)
  }

  function qweb_restart() {
    setProgramLoaded(false)
    setProgramFinished(false)
    setActions([])
    setHistoricActions([])
    computer.restart()
  }

  function getActionTypes(actions) {
    return actions.map(ca => CurrentActionMode.map_computer_action(ca))
        .filter(ca => CurrentActionMode.valid_action_types().includes(ca.name))
        .map(ca => ActionType.find_subclass(ca))
  }

  function execute() {
    try {
      if (currentExecutionMode !== EXECUTION_MODE_NORMAL) {
        qweb_restart()
        setCurrentExecutionMode(EXECUTION_MODE_NORMAL)
      }
      parse_and_load_program()
      var executionActions = computer.execute()
      display_results()
      qweb_restart()
      setHistoricActions(getActionTypes(executionActions).map(x => x.display()))
    }
    catch (e) { execution_on_error(e) }
  }

  function parse_code(codeToParse) {
    try {
      setAceEditorAnnotations([])
      setAceEditorMarkers([])
      const { routines, errors } = parser.parse_code(codeToParse)
      addNotifications(errors, 'error')
      const hasErrors = errors.some(e => e && e.error);

      if(!hasErrors) {
        return routines
      }
    }
    catch (e) {
      //addError(e)
      //setResult(e.message)
    }
  }

  function parse_warnings(codeToParse) {
      setAceEditorAnnotations([])
      setAceEditorMarkers([])
      const { errors } = parser.parse_code(codeToParse)
      addNotifications(errors, 'warning')
  }

  function addNotifications(errors, type) {
    const session = aceEditorRef.current.editor.session;
    const typeOfMarker = markerType[type];
    const { result } = errors.reduce((acc, e) => {
      const { result } = acc;

      const newResult = `${result}\n${e.error.message}`

      addNotification(e, session, typeOfMarker);

      return {
        result: newResult,
        lastError: e
      };
    }, { result: '', lastError: null });
    setResult(result);
  }
  const addNotification = (e, session, typeOfMarker) => {
    const { type, className } = typeOfMarker;
    setAceEditorAnnotations(prevErrors => [
      ...prevErrors,
      {
        row: e.error.line,
        column: Math.random(),
        type: type,
        text: e.error.shorterMessage
      }
    ]);

    setAceEditorMarkers(prevMarkers => {
      const lineLength = session.getLine(e.error.line).length;
      return [
        ...prevMarkers,
        {
          startRow: e.error.line,
          startCol: e.error.index,
          endRow: e.error.line,
          endCol: lineLength,
          className: className,
          type: 'text',
          inFront: true
        }
      ]
    });
  };
  function execute_cycle() {
    try {
      switchDetailedMode(EXECUTION_MODE_ONE_INSTRUCTION)
      computer.execute_cycle()
      display_results()
    }
    catch (e) { execution_on_error(e) }
  }

  function execute_cycle_detailed() {
    try {
      switchDetailedMode(EXECUTION_MODE_DETAILED)
      if (programFinished && programLoaded) {
        qweb_restart()
        addAction("Programa finalizado", { variant: 'info' })
      }
      let newActions = []

      if (!programFinished && actions.length === 0) {
        newActions = getActionTypes(computer.execute_cycle_detailed())
        setProgramFinished(old => old || newActions.length === 0)
      }

      setActions(oldActions => [...oldActions, ...newActions])
      display_results()
    }
    catch (e) {
      execution_on_error(e)
    }
  }

  function switchDetailedMode(execution_mode) {
    if (!programLoaded || currentExecutionMode !== execution_mode) {
      setActions([])
      computer.restart_actions()
      setCurrentExecutionMode(execution_mode)
      if (!programLoaded) {
        qweb_restart()
        parse_and_load_program()
      }
      setProgramLoaded(true)
    }
  }

  function display_next_action() {
    const actionToDisplay = actions.shift()
    setActions(actions)
    setHistoricActions(old => {
      old.push(actionToDisplay.display())
      return old
    })
    addAction(actionToDisplay.display(), { variant: actionToDisplay.color ? actionToDisplay.color : 'success' })
  }

  function display_results() {
    setRegisters(computer.get_updated_registers())
    setSpecialRegisters(computer.get_updated_special_registers())
    setFlags(computer.get_updated_flags())
    setMemory(getMemory())
    setResult("La ejecución fue exitosa")
  }

  function addAction(action_display, config = {}) {
    SNACKBAR_CONFIG['action'] = (
        <Button onClick={() => closeSnackbar()}>
          <CloseIcon />
        </Button>
    )
    return enqueueSnackbar(action_display, { ...SNACKBAR_CONFIG, ...config })
  }

  function getMemory() {
    function byCell(a, b) {
      return a.cell - b.cell
    }
    const memory = computer.get_memory()
    return Object.keys(memory)
        .map(k => {
          return {
            cell: k,
            value: memory[k]
          }
        })
        .filter(c => c.value !== null)
        .sort(byCell)
  }

  useEffect(() => {
    const customMode = new AceModeQWeb();
    aceEditorRef.current.editor.getSession().setMode(customMode);
  }, [])

  useEffect(() => {
    if (actions.length > 0)
      display_next_action()
  })

  window.addEventListener('resize', function (event) {
    setAceEditorHeight(window.innerHeight - 100 + 'px')
  });

  document.onkeyup = function (e) {
    var event = e || window.event;
    if (event.altKey && event.key === 's') { saveProgramAsTxt() }
    if (event.altKey && event.key === 'r') { execute() }
    if (event.which === 13) { validateCode() }
  }

  function validateCode() {
    parse_code(getCode())
  }

  function saveProgramAsTxt() {
    var blob = new Blob([getCode()], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "myQwebCode.txt");
  }

  return (
      <>
        <div style={{ height: '100%', width: '100%' }}>
          <div style={isMobile ? {} : {
            width: '40%',
            height: '100px',
            float: 'left',
          }}>
            {TabsCode}
            <Box display="flex" flexDirection="row" style={{ padding: theme.spacing(0, 1) }}>
              <AceEditor
                  ref={aceEditorRef}
                  name="ace-editor"
                  mode="python"
                  value={code}
                  placeholder={'Comenzá tu programa aquí'}
                  theme={theme.editor}
                  onChange={setCode}
                  height={aceEditorHeight} //TODO: Find a better way to set the height
                  width={aceEditorHeight}
                  annotations={aceEditorAnnotations}
                  markers={aceEditorMarkers}
                  editorProps={{ $blockScrolling: true }}
                  fontSize={20}
                  focus={true}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                  }}
              />
            </Box>
          </div>
          <div style={isMobile ? {} : {
            marginLeft: '40%',
            height: '100px',
          }}>
            <Box p={1} m={1}>
              <Grid container className={classes.root} spacing={2} direction="row" alignItems="flex-start">
                <Grid item >
                  <ExecutionButton
                      {...{
                        'Ejecutar': { onClick: execute, icon: <FlashAutoIcon />, aria_label: 'Ejecutar todo el programa' },
                        'Ejecutar una instrucción': { onClick: execute_cycle, icon: <FlashOnIcon />, aria_label: 'Ejecutar una instrucción' },
                        'Ejecutar una instrucción detallada': { onClick: execute_cycle_detailed, icon: <OfflineBolt />, aria_label: 'Ejecutar una instrucción detallada' }
                      }}
                  />
                </Grid>
                {<Grid item className={classes.fab}>
                  <PaginationTable
                      keyName="Acción"
                      rows={historicActions.map((action, index) => {
                        return {
                          id: index + 1,
                          value: action
                        }
                      })}>
                  </PaginationTable>
                </Grid>}
              </Grid>
              <TextField
                  id="results-box-id"
                  InputProps={{
                    classes: {
                      input: classes.results,
                    },
                  }}
                  multiline
                  rows={result.split('\n').length + 1}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  value={result}
              />
              {registers.length > 0 &&
                  (<Grid container spacing={1}>
                    <Grid item xs={isMobile ? 12 : 4}>
                      <ResultTitle title="Registros"></ResultTitle>
                      <Registers registers={registers} />
                    </Grid>
                    <Grid item xs={isMobile ? 12 : 4}>
                      <ResultTitle title="Registros especiales"></ResultTitle>
                      <Registers registers={specialRegisters} />
                      <ResultTitle title={"Flags"}></ResultTitle>
                      <Paper elevation={2}>
                        <Typography
                            style={{ padding: theme.spacing(1.5), marginBottom: '0.05rem' }}
                            variant="body1"
                            aria-label={"flags"}
                            align="center">{<FlagsPreview flags={flags} />}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={isMobile ? 12 : 4}>
                      <div style={{ overflowY: 'scroll' }}>
                        <ResultTitle title="Memoria"></ResultTitle>
                        <Memory memory={memory} />
                      </div>
                    </Grid>
                  </Grid>)}
            </Box>
          </div>
        </div>
      </>
  )
}