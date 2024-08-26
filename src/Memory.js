import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { dec2hex } from './qweb/helper'
import { hexa } from './utils';


const useStyles = makeStyles({
  table: {
    maxHeight: 500,
    overflowX: 'hidden'
  },
});

export default function Memory({ memory }) {
  const classes = useStyles();
  let previousCell = -1
  return <>
    <TableContainer className={classes.table} component={Paper}>
      <Table size="small" aria-label="Memoria">
        <TableHead>
          <TableRow>
            <TableCell>Celda</TableCell>
            <TableCell>Valor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memory.reduce((rows, row) => {
            if (previousCell + 1 !== parseInt(row.cell))
              rows.push(
                <TableRow key={row.cell-1}>
                  <TableCell>...</TableCell>
                  <TableCell>...</TableCell>
                </TableRow>
              )
            rows.push(
              <TableRow key={row.cell}>
                <TableCell>{hexa(dec2hex(row.cell, 16))}</TableCell>
                <TableCell data-test-id={hexa(dec2hex(row.cell, 16))}>{hexa(row.value)}</TableCell>
              </TableRow>
            )
            previousCell = parseInt(row.cell)
            return rows
          }, [])}
        </TableBody>
      </Table>
    </TableContainer>
  </>
}