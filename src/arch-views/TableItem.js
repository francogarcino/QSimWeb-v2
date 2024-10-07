import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary, makeStyles, Typography, useTheme } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
  },
}));

export default function TableItem({ keyDisplay, value, details, updated }) {
  const classes = useStyles();
  const theme = useTheme()
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    if (details) {
      setExpanded(isExpanded ? panel : false);
    }
  }

  function getColor(defaultValue){
    return updated ? "secondary" : defaultValue
  }

  return (
    <Accordion expanded={expanded === keyDisplay} onChange={handleChange(keyDisplay)}>
      <AccordionSummary
        expandIcon={details ? <ExpandMoreIcon color={getColor("")}/> : false}
        aria-controls="panel1bh-content"
        id={keyDisplay}
      >
        <Typography color={getColor("")} className={classes.heading}>{updated ? <b>{keyDisplay}</b> : keyDisplay}</Typography>
        <Typography color={getColor("textSecondary")} data-test-id={keyDisplay} className={classes.secondaryHeading}>{updated ? <b>{value}</b> : value}</Typography>
      </AccordionSummary>
      {
        details && <AccordionDetails>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: theme.spacing(2) }}>
            {details.map(detail => {
              return <li>{detail.key}<b>{` ${detail.value}`}</b></li>
            })}
          </div>
        </AccordionDetails>
      }
    </Accordion>
  )
}