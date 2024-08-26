import { ACTIONS } from "./qweb/actions"
import { toHexa, hexa } from "./utils"

export class ActionType {
  static find_subclass(action) {
    const Subclass = [
      Assemble,
      ReadMemory,
      WriteMemory,
      ReadRegister,
      WriteRegister,
      WriteStack,
      AssignPC,
      UpdateIR,
    ].find(scls => scls.handles(action))

    return new Subclass(action)
  }

  constructor(action) {
    this.action = action
  }

  display() {
    throw new Error('Not implemented')
  }
}


class ReadMemory extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.READ_MEMORY
  }

  display() {
    return `Se leyó [${toHexa(this.action.data.cell)}] \nValor: ${toHexa(this.action.data.value)}`
  }
}


class WriteMemory extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.WRITE_MEMORY
  }

  display() {
    return `Se escribió [${toHexa(this.action.data.cell)}] \nValor: ${hexa(this.action.data.value)}`
  }
}


class WriteStack extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.WRITE_STACK
  }

  display() {
    return `Se escribió la pila [${toHexa(this.action.data.cell)}] \nValor: ${hexa(this.action.data.value)}`
  }
}

class AssignPC extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.ASSIGN_PC
  }

  display() {
    return `Se modificó el PC: ${toHexa(this.action.data.value)}`
  }
}

class Assemble extends ActionType {
  constructor(action) {
    super(action)
    this.color = 'warning'
  }

  static handles(action) {
    return action.name === ACTIONS.ASSEMBLE
  }

  display() {
    return `Se ensambló en la celda [${toHexa(this.action.data.cell)}] \nEl valor: ${hexa(this.action.data.value)}`
  }
}


class ReadRegister extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.READ_REGISTER
  }

  display() {
    return `Se leyó R${this.action.data.register} \nValor: ${hexa(this.action.data.value)}`
  }
}


class WriteRegister extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.WRITE_REGISTER
  }

  display() {
    return `Se escribió R${this.action.data.register} \nValor: ${hexa(this.action.data.value)}`
  }
}


class UpdateIR extends ActionType {
  static handles(action) {
    return action.name === ACTIONS.UPDATE_IR
  }

  display() {
    return `IR: ${hexa(this.action.data.ir)}`
  }
}
