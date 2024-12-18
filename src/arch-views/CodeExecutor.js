import React, { useState, useEffect, useRef, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Grid,
  Paper,
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Tooltip,
  Button,
  IconButton,
} from "@material-ui/core";
import { 
  Close,
  Refresh,
  PlayArrow,
  PlaylistPlay,
  PlaylistAdd,
 } from "@material-ui/icons";
import computer from "../qweb/qcomputer.js";
import Registers from "./Registers.js";
import PaginationTable from "./PaginationTable.js";
import FlagsPreview from "./FlagsPreview.js";
import Memory from "./Memory.js";
import translator from "../qweb/language/translator.js";
import parser, { CommonsTabError, DuplicatedDirectionError, DuplicatedNameError, EmptyCode } from "../qweb/language/parser.js";
import {
  ImmediateAsTarget,
  DisabledInstructionError,
  DisabledRegisterError,
  DivideByZeroError,
  UndefinedCellValueError,
  UndefinedLabel,
  DisabledAddressingModeError,
  IncompleteRoutineError,
  EmptyStackError,
  StackOverflowError,
  TimeoutError,
} from "../qweb/exceptions.js";
import { useSnackbar } from "notistack";
import { ActionType } from "../action-type.js";
import AceEditor from "react-ace";
import AceModeQWeb, { CustomCompleter } from "../editor/AceModeQWeb.js";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import FileSaver from "file-saver";
import { ActionMode } from "../action-mode.js";
import qConfig from "../qweb/qConfig.js";
import { useTabs } from "../editor/CodeTabs.js";
import ExecutionButton from "./ExecutionButton.js";
import { isMobile } from "react-device-detect";
import { ResultTitle } from "../ui/ResultTitle.js";
import "../App.css";
import ErrorTable from "./ErrorTable.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  results: {
    fontFamily: "monospace",
  },
  fab: isMobile
    ? {
        position: "absolute",
        bottom: theme.spacing(1),
        right: theme.spacing(15),
      }
    : {},
}));

const SNACKBAR_CONFIG = {
  variant: "success",
  anchorOrigin: {
    vertical: isMobile ? "top" : "bottom",
    horizontal: "right",
  },
  autoHideDuration: 8000,
};

const EXECUTION_MODE_NORMAL = "EXECUTION_MODE_NORMAL";
const EXECUTION_MODE_ONE_INSTRUCTION = "EXECUTION_MODE_ONE_INSTRUCTION";
const EXECUTION_MODE_DETAILED = "EXECUTION_MODE_DETAILED";

const knownErrors = [
  DisabledAddressingModeError,
  DisabledInstructionError,
  DisabledRegisterError,
  DivideByZeroError,
  EmptyStackError,
  IncompleteRoutineError,
  UndefinedCellValueError,
  UndefinedLabel,
  ImmediateAsTarget,
  StackOverflowError,
  CommonsTabError,
  TimeoutError,
  DuplicatedNameError,
  DuplicatedDirectionError,
  EmptyCode
];

export default function CodeExecutor() {
  const theme = useTheme();
  const [result, setResult] = useState("");
  const [registers, setRegisters] = useState([]);
  const [specialRegisters, setSpecialRegisters] = useState([]);
  const [flags, setFlags] = useState([]);
  const [programLoaded, setProgramLoaded] = useState(false);
  const [programFinished, setProgramFinished] = useState(false);
  const [memory, setMemory] = useState([]);
  const aceEditorRef = useRef(null);
  const [actions, setActions] = useState([]);
  const [historicActions, setHistoricActions] = useState([]);
  const [aceEditorHeight, setAceEditorHeight] = useState(
    window.innerHeight - (isMobile ? 100 : 150) + "px"
  );
  const [aceEditorAnnotations, setAceEditorAnnotations] = useState([]);
  const [aceEditorMarkers, setAceEditorMarkers] = useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const [TabsCode, tabs, currentTab, code, getLibrary, nameByIndex, setCode, setCurrentTab] = useTabs();
  const tabsRef = useRef(tabs);
  const actionMode = qConfig.getItem("actions_mode");
  const CurrentActionMode = useMemo(
    () => ActionMode.find_modeclass(actionMode),
    [actionMode]
  );
  const [currentExecutionMode, setCurrentExecutionMode] = useState(
    EXECUTION_MODE_NORMAL
  );
  const configurations = qConfig.getConfigs();
  const autocomplete = configurations.find((c) => c.enabled).autocomplete;
  const markerType = {
    error: {
      type: "error",
      className: "error-highlight",
    },
    warning: {
      type: "warning",
      className: "warning-highlight",
    },
    info: {
      type: "info",
      className: "info-highlight",
    },
  };
  const completer = useMemo(() => new CustomCompleter(() => tabsRef.current), []);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    completer.currentDoc = currentTab
    parse_warnings(getCodeFromCurrent());
    setResult("");
    qweb_restart()
  }, [code]);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  function load_program(routines) {
    computer.load_many(routines);
  }

  function getCode() {
    return tabs.map((tab) => tab.code).join("\n");
  }

  function getCodeFromCurrent() {
    try {
      return (tabs[currentTab]).code
    } catch (error) { console.log("Can't read code from unexistent tab") }
  }

  function errorsDetectedByFlag(something) {
    return typeof something === 'boolean'
  }

  function parse_and_load_program() {
    if (currentTab == 1) {
      throw new Error("La biblioteca no puede ejecutarse como principal");
    }
    parser.validate_empty_code(code)
    parser.validate_commons_code(getLibrary)

    let programs = []
    let current_parsed = parse_code(getCodeFromCurrent(), currentTab)
    if (!errorsDetectedByFlag(current_parsed)) {
      programs = programs.concat(current_parsed)
    }

    let lib_parsed = parse_code(getLibrary, 1)
    if (!errorsDetectedByFlag(lib_parsed)) {
      programs = programs.concat(lib_parsed.slice(1))
    }

    parser.validate_duplicated(programs)
    let routines = translator.translate_code(programs);

    return {
      detected: (errorsDetectedByFlag(lib_parsed) || errorsDetectedByFlag(current_parsed)),
      rts: routines
    }
  }

  function execution_on_error(e) {
    console.log(e);

    let alertConfig = { variant: "error" };
    qweb_restart();
    if (e instanceof EmptyCode) {
      addAction(e.message, {variant: "info"})
      return;
    }
    if (knownErrors.some((error) => e instanceof error))
      addAction(e.message, alertConfig);
    else
      addAction(e.message, alertConfig);
  }

  function qweb_restart() {
    setProgramLoaded(false);
    setProgramFinished(false);
    setActions([]);
    setHistoricActions([]);
    computer.restart();
  }

  function getActionTypes(actions) {
    return actions
      .map((ca) => CurrentActionMode.map_computer_action(ca))
      .filter((ca) => CurrentActionMode.valid_action_types().includes(ca.name))
      .map((ca) => ActionType.find_subclass(ca));
  }

  function execute() {
    let result;
    setErrors([])
    try {
      if (currentExecutionMode !== EXECUTION_MODE_NORMAL) {
        qweb_restart();
        setCurrentExecutionMode(EXECUTION_MODE_NORMAL);
      }
      result = parse_and_load_program();
      if (result.detected) {
        throw new Error("Se encontraron errores durante la ejecución.");
      }
      load_program(result.rts)
      var executionActions = computer.execute();
      display_results(false);
      qweb_restart();
      setHistoricActions(
        getActionTypes(executionActions).map((x) => x.display())
      );
    } catch (e) {
      execution_on_error(e);
    }
  }

  function parse_code(codeToParse, tabIndex) {
    try {
      const { routines, errors, recursives } = parser.parse_code(codeToParse, tabIndex);
      errors.map(e => {
        e.error.tab = nameByIndex(tabIndex)
        e.error.tab_index = tabIndex
      })
      addNotifications(errors, "error", false);
      mark_recursives(recursives);

      const hasErrors = errors.some((e) => e && e.error);

      if (!hasErrors) {
        return routines;
      } else {
        setErrors(prev => prev.concat(errors));
        return false
      }
    } catch (e) {
      //addError(e)
      //setResult(e.message)
    }
  }

  function mark_recursives(calls) {
    const session = aceEditorRef.current.editor.getSession();
    const { type, className } = markerType["info"];

    calls.forEach((ca) => {
      const msg = `Autoreferencia a \'${ca.recursive_call}\' en la linea ${ca.line}. Este tipo de código escapa al objetivo didactico del simulador. \n Su ejecución puede fallar por motivos de ejecución o arquitectura. \n`;

      setResult((prevState) => `${prevState}\n${msg}`);
    });

    calls.forEach((ca) => {
      setAceEditorAnnotations((prevErrors) => [
        ...prevErrors,
        {
          row: ca.line - 1,
          column: Math.random(),
          type: type,
          text: "Autoreferencia",
        },
      ]);

      setAceEditorMarkers((prevMarkers) => {
        const line = session.getLine(ca.line - 1);
        return [
          ...prevMarkers,
          {
            startRow: ca.line - 1,
            startCol: line.search(/\S/),
            endRow: ca.line - 1,
            endCol:
              line.split("#")[0].lastIndexOf(ca.recursive_call) +
              ca.recursive_call.length,
            className: className,
            type: "text",
            inFront: true,
          },
        ];
      });
    });
  }

  function parse_warnings(codeToParse) {
    setAceEditorAnnotations([]);
    setAceEditorMarkers([]);
    const { errors, recursives } = parser.parse_code(codeToParse);
    addNotifications(errors, "warning", true);
    mark_recursives(recursives);
  }

  function addNotifications(errors, type, must_show) {
    const session = aceEditorRef.current.editor.getSession();
    const typeOfMarker = markerType[type];
    const { result } = errors.reduce(
      (acc, e) => {
        const { result } = acc;

        const newResult = `${result}\n${e.error.message}`;

        addNotification(e, session, typeOfMarker, must_show);

        return {
          result: newResult,
          lastError: e,
        };
      },
      { result: "", lastError: null }
    );
    setResult(result);
  }
  const addNotification = (e, session, typeOfMarker, must_show) => {
    const { type, className } = typeOfMarker;
    if (must_show || e.error.tab === nameByIndex(currentTab)) {
      setAceEditorAnnotations((prevErrors) => [
        ...prevErrors,
        {
          row: e.error.line,
          column: Math.random(),
          type: type,
          text: e.error.shorterMessage,
        },
      ]);

      setAceEditorMarkers((prevMarkers) => {
        const lineLength = session.getLine(e.error.line).length;
        return [
          ...prevMarkers,
          {
            startRow: e.error.line,
            startCol: e.error.index,
            endRow: e.error.line,
            endCol: lineLength,
            className: className,
            type: "text",
            inFront: true,
          },
        ];
      });
    }
  };
  function execute_cycle() {
    setErrors([])
    try {
      switchDetailedMode(EXECUTION_MODE_ONE_INSTRUCTION);
      computer.execute_cycle();
      display_results(true);
    } catch (e) {
      execution_on_error(e);
    }
  }

  function execute_cycle_detailed() {
    setErrors([])
    try {
      switchDetailedMode(EXECUTION_MODE_DETAILED);
      if (programFinished && programLoaded) {
        qweb_restart();
        addAction("Programa finalizado", { variant: "info" });
      }
      let newActions = [];

      if (!programFinished && actions.length === 0) {
        newActions = getActionTypes(computer.execute_cycle_detailed());
        setProgramFinished((old) => old || newActions.length === 0);
      }

      setActions((oldActions) => [...oldActions, ...newActions]);
      display_results(true);
    } catch (e) {
      execution_on_error(e);
    }
  }

  function switchDetailedMode(execution_mode) {
    if (!programLoaded || currentExecutionMode !== execution_mode) {
      setActions([]);
      computer.restart_actions();
      setCurrentExecutionMode(execution_mode);
      if (!programLoaded) {
        qweb_restart();
        let result = parse_and_load_program();
        if (result.detected) {
          throw new Error("Se encontraron errores durante la ejecución.");
        }
        load_program(result.rts)
      }
      setProgramLoaded(true);
    }
  }

  function display_next_action() {
    const actionToDisplay = actions.shift();
    setActions(actions);
    setHistoricActions((old) => {
      old.push(actionToDisplay.display());
      return old;
    });
    addAction(actionToDisplay.display(), {
      variant: actionToDisplay.color ? actionToDisplay.color : "success",
    });
  }

  function display_results(isCycleExecution) {
    const sp = setRegistersAndFlags();
    setMemory(getMemory());
    if (isCycleExecution) {
      const irDescriptive =
        sp
          .find((sp) => sp.id === "IR")
          ?.details.find((d) => d.key === "IR desensamblado:")?.value ?? null;

      setResult(
        "La instrucción:" + irDescriptive + " se ejecutó correctamente"
      );
    } else {
      setResult("La ejecución del programa fue exitosa");
    }
  }

  function addAction(action_display, config = {}) {
    SNACKBAR_CONFIG["action"] = (
      <Button onClick={() => closeSnackbar()}>
        <Close />
      </Button>
    );
    return enqueueSnackbar(action_display, { ...SNACKBAR_CONFIG, ...config });
  }

  function setRegistersAndFlags() {
    const { specialRegisters: sp, updatedRegisters: r } =
      computer.get_updated_special_registers(registers, specialRegisters);
    setRegisters(r.length > 0 ? r : computer.get_updated_registers());
    setSpecialRegisters(sp);
    setFlags(computer.get_updated_flags());
    return sp;
  }

  function refreshExecution() {
    setProgramLoaded(false);
    setProgramFinished(false);
    setActions([]);
    setHistoricActions([]);
    computer.restart();
    const { specialRegisters: sp, updatedRegisters: r } =
      computer.get_updated_special_registers(registers, specialRegisters);
    setRegisters(r.length > 0 ? r : computer.get_updated_registers());
    setSpecialRegisters(sp);
    setFlags(computer.get_updated_flags());
    setMemory(getMemory());
    setResult("");
  }
  function getMemory() {
    function byCell(a, b) {
      return a.cell - b.cell;
    }
    const memory = computer.get_memory();
    return Object.keys(memory)
      .map((k) => {
        return {
          cell: k,
          value: memory[k],
        };
      })
      .filter((c) => c.value !== null)
      .sort(byCell);
  }

  useEffect(() => {
    const customMode = new AceModeQWeb();
    aceEditorRef.current.editor.getSession().setMode(customMode);
    const savedCode = qConfig.getCode();
    aceEditorRef.current.editor
      .getSession()
      .setValue(savedCode ? savedCode : "");
    aceEditorRef.current.editor.completers = [completer];
    setRegistersAndFlags();
  }, []);

  useEffect(() => {
    if (actions.length > 0) display_next_action();
  });

  window.addEventListener("resize", function (event) {
    setAceEditorHeight(window.innerHeight - 100 + "px");
  });

  document.onkeyup = function (e) {
    var event = e || window.event;
    if (event.altKey && event.key === "s") {
      saveProgramAsTxt();
    }
    if (event.altKey && event.key === "r") {
      execute();
    }
    if (event.which === 13) {
      validateCode();
    }
  };

  function validateCode() {
    parse_code(getCodeFromCurrent(), currentTab);
  }
  function goToLine(index) {
    aceEditorRef.current.editor.gotoLine(index+1);
  }
  function saveProgramAsTxt() {
    var blob = new Blob([getCode()], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "myQwebCode.txt");
  }

  return (
    <>
      <div style={{ height: "100%", width: "100%" }}>
        <div
          style={
            isMobile
              ? {}
              : {
                  width: "40%",
                  height: "100px",
                  float: "left",
                }
          }
        >
          {TabsCode}
          <Box
            display="flex"
            flexDirection="row"
            style={{ padding: theme.spacing(0, 1) }}
          >
            <AceEditor
              ref={aceEditorRef}
              name="ace-editor"
              mode="python"
              value={code}
              placeholder={"Comenzá tu programa aquí"}
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
                enableBasicAutocompletion: autocomplete,
                enableLiveAutocompletion: autocomplete,
                enableSnippets: autocomplete,
              }}
            />
          </Box>
        </div>
        <div
          style={
            isMobile
              ? {}
              : {
                  marginLeft: "40%",
                  height: "100px",
                }
          }
        >
          <Box p={1} m={1}>
            <Grid
              container
              className={classes.root}
              spacing={2}
              direction="row"
              alignItems="center"
            >
              <Grid item>
                <ExecutionButton
                  {...{
                    Ejecutar: {
                      onClick: execute,
                      icon: <PlayArrow />,
                      aria_label: "Ejecutar todo el programa",
                    },
                    "Ejecutar una instrucción": {
                      onClick: execute_cycle,
                      icon: <PlaylistPlay />,
                      aria_label: "Ejecutar una instrucción",
                    },
                    "Ejecutar una instrucción detallada": {
                      onClick: execute_cycle_detailed,
                      icon: <PlaylistAdd />,
                      aria_label: "Ejecutar una instrucción detallada",
                    },
                  }}
                />
              </Grid>
              {(currentExecutionMode == EXECUTION_MODE_NORMAL ||
                currentExecutionMode == EXECUTION_MODE_ONE_INSTRUCTION ||
                currentExecutionMode == EXECUTION_MODE_DETAILED) && (
                <Grid item>
                  <Tooltip title="Resetear ejecución">
                    <IconButton onClick={refreshExecution} disabled={!result}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
              {
                <Grid item className={classes.fab}>
                  <PaginationTable
                    keyName="Acción"
                    rows={historicActions.map((action, index) => {
                      return {
                        id: index + 1,
                        value: action,
                      };
                    })}
                  ></PaginationTable>
                </Grid>
              }
            </Grid>
            {errors.length > 0 ? (
              <Grid item xs={12} md={6}>
                <ErrorTable errors={errors} toLine={goToLine} toTab={setCurrentTab} current={currentTab}/>{" "}
              </Grid>
            ) : result ? (
              <Grid container spacing={1}>
                <TextField
                  id="results-box-id"
                  InputProps={{
                    classes: {
                      input: classes.results,
                    },
                  }}
                  multiline
                  rows={result.split("\n").length + 1}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  value={result}
                />

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
                      style={{
                        padding: theme.spacing(1.5),
                        marginBottom: "0.05rem",
                      }}
                      variant="body1"
                      aria-label={"flags"}
                      align="center"
                    >
                      {<FlagsPreview flags={flags} />}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <div style={{ overflowY: "scroll" }}>
                    <ResultTitle title="Memoria"></ResultTitle>
                    <Memory memory={memory} />
                  </div>
                </Grid>
              </Grid>
            ) : null}
          </Box>
        </div>
      </div>
    </>
  );
}
