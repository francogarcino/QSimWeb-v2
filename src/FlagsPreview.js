import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { useTheme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
    chip: {
        margin: "1px"
    },
}));
export default function FlagsPreview({ flags }) {
    const classes = useStyles();
    const theme = useTheme()

    function getChips() {
        return flags.map(flag =>
            <Grid item sm={6} md={3}>
                <Tooltip title={`${flag.name}: ${flag.value ? "Encendido" : "Apagado"}`}>
                    <Chip
                        className={classes.chip}
                        variant={theme.buttonStyle}
                        color={flag.updated ? "secondary" : ""}
                        label={`${flag.key}: ${flag.value | 0}`}
                    />
                </Tooltip>
            </Grid>)
    }

    return (
        <Grid container>
            {getChips()}
        </Grid>
    )
}