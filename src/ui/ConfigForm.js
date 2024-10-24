import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import computer from '../qweb/qcomputer'
import { FileValidator, configFormFileValidators } from '../FileValidator'
import { useSnackbar } from 'notistack';
import qConfig from '../qweb/qConfig'
import q1 from '../qweb/configs/q1.json'
import q2 from '../qweb/configs/q2.json'
import q3 from '../qweb/configs/q3.json'
import q4 from '../qweb/configs/q4.json'
import q5 from '../qweb/configs/q5.json'
import q6 from '../qweb/configs/q6.json'
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useEffect } from 'react';
import qlayers from '../images/q-layers.png'
import { Autocomplete } from '@material-ui/lab';

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

const configs = [
  {
    value: 'Q1',
    enabled: false,
    autocomplete: false,
    file: q1,
  },
  {
    value: 'Q2',
    enabled: false,
    autocomplete: false,
    file: q2,
  },
  {
    value: 'Q3',
    enabled: false,
    autocomplete: false,
    file: q3,
  },
  {
    value: 'Q4',
    enabled: false,
    autocomplete: false,
    file: q4,
  },
  {
    value: 'Q5',
    enabled: false,
    autocomplete: true,
    file: q5,
  },
  {
    value: 'Q6',
    enabled: true,
    autocomplete: true,
    file: q6,
  },
]
export default function ConfigForm({ open, setOpen }) {
  const classes = useStyles();
  const [defaultValue, defaultValueSetState] = useState(qConfig.getItem("default_value"))
  const [addressingMode, addressingModeSetState] = useState(qConfig.getItem("addressing_mode").sort((a, b) => a.name > b.name ? 1 : -1))
  const [instruction, instructionSetState] = useState(qConfig.getItem("instruction").sort((a, b) => a.name > b.name ? 1 : -1))
  const [configurations, setConfigurations] = useState(qConfig.getConfigs());
  const [configuration, setConfiguration] = useState(configurations.find(c => c.enabled))
  const { enqueueSnackbar } = useSnackbar()
  const hiddenFileInput = React.useRef(null);


  function updateActiveConfigSettings() {
    const activeConfig = configurations.find(c => c.enabled)
    if(activeConfig) {
      const fileConfig = activeConfig.file;
      defaultValueSetState(fileConfig.default_value)
      addressingModeSetState(fileConfig.addressing_mode.sort((a, b) => a.name > b.name ? 1 : -1))
      instructionSetState(fileConfig.instruction.sort((a, b) => a.name > b.name ? 1 : -1))
    }
    return(activeConfig);
  };

  const qVersionChange = (event) => {
    const newConfigs = configurations.map(c => {
      if (c.value === event.target.name) {
        return {
          ...c,
          enabled: !c.enabled,
          autocomplete: (c.value === 'Q5' || c.value === 'Q6') ? true : c.autocomplete
        };
      }
      return { ...c, enabled: false, autocomplete: false };
    });
    setConfigurations(newConfigs);
  };

  useEffect(() => {
    const newConfig = updateActiveConfigSettings()
    setConfiguration(newConfig)
  }, [configurations])
  
  function handleRollback() {
    qConfig.removeSavedConfigs()
    setConfigurations(qConfig.getConfigs())
  }

  function handleAutocomplete() {
    const newConfigs = configurations.map(c => {
      if (c.enabled) {
        return { ...c, autocomplete: !c.autocomplete };
      }
      return c; 
    });
    setConfigurations(newConfigs)
  }
  function save() {
    const actConfig = configuration.file;
    qConfig.setItem('registers_number', actConfig.registers_number);
    qConfig.setItem('mul_modifies_r7', actConfig.mul_modifies_r7);
    qConfig.setItem('default_value', actConfig.default_value);
    qConfig.setItem('addressing_mode', actConfig.addressing_mode);
    qConfig.setItem('instruction', actConfig.instruction);
    saveConfig()
    qConfig.setConfigs(configurations)
  }

  function saveConfig() {
    computer.restart()
    qConfig.saveConfig()
    setOpen(false);
  }

  function getQVersion(value, enabled, key) {
    return <FormControlLabel
      control={<Checkbox
        key={key}
        id={value}
        checked={enabled}
        color="primary"
        onChange={qVersionChange}
        name={value} />}
      label={value}
      labelPlacement="start"
    />
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
        <DialogTitle id="form-dialog-title">Configuración de versión de Q</DialogTitle>
        <IconButton aria-label="Cerrar" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Version Q:</FormLabel>
            <RadioGroup row aria-label="version q" name="version q">
              {configurations.map(i => getQVersion(i.value, i.enabled, i.value))}
            </RadioGroup>
          </FormControl><br />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img src={qlayers} alt="Q Layers" style={{ height: '80%', width: '80%', maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        </DialogContent>
        <DialogContent>
          <FormLabel component="legend">Autocompletar:</FormLabel>
          <Tooltip title="Autocompletar">
          <Switch 
            checked={configuration ? configuration.autocomplete : false} 
            onChange={handleAutocomplete}
            />
          </Tooltip>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Vuelve a la configuración por defecto">
            <Button variant={'contained'} onClick={handleRollback} color="primary">
              Revertir
            </Button>
          </Tooltip>
          <Button variant={'contained'} disabled={!configuration} onClick={save} id='save-config-button' color="primary">
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
