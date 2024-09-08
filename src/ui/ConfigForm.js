import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import CloudUpload from '@material-ui/icons/CloudUpload';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import computer from '../qweb/qcomputer'
import { FileValidator, configFormFileValidators } from '../FileValidator'
import { useSnackbar } from 'notistack';
import qConfig from '../qweb/qConfig'
import { FormGroup } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import { isMobile } from 'react-device-detect';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles(theme => ({
  margin: {
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  marginBaby: {
    marginBottom: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

const SNACKBAR_CONFIG = {
  variant: 'error',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  autoHideDuration: 6000
}

const defaultValueTypes = [
  {
    value: 'zero',
    label: 'Cero',
    appliesForRegister: true,
  },
  {
    value: 'error',
    label: 'Error',
    appliesForRegister: false,
  },
  {
    value: 'random',
    label: 'Aleatorio',
    appliesForRegister: true,
  },
]

export default function ConfigForm({ open, setOpen }) {
  const classes = useStyles();
  const [mulModifiesR7, mulModifiesR7SetState] = useState(qConfig.getItem('mul_modifies_r7'));
  const [registersCount, setRegistersCount] = useState(qConfig.getItem('registers_number'));
  const [defaultValue, defaultValueSetState] = useState(qConfig.getItem("default_value"))
  const [addressingMode, addressingModeSetState] = useState(qConfig.getItem("addressing_mode").sort((a, b) => a.name > b.name ? 1 : -1))
  const [instruction, instructionSetState] = useState(qConfig.getItem("instruction").sort((a, b) => a.name > b.name ? 1 : -1))
  const { enqueueSnackbar } = useSnackbar()
  const hiddenFileInput = React.useRef(null);

  const mulModifiesR7HandleChange = (event) => {
    mulModifiesR7SetState(event.target.checked);
    if (event.target.checked) setRegistersCount(8);
  };

  const registersNumberChange = (event, number) => {
    setRegistersCount(number);
  };

  const defaultValueHandleChange = name => (event) => {
    defaultValueSetState({ ...defaultValue, [name]: event.target.value });
  };

  const addressingModeHandleChange = (event) => {
    const mode = addressingMode.find(am => am.name === event.target.name)
    addressingModeSetState([...addressingMode.filter(am => am.name !== event.target.name), { ...mode, enabled: !mode.enabled }].sort((a, b) => a.name > b.name ? 1 : -1));
  };

  const instructionHandleChange = (event) => {
    const ins = instruction.find(am => am.name === event.target.name)
    instructionSetState([...instruction.filter(i => i.name !== event.target.name), { ...ins, enabled: !ins.enabled }].sort((a, b) => a.name > b.name ? 1 : -1));
  };

  function handleRollback() {
    qConfig.set_config();
    setRegistersCount(qConfig.getItem('registers_number'));
    mulModifiesR7SetState(qConfig.getItem('mul_modifies_r7'))
    defaultValueSetState(qConfig.getItem('default_value'))
    addressingModeSetState(qConfig.getItem('addressing_mode'))
    instructionSetState(qConfig.getItem('instruction'))
  }

  function save() {
    qConfig.setItem('registers_number', registersCount);
    qConfig.setItem('mul_modifies_r7', mulModifiesR7);
    qConfig.setItem('default_value', defaultValue);
    qConfig.setItem('addressing_mode', addressingMode);
    qConfig.setItem('instruction', instruction);

    saveConfig()
  }

  function saveConfig() {
    computer.restart()
    qConfig.saveConfig()
    setOpen(false);
  }

  function getDefaultCellRadio(type) {
    return getDefaultRadio(type, 'cells')
  }

  function getDefaultRegisterRadio(type) {
    return getDefaultRadio(type, 'registers')
  }

  function getDefaultRadio(type, operand) {
    return <FormControlLabel
      value={type.value}
      control={<Radio color="primary" checked={defaultValue[operand] === type.value} />}
      label={type.label}
      onChange={defaultValueHandleChange(operand)}
      labelPlacement="start"
    />
  }

  function getAddressingModeCheckbox(id, label, enabled) {
    return <FormControlLabel
      control={<Checkbox
        id={id}
        checked={enabled}
        color="primary"
        onChange={addressingModeHandleChange}
        name={id} />}
      label={label}
      labelPlacement="start"
    />
  }

  function getInstructionCheckbox(id, label, enabled) {
    return <FormControlLabel
      control={<Checkbox
        id={id}
        checked={enabled}
        color="primary"
        onChange={instructionHandleChange}
        name={id} />}
      label={label}
      labelPlacement="start"
    />
  }

  function appliesForRegister(type) {
    return type.appliesForRegister
  }

  function addConfig() {
    hiddenFileInput.current.click();
  }

  function processFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const validator = new FileValidator(configFormFileValidators)

    reader.addEventListener('load', (event) => {
      const result = event.target.result
      validator.validate(file, result)
      if (!validator.hasErrors) {
        const config = JSON.parse(result)
        Object.entries(config).forEach(([key, value]) => qConfig.setItem(key, value))
        saveConfig()
        enqueueSnackbar('Se cargó la configuración correctamente.', {...SNACKBAR_CONFIG, variant: 'success'})
      }
      else {
        enqueueSnackbar(validator.errors, SNACKBAR_CONFIG)
      }
    })
    reader.readAsText(file)
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Configuraciones</DialogTitle>
        <IconButton aria-label="Cerrar" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <DialogContent>

          <FormControl component="fieldset" className={classes.margin}>
            <FormLabel component="legend" className={classes.marginBaby}>MUL modifica el registro R7:</FormLabel>
            <FormControlLabel
              labelPlacement="top"
              id="mul_modifies_r7"
              control={<Switch checked={mulModifiesR7} onChange={mulModifiesR7HandleChange} size="medium" name="mulModifiesR7" color="primary" />}
            />
          </FormControl>
          <FormControl component="fieldset">
            <FormLabel component="legend">Valor por defecto de un registro sin inicializar:</FormLabel>
            <RadioGroup row aria-label="valor por defecto registro" name="valor por defecto registro">
              {defaultValueTypes.filter(appliesForRegister).map(getDefaultRegisterRadio)}
            </RadioGroup>
          </FormControl><br />

          <FormControl component="fieldset">
            <FormLabel component="legend">Valor por defecto de una celda sin inicializar:</FormLabel>
            <RadioGroup row aria-label="valor por defecto memoria" name="valor por defecto memoria">
              {defaultValueTypes.map(getDefaultCellRadio)}
            </RadioGroup>
          </FormControl><br />

          <FormControl component="fieldset">
            <FormLabel component="legend">Modos de direccionamiento:</FormLabel>
            <FormGroup row aria-label="modo de direccionamiento" name="modo de direccionamiento">
              {addressingMode.map(am => getAddressingModeCheckbox(am.name, am.display_name, am.enabled))}
            </FormGroup>
          </FormControl><br />

          <FormControl component="fieldset">
            <FormLabel component="legend">Instrucciones habilitadas:</FormLabel>
            <RadioGroup row aria-label="instrucciones habilitadas" name="instrucciones habilitadas">
              {instruction.map(i => getInstructionCheckbox(i.name, i.display_name, i.enabled))}
            </RadioGroup>
          </FormControl><br />

        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={addConfig} id='addconfig-config-button' color="primary" startIcon={<CloudUpload />}>
            {isMobile || "Cargar configuración"}
          </Button>
          <Tooltip title="Vuelve a la configuración por defecto">
            <Button variant={'contained'} onClick={handleRollback} color="primary">
              Revertir
            </Button>
          </Tooltip>
          <Button variant={'contained'} onClick={save} id='save-config-button' color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={processFile}
        style={{ display: 'none' }} /* Make the file input element invisible */
      />
    </div>
  );
}
