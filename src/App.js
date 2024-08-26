
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MenuAppBar from './AppBar'
import CodeExecutor from './CodeExecutor'
import { green } from '@material-ui/core/colors';
import { SnackbarProvider } from 'notistack';
import { CssBaseline } from '@material-ui/core';
import qConfig from './qweb/qConfig';
import {isMobile} from 'react-device-detect';

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: "#a42339"
    },
    secondary: {
      main: "#0492c2"
    },
    success: green,
    bar: "primary",
  },
  buttonStyle: "contained",
  editor: "tomorrow"
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: "#a42339"
    },
    secondary: {
      main: "#0492c2"
    },
    success: green,
    background: {
      default: "#212121",
      paper: "#212121"
    },
    bar: "transparent",
  },
  buttonStyle: (isMobile ? "contained" : "outlined"),
  editor: "monokai"
})


function App() {
  const [useDark, setUseDark] = useState(Boolean(JSON.parse(localStorage.getItem('qweb-dark-mode'))))

  useEffect(() => {
    const previous_config = localStorage.getItem('qweb-config')
    const current_config = JSON.parse(qConfig.getConfig())

    if (!previous_config || previous_config.version !== current_config.version) {
      localStorage.setItem('qweb-config', JSON.stringify(current_config))
    }
  })

  useEffect(() => {
    localStorage.setItem('qweb-dark-mode', useDark)
  }, [useDark])

  return (
    <ThemeProvider theme={useDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={5} hideIconVariant>
        <MenuAppBar {...{ useDark, setUseDark }} />
        <CodeExecutor />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App;
