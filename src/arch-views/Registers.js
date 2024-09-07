import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TableItem from './TableItem';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

export default function Registers({ registers }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {registers.map(register => (
        <TableItem key={register.id} keyName={register.id} keyDisplay={register.id} value={register.value} details={register.details} updated={register.updated} />
      ))}
    </div>
  );
}
