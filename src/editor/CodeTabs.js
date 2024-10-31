import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Tabs, Tab } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import GetApp from '@material-ui/icons/GetApp';
import FileSaver from 'file-saver';
import { useSnackbar } from 'notistack';
import { FileValidator, codeTabsFileValidators } from '../FileValidator'

const useStyles = makeStyles((theme) => ({
  tab: {
    padding: '0px',
    minHeight: 'unset',
    textTransform: 'unset'
  },
  tabPlus: {
    padding: '0px',
    minHeight: 'unset',
    minWidth: '30px',
    fontSize: '18px'
  },
  tabs: {
    padding: theme.spacing(0, 1),
    minHeight: 'unset',
  }
}));

const SNACKBAR_CONFIG = {
  variant: 'error',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  autoHideDuration: 6000
}

export function useTabs() {
  const [currentTab, setCurrentTab] = useState(0)
  const [tabs, setTabs] = useState([{
    name: "Main",
    code: "",
    default: true
  }])

  const validTab = useMemo(() => currentTab !== tabs.length, [tabs, currentTab])

  function addTab(tab) {
    setTabs(old => {
      return [...old, tab]
    })
  }

  function removeTab(name) {
    setTabs(old => {
      return [...old.filter(t => t.name !== name)]
    })
  }

  const setCode = useCallback((value) => {
    if (validTab) {
      setTabs(old => {
        const updatedTabs = [...old];
        updatedTabs[currentTab] = {
          ...updatedTabs[currentTab],
          code: value
        };
        return updatedTabs;
      });
    }
  }, [validTab, currentTab]);
  

  return [<CodeTabs {...{ tabs, addTab, currentTab, setCurrentTab, removeTab, validTab }} />, tabs, validTab ? tabs[currentTab].code : "", setCode]
}

export default function CodeTabs({ tabs, addTab, currentTab, setCurrentTab, removeTab, validTab }) {
  const classes = useStyles();
  const hiddenFileInput = React.useRef(null);
  const { enqueueSnackbar } = useSnackbar()

  function addFile() {
    hiddenFileInput.current.click();
  }

  function processFile(event) {
    const fileUploaded = event.target.files[0];
    const reader = new FileReader();
    const validator = new FileValidator(codeTabsFileValidators)
    
    validator.validate(fileUploaded, tabs.map(t => t.name))
    if (!validator.hasErrors) {
      reader.addEventListener('load', (event) => {
        addTab({
          name: fileUploaded.name,
          code: event.target.result,
          default: false
        })
        setCurrentTab(tabs.length)
      });
      reader.readAsText(fileUploaded)
    }
    else {
      enqueueSnackbar(validator.errors, SNACKBAR_CONFIG)
    }
  }

  function saveTabAsTxt(tabName){
    const code = tabs.find( tab => tab.name === tabName).code
    var blob = new Blob([code], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, tabName + ".txt");
  }

  useEffect(() => {
    if (!validTab) {
      setCurrentTab(tabs.length - 1)
    }
  }, [setCurrentTab, validTab, tabs.length])

  return (
    <>
      <Tabs
        value={currentTab}
        className={classes.tabs}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        variant="scrollable"
      >
        {tabs.map((tab, index) => {
          return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} >
            <Tab className={classes.tab} key={tab.name} label={tab.name} onClick={() => setCurrentTab(index)} />
            <GetApp style={{ fontSize: "13px", cursor: "pointer", color: "primary" }} onClick={() => saveTabAsTxt(tab.name)} />
            {!tab.default && <CloseOutlinedIcon style={{ fontSize: "13px", cursor: "pointer", color: "red" }} onClick={() => removeTab(tab.name)} />}
          </div>
        })}
        <Tab className={classes.tabPlus} label="+" onClick={addFile} />
      </Tabs>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={processFile}
        style={{ display: 'none' }} /* Make the file input element invisible */
      />
    </>
  )
}
