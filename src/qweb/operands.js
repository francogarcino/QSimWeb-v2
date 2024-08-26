import qConfig from './qConfig'
import { DefaultRegisterValue } from './defaultValues'
import { DisabledAddressingModeError } from './exceptions'
var { hex2dec, dec2hex, dec2bin, bin2dec, fixN } = require('./helper')

export class Operand {
  static get_by_code(coord, code) {
    const localOperands = qConfig.getItem('addressing_mode')
    let activeOperands = localOperands.filter(o => o.enabled)
    const operandClasses = activeOperands.map(o => Operands[o.name])
    let operand = operandClasses.find(op => op.has_op_code(coord, code))

    if (!operand) {
      operand = Object.values(Operands).find(op => op.has_op_code(coord, code))
      operand = localOperands.find(o => o.name === operand.get_name())
      throw new DisabledAddressingModeError(`El modo de direccionamiento ${operand.display_name} esta deshabilitado`)
    }

    return operand
  }
}


export class Register extends Operand {
  constructor(id) {
    super()
    this.id = id
    this.value = this.get_default_value()
    this.code = `100${this.__get_code(id)}`
  }

  static get_name() {
    return "Register"
  }

  __get_code(id) {
    return fixN(3, dec2bin(id))
  }

  static has_op_code(coord, code) {
    return '100' === code.slice(coord.fst, coord.snd - 3)
  }

  static decode(coord, code, state) {
    const register_id = bin2dec(code.slice(coord.fst + 3, coord.snd))
    state.update_ir('', `R${register_id}`)
    return new Register(register_id)
  }

  binary_value() {
    return ''
  }

  set_value(state, value) {
    state.write_register(this.id, value)
  }

  get_value(state) {
    return state.read_register(this.id)
  }

  get_default_value() {
    const default_value_name = qConfig.getItem('default_value').registers
    const default_value = new DefaultRegisterValue().find_subclass(default_value_name)
    return default_value.value()
  }
}


export class IndirectRegister extends Operand {
  constructor(id) {
    super()
    this.id = id
    this.value = this.get_default_value()

    this.code = `110${this.__get_code(id)}`
  }

  static get_name() {
    return "IndirectRegister"
  }

  __get_code(id) {
    return fixN(3, dec2bin(id))
  }

  static has_op_code(coord, code) {
    return '110' === code.slice(coord.fst, coord.snd - 3)
  }

  static decode(coord, code, state) {
    const register_id = bin2dec(code.slice(coord.fst + 3, coord.snd))
    state.update_ir('', `[R${register_id}]`)
    return new IndirectRegister(register_id)
  }

  binary_value() {
    return ''
  }

  set_value(state, value) {
    state.write_memory(state.read_register(this.id), value)
  }

  get_value(state) {
    return state.read_memory(state.read_register(this.id))
  }

  get_default_value() {
    const default_value_name = qConfig.getItem('default_value').registers
    const default_value = new DefaultRegisterValue().find_subclass(default_value_name)
    return default_value.value()
  }
}


export class Immediate extends Operand {
  constructor(value) {
    super()
    this.value = value
    this.code = "000000"
  }

  static get_name() {
    return "Immediate"
  }

  static has_op_code(coord, code) {
    return '000000' === code.slice(coord.fst, coord.snd)
  }

  static decode(coord, code, state) {
    state.increment_pc()
    const ir_value = state.memory.read(state.PC)
    state.update_ir(ir_value, `0x${ir_value}`)
    return new Immediate(state.read_memory(state.PC))
  }

  get_value(state) {
    return this.value
  }

  binary_value() {
    return fixN(16, dec2bin(hex2dec(this.value)))
  }
}


export class Direct extends Operand {
  constructor(cell_id) {
    super()
    this.cell_id = cell_id
    this.code = "001000"
  }

  static get_name() {
    return "Direct"
  }

  static has_op_code(coord, code) {
    return '001000' === code.slice(coord.fst, coord.snd)
  }

  static decode(coord, code, state) {
    state.increment_pc()
    const ir_value = state.memory.read(state.PC)
    state.update_ir(ir_value, `[0x${ir_value}]`)
    return new Direct(dec2hex(state.read_memory(state.PC), 16))
  }

  set_value(state, value) {
    state.write_memory(hex2dec(this.cell_id), value)
  }

  get_value(state) {
    return state.read_memory(hex2dec(this.cell_id))
  }

  binary_value() {
    return fixN(16, dec2bin(hex2dec(this.cell_id)))
  }
}


export class Indirect extends Operand {
  constructor(cell_id) {
    super()
    this.cell_id = cell_id
    this.code = "011000"
  }

  static get_name() {
    return "Indirect"
  }

  static has_op_code(coord, code) {
    return '011000' === code.slice(coord.fst, coord.snd)
  }

  static decode(coord, code, state) {
    state.increment_pc()
    const ir_value = state.memory.read(state.PC)
    state.update_ir(ir_value, `[[0x${ir_value}]]`)
    return new Indirect(dec2hex(state.read_memory(state.PC), 16))
  }

  set_value(state, value) {
    state.write_memory(state.read_memory(hex2dec(this.cell_id)), value)
  }

  get_value(state) {
    return state.read_memory(state.read_memory(hex2dec(this.cell_id)))
  }

  binary_value() {
    return fixN(16, dec2bin(hex2dec(this.cell_id)))
  }
}


const Operands = {
  Register,
  Direct,
  Immediate,
  Indirect,
  IndirectRegister
}