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
        {Object.keys(props).map((optionKey) => {
          const option = props[optionKey]; 
          return (
            <Tooltip key={optionKey} title={option.aria_label}>
              <IconButton
                id={optionKey + "-button-id"}
                onClick={option.onClick}
                aria-label={option.aria_label}
              >
                {option.icon}
              </IconButton>
            </Tooltip>
          );
        })}
      </Grid>
    </Grid>
  );
}
