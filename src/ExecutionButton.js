import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import {isMobile} from 'react-device-detect';

const useStyles = makeStyles((theme) => ({
  fab: (isMobile ? {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }: {}),
}));

export default function ExecutionButton(props) {
  const theme = useTheme()
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const classes = useStyles();
  const [currentExecution, setCurrentExecution] = React.useState('Ejecutar')

  const handleMenuItemClick = (executionName) => {
    setCurrentExecution(executionName)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) { return }
    setOpen(false)
  }

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <ButtonGroup variant={theme.buttonStyle} color="secondary" ref={anchorRef} aria-label="split button" className={classes.fab}>
          <Button
            id="execute-button-id"
            color="secondary"
            variant={theme.buttonStyle}
            startIcon={props[currentExecution].icon}
            aria-label={props[currentExecution].aria_label}
            size="medium"
            onClick={props[currentExecution].onClick}> {isMobile || currentExecution}
          </Button>
          <Button
            id="toggle-button-id"
            color="secondary"
            variant={theme.buttonStyle}
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="Elegir modo de ejecución"
            aria-haspopup="menu"
            onClick={handleToggle}> 
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {Object.keys(props).map(option => (
                      <MenuItem
                        id={option + '-id'}
                        key={option}
                        aria-label={option}
                        onClick={() => handleMenuItemClick(option)}> {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
  )
}