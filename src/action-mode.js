import { ACTIONS } from "./qweb/actions"
import { ACTIONS_MODE_NORMAL, ACTIONS_MODE_VERBOSE, ACTIONS_MODE_ULTRA_VERBOSE } from "./qweb/qConfig"

export class ActionMode {
  static find_modeclass(actionMode) {
    const Subclass = [
      ActionModeNormal,
      ActionModeVerbose,
      ActionModeUltraVerbose,
    ].find(scls => scls.handles(actionMode))

    return new Subclass()
  }

  display() {
    throw new Error('Not implemented')
  }

  mappings() {
    return []
  }

  map_computer_action(computerAction) {
    const mapping = this.mappings().find(mapping => mapping.from === computerAction.name)

    return mapping ? { ...computerAction, name: mapping.to } : computerAction
  }
}

class ActionModeNormal extends ActionMode {
  valid_action_types() {
    return [
      ACTIONS.READ_MEMORY,
      ACTIONS.WRITE_MEMORY,
      ACTIONS.READ_REGISTER,
      ACTIONS.WRITE_REGISTER,
    ]
  }

  mappings() {
    return [
      {
        from: ACTIONS.ASSEMBLE,
        to: ACTIONS.WRITE_MEMORY
      },
      {
        from: ACTIONS.WRITE_STACK,
        to: ACTIONS.WRITE_MEMORY
      }
    ]
  }

  static handles(mode) {
    return mode === ACTIONS_MODE_NORMAL
  }
}

class ActionModeVerbose extends ActionMode {
  valid_action_types() {
    return [
      ACTIONS.READ_MEMORY,
      ACTIONS.WRITE_MEMORY,
      ACTIONS.READ_REGISTER,
      ACTIONS.WRITE_REGISTER,
      ACTIONS.ASSEMBLE,
    ]
  }

  static handles(mode) {
    return mode === ACTIONS_MODE_VERBOSE
  }
}

class ActionModeUltraVerbose extends ActionMode {
  valid_action_types() {
    return [
      ACTIONS.READ_MEMORY,
      ACTIONS.WRITE_MEMORY,
      ACTIONS.READ_REGISTER,
      ACTIONS.WRITE_REGISTER,
      ACTIONS.ASSEMBLE,
      ACTIONS.WRITE_STACK,
      ACTIONS.ASSIGN_PC,
      ACTIONS.UPDATE_IR
    ]
  }

  static handles(mode) {
    return mode === ACTIONS_MODE_ULTRA_VERBOSE
  }
}