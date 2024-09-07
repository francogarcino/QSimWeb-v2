import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, Typography, Tabs, Tab, Divider, useTheme, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
    flexGrow: 1,
  },
  helpItem: {
    marginTop: theme.spacing(2),
  },
  helpSubItem: {
    marginTop: theme.spacing(1),
    textAlign: 'center'
  },
  icon: {
    width: '0.5em',
    height: '0.5em',
    marginRight: '7px',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const TABS = [
  {
    title: "General",
    value: "general",
    component: GeneralTab
  },
  {
    title: "Rutinas",
    value: "routines",
    component: RoutinesTab
  },
  {
    title: "Extras",
    value: "extra",
    component: ExtraTab
  }
]

export default function HelpDialog({ open, setOpen }) {
  const [currentTab, setCurrentTab] = useState('general')
  const CurrentTabComponent = TABS.find(tab => tab.value === currentTab).component
  const classes = useStyles()

  function handleClose() {
    setOpen(false)
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth={true} onClose={handleClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      aria-modal="true"
    >
      <DialogTitle id="form-dialog-title">Ayuda</DialogTitle>
      <IconButton autoFocus aria-label="Cerrar" className={classes.closeButton} onClick={handleClose}>
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Tabs
          id="form-dialog-description"
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {
            TABS.map(tab => <Tab label={tab.title} value={tab.value} />)
          }
        </Tabs>
        {
          <div style={{ minHeight: '350px' }}>
            <CurrentTabComponent />
          </div>
        }
      </DialogContent>
    </Dialog>
  )
}

const GENERAL_TAB_ITEMS = [
  {
    title: "Todos los registros, instrucciones pueden ser escritos tanto en minúscula como en mayúscula.",
    detail: null,
    subitem: null
  },
  {
    title: "Registros",
    detail: "Cualquier valor entre R0 y R7.",
    subitem: null
  },
  {
    title: "Instrucciones",
    detail: "Todas las instrucciones conocidas desde Q1 a Q5.",
    subitem: "Por ejemplo: MOV, ADD, SUB, CMP, RET"
  },
  {
    title: "Direccionamiento",
    detail: "Los modos de Direccionamiento desde Q1 a Q5. El valor de los operandos directo, indirecto e inmediato, debe comenzar con 0x.",
    subitem: "Por ejemplo: Directo: [0xFACE], Indirecto: [[0xBDBA]], Inmediato: 0xf0ca.",
    last: true
  },
]

function GeneralTab() {
  return <HelpItemList list={GENERAL_TAB_ITEMS} />
}

const ROUTINES_TAB_ITEMS = [
  {
    title: "Etiquetas",
    detail: "Las etiquetas sólo pueden contener letras y números, terminar con “:” (dos puntos) y no pueden contener espacios.",
    subitem: "Por ejemplo: mulPor2:"
  },
  {
    title: "Programa y rutinas",
    detail: "Nuestro programa debe estar escrito arriba de todo y abajo las rutinas.",
    subitem: null
  },
  {
    title: "Ensamblado de rutinas",
    detail: "Para cambiar el lugar donde se ensambla una rutina o nuestro programa, podemos utilizar ASSEMBLE.",
    subitem: "Por ejemplo, para ensamblar desde la celda 0x3020, podemos escribir",
    extraItems: ["[ASSEMBLE: 0x3020]", "MOV R0 R1", "RET"],
    last: true
  },
]

function RoutinesTab() {
  return <HelpItemList list={ROUTINES_TAB_ITEMS} />
}
const EXTRA_TAB_ITEMS = [
  {
    title: "Comentarios",
    detail: "Los comentarios pueden hacerse utilizando “#” (numeral) y pueden hacerse en una línea vacía o al final de una linea.",
    subitem: "Por ejemplo: #Requiere: Un numero par en R2",
  },
  {
    title: "Atajos de teclado",
    extraItems: ["Ejecutar:  ALT + R", "Guardar programa:  ALT + S"],
    last: true
  },
]

function ExtraTab() {
  return <HelpItemList list={EXTRA_TAB_ITEMS} />
}


function HelpItemList({ list }) {
  return <>
    {list.map(item => {
      return <>
        <div style={{ marginBottom: '5px' }}>
          <HelpItem title={item.title} detail={item.detail} />
          {
            item.subitem && <HelpSubItem>{item.subitem}</HelpSubItem>
          }
          {
            item.extraItems && <ExtraItems extraItems={item.extraItems} />
          }
        </div>
        {!item.last && <Divider />}
      </>
    })}
  </>
}

function HelpItem(props) {
  const classes = useStyles()
  return <div className={classes.helpItem}>
    <Typography variant="body1" style={{ fontWeight: 'bold' }} >
      <ItemIcon />
      {props.title}
    </Typography>
    {props.detail && (
      <Typography style={{ marginLeft: '5px' }} variant="body1">
        {props.detail}
      </Typography>
    )}
  </div>
}

function HelpSubItem(props) {
  const classes = useStyles()
  return <Typography className={classes.helpSubItem} variant="body2" {...props}>{props.children}</Typography>
}

function ExtraItems({ extraItems }) {
  const theme = useTheme()
  return <div style={{ display: 'flex', justifyContent: 'center' }}> {
    <div style={{ marginTop: theme.spacing(1) }}>
      {
        extraItems.map(extraItem => <ExtraItem extraItem={extraItem} />)
      }
    </div>
  }
  </div>
}

function ExtraItem({ extraItem }) {
  return <Typography variant="body2">{extraItem}</Typography>
}
function ItemIcon() {
  const classes = useStyles()
  return <FiberManualRecordIcon className={classes.icon} />
}