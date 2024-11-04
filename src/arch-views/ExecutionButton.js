import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { isMobile } from "react-device-detect";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  fab: isMobile
    ? {
        position: "absolute",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
      }
    : {},
}));

export default function ExecutionButton(props) {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={classes.fab}
    >
      <Grid item xs={12}>
        {Object.keys(props).map((key) => (
          <Tooltip key={key} title={props[key].aria_label}>
            <IconButton
              onClick={props[key].onClick}
              aria-label={props[key].aria_label}
            >
              {props[key].icon}
            </IconButton>
          </Tooltip>
        ))}
      </Grid>
    </Grid>
  );
}
