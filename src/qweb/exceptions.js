export class ImmediateAsTarget extends Error{
	constructor(instruction) {
		super('An immediate is not a valid target')
		this.code = 'immediate-as-target'
    this.message = `El inmediato ${instruction.target.value} no es válido como destino en la instrucción ${instruction.constructor.get_name()}`
	}
}

export class DisabledInstructionError extends Error {
  constructor(message) {
    super(message)
    this.message = message
  }
}
export class IncompleteRoutineError extends Error {
  constructor() {
    super("Hubo un error, es posible que te falte un RET")
    this.message = "Hubo un error, es posible que te falte un RET"
  }
}
export class EmptyStackError extends Error {
  constructor() {
    super("Hubo un error, es posible que tengas un RET sin un CALL")
    this.message = "Hubo un error, es posible que tengas un RET sin un CALL"
  }
}

export class DisabledAddressingModeError extends Error {
  constructor(message) {
    super(message)
    this.message = message
  }
}

export class DisabledRegisterError extends Error {
  constructor(message) {
    super(message)
    this.message = message
  }
}

export class UndefinedCellValueError extends Error {
	constructor(message) {
    super(message)
    this.message = message
  }
}

export class DivideByZeroError extends Error {
	constructor() {
    super('No es posible dividir por 0')
  }
}

export class UndefinedLabel extends Error{}
export class ExcecutionFinished extends Error{}

export default {DisabledInstructionError, DisabledAddressingModeError, DisabledRegisterError, DivideByZeroError, ImmediateAsTarget, UndefinedCellValueError, UndefinedLabel}
