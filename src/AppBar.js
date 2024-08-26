import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ConfigForm from './ConfigForm'
import QSimWebLogo from './images/qsimweb_t.png'
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import WbIncandescentOutlinedIcon from '@material-ui/icons/WbIncandescentOutlined';
import { Tooltip } from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import HelpDialog from './HelpDialog';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    width: 115
  }
}))


export default function MenuAppBar({ useDark, setUseDark }) {
  const classes = useStyles();
  const theme = useTheme()
  const [configOpen, setConfigOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  return (
    <div className={classes.root}>
      <AppBar position="static" color={theme.palette.bar}>
        <Toolbar>
          <img src={QSimWebLogo} alt="Logo QSim Web" role="presentation" className={classes.logo} />
          <Typography className={classes.title} />
          {
            useDark ?
              <IconButton aria-label="Modo claro" onClick={() => setUseDark(false)}>
                <WbIncandescentOutlinedIcon />
              </IconButton>
              :
              <IconButton aria-label="Modo oscuro" onClick={() => setUseDark(true)}>
                <WbIncandescentIcon style={{ color: 'white' }} />
              </IconButton>
          }
          <Tooltip title="Configuraciones">
            <IconButton edge="start" id="config-button" aria-label="Configuraciones QSim Web" onClick={() => setConfigOpen(true)}>
              <BuildIcon style={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
          {configOpen && <ConfigForm open={configOpen} setOpen={setConfigOpen} />}
          <Tooltip title="Ayuda">
            <IconButton edge="start" id="help-button" aria-label="Ayuda QSim Web" onClick={() => setHelpOpen(true)}>
              <HelpOutlineIcon style={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
          {helpOpen && <HelpDialog open={helpOpen} setOpen={setHelpOpen} />}
        </Toolbar>
      </AppBar>
    </div>
  );
}
