import config from './config'
export const ACTIONS_MODE_NORMAL = "normal"
export const ACTIONS_MODE_VERBOSE = "verbose"
export const ACTIONS_MODE_ULTRA_VERBOSE = "ultra-verbose"

class QConfig {
  constructor() {
    const currentConfig = JSON.parse(localStorage.getItem('qweb-config'))
    this.storage = currentConfig || {}

    /* if the config is not loaded in the storage, we set default values */
    if (!currentConfig) {
      this.set_config()
    }
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
  getLocalConfig() {
    return JSON.parse(localStorage.getItem('qweb-config')) || {};
  }
  saveConfig() {
    localStorage.setItem('qweb-config', JSON.stringify(qConfig.storage))
  }
}

const qConfig = new QConfig()

export default qConfig
