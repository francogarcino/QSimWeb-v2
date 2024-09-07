import React from 'react';
import { Paper, Typography, useTheme } from "@material-ui/core";


export function ResultTitle({ title }) {
  const theme = useTheme()
  return (
    <Paper elevation={2}>
      <Typography style={{ padding: theme.spacing(0.5, 0), marginBottom: '0.05rem' }} component="h2" aria-label={title} variant="body1" align="center">{title}</Typography>
    </Paper>
  )
}