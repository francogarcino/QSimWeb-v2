import React from 'react'
import { Typography, makeStyles } from '@material-ui/core'
import packageJSON from '../../package.json'

const useStyles = makeStyles((theme) => (
  {
    version: {
      display: 'flex',
      justifyContent: 'right',
      position: 'absolute',
      bottom: '2px',
      right: '5px',
      width: '100%'
    }
  }
))

export default function AppVersion() {
  const classes = useStyles()
  return (
    <div className={classes.version}>
      <Typography variant="caption">QWeb - Versión {packageJSON.version}</Typography>
    </div>
  )
}