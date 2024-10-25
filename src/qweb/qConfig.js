import config from './config'
import q1 from '../qweb/configs/q1.json'
import q2 from '../qweb/configs/q2.json'
import q3 from '../qweb/configs/q3.json'
import q4 from '../qweb/configs/q4.json'
import q5 from '../qweb/configs/q5.json'
import q6 from '../qweb/configs/q6.json'
export const ACTIONS_MODE_NORMAL = "normal"
export const ACTIONS_MODE_VERBOSE = "verbose"
export const ACTIONS_MODE_ULTRA_VERBOSE = "ultra-verbose"
const defaultConfigs = [
  { value: 'Q1', enabled: false, autocomplete: false, file: q1 },
  { value: 'Q2', enabled: false, autocomplete: false, file: q2 },
  { value: 'Q3', enabled: false, autocomplete: false, file: q3 },
  { value: 'Q4', enabled: false, autocomplete: false, file: q4 },
  { value: 'Q5', enabled: false, autocomplete: false, file: q5 },
  { value: 'Q6', enabled: true, autocomplete: false, file: q6 },
];
class QConfig {
  constructor() {
    const currentConfig = JSON.parse(localStorage.getItem('qweb-config'))
    this.storage = currentConfig || {}
    /* if the config is not loaded in the storage, we set default values */
    if (!currentConfig) {
      this.set_config()
    }
    const savedConfigs =localStorage.getItem('configurations');
      savedConfigs ? this.configs = JSON.parse(savedConfigs) : 
      this.configs = defaultConfigs
  }

  setItem(key, value) {
    this.storage[key] = value || '';
  }

  getItem(key) {
    return key in this.storage ? this.storage[key] : null;
  }

  set_config() {
    this.setItem('registers_number', config["registers_number"])
    this.setItem('mul_modifies_r7', config["mul_modifies_r7"])
    this.setItem('default_value', config["default_value"])
    this.setItem('actions_mode', config['actions_mode'])
    this.setItem("addressing_mode", config["addressing_mode"])
    this.setItem('instruction', config["instruction"])
  }

  getConfig() {
    return JSON.stringify(config)
  }
  getConfigs() {
    const savedConfigs = localStorage.getItem('configurations');
    return savedConfigs ? JSON.parse(savedConfigs) : defaultConfigs;
  }
  setConfigs(configs) {
    localStorage.setItem('configurations', JSON.stringify(configs));
    this.configs = configs
  }
  removeSavedConfigs() {
    localStorage.removeItem('configurations')
  }
  getLocalConfig() {
    return JSON.parse(localStorage.getItem('qweb-config')) || {};
  }
  saveConfig() {
    localStorage.setItem('qweb-config', JSON.stringify(qConfig.storage))
  }
}

const qConfig = new QConfig()

export default qConfig
