import qConfig from './qConfig'
import { Operand, Immediate } from './operands'
import labels from './labels'
import { UndefinedLabel, DisabledInstructionError, DivideByZeroError, EmptyStackError } from './exceptions'
let { dec2hex, dec2bin, fixN, is_positive, is_negative, tc2dec, decimalHexTwosComplement } = require('./helper')

export class Instruction {
  static disassemble(instruction, cell_value, state) {
    const { target, source } = instruction.decode_operators(cell_value, state)
    return new instruction(target, source)
  }

  static get_by_code(code) {
    const localInstructions = qConfig.getItem('instruction')
    const activeInstructions = localInstructions.filter(i => i.enabled)
    const instructionClasses = activeInstructions.map(o => Instructions[o.name])
    let instruction = instructionClasses.find(ins => ins.has_op_code(code))

    if (!instruction) {
      instruction = Object.values(Instructions).find(ins => ins.has_op_code(code))
      instruction = localInstructions.find(o => o.name === instruction.get_name())
      throw new DisabledInstructionError(`La instruccion ${instruction.display_name} esta deshabilitada`)
    }

    return instruction
  }

  static has_op_code(code) {
    return this.op_code === code.slice(0, 4)
  }

  calculate_label(labels, state) {
    state.offset_pc(this.length())
    return labels
  }

  update_label(labels, state) {
    state.offset_pc(this.length())
    return this
  }

  length() {
    return this.get_binary().length / 16
  }

  static decode_operators(code, state) {
    return {
      target: Operand.get_by_code({ fst: 4, snd: 10 }, code).decode({ fst: 4, snd: 10 }, code, state),
      source: Operand.get_by_code({ fst: 10, snd: 16 }, code).decode({ fst: 10, snd: 16 }, code, state),
    }
  }

  constructor(target = null, source = null) {
    this.target = target
    this.source = source
    this.op_code = this.constructor.op_code
  }

  load(state) {
    state.load(this.get_binary())
  }

  get_binary() {
    return `${this.op_code}${this.target.code}${this.source.code}${this.target.binary_value()}${this.source.binary_value()}`
  }

  read_values(state) {
    return {
      sr: this.source.get_value(state),
      tg: this.target.get_value(state),
    }
  }

  execute_with_state(state) {
    const { tg, sr } = this.read_values(state)
    const dec_result = this.perform_operation(tg, sr)
    const result = dec2hex(dec_result, 16)
    this.calculate_flags(state, tg, sr, result)
    this.calculate_registers(state, dec_result)
    this.target.set_value(state, result)
  }

  calculate_flags(state, target, source, result) { }

  calculate_registers(state, result) { }

  static get_name() {
    throw new Error("Not implemented method")
  }
}


class FlagInstruction extends Instruction {
  calculate_flags(state, target, source, result) {
    state.calculate_flags(target, source, result)
    state.C = this.calculate_carry(state, target, source)
    state.V = this.calculate_overflow(target, source, result)
  }

  calculate_carry(state, target, source) {
    return this.perform_operation(target, source) >= (2 ** 16)
  }

  calculate_overflow(target, source, result) {
    return false
  }
}


class ADD extends FlagInstruction {
  perform_operation(target, source) {
    return target + source
  }

  calculate_overflow(target, source, result) {
    target = dec2hex(target, 16)
    source = dec2hex(source, 16)
    return (is_positive(target) && is_positive(source) && is_negative(result))
      || (is_negative(target) && is_negative(source) && is_positive(result))
  }

  static get_name() {
    return "ADD"
  }
}


class SUB extends FlagInstruction {
  perform_operation(target, source) {
    return target - source
  }

  calculate_carry(state, target, source) {
    return source > target
  }

  calculate_overflow(target, source, result) {
    target = dec2hex(target, 16)
    source = dec2hex(source, 16)
    return (is_negative(target) && is_positive(source) && is_positive(result))
      || (is_positive(target) && is_negative(source) && is_negative(result))
  }

  static get_name() {
    return "SUB"
  }
}


class CMP extends SUB {
  execute_with_state(state) {
    const { tg, sr } = this.read_values(state)
    const result = dec2hex(this.perform_operation(tg, sr), 16)
    this.calculate_flags(state, tg, sr, result)
  }

  static get_name() {
    return "CMP"
  }
}


class MOV extends Instruction {
  perform_operation(target, source) {
    return source
  }

  read_values(state) {
    return {
      sr: this.source.get_value(state)
    }
  }

  static get_name() {
    return "MOV"
  }
}


class MUL extends FlagInstruction {
  perform_operation(target, source) {
    return target * source
  }

  calculate_registers(state, result) {
    if (qConfig.getItem('mul_modifies_r7')) {
      state.write_register(7, decimalHexTwosComplement(result).slice(0, 4))
    }
  }

  static get_name() {
    return "MUL"
  }
}


class DIV extends FlagInstruction {
  perform_operation(target, source) {
    if (source === 0) throw new DivideByZeroError()
    return target / source
  }

  static get_name() {
    return "DIV"
  }
}


class AND extends FlagInstruction {
  perform_operation(target, source) {
    return target & source
  }

  static get_name() {
    return "AND"
  }
}


class OR extends FlagInstruction {
  perform_operation(target, source) {
    return target | source
  }

  static get_name() {
    return "OR"
  }
}


class NOT extends FlagInstruction {
  constructor(target = null) {
    super(target, null)
  }

  static disassemble(instruction, cell_value, state) {
    const { target } = instruction.decode_operators(cell_value, state)
    return new instruction(target)
  }

  static decode_operators(code, state) {
    return {
      target: Operand.get_by_code({ fst: 4, snd: 10 }, code).decode({ fst: 4, snd: 10 }, code, state),
    }
  }

  read_values(state) {
    return {
      tg: this.target.get_value(state)
    }
  }

  perform_operation(target, source) {
    return ~target
  }

  get_binary() {
    return `${this.op_code}${this.target.code}000000${this.target.binary_value()}`
  }

  static get_name() {
    return "NOT"
  }
}


class SourceOnlyInstruction extends Instruction {
  constructor(source = null) {
    if (!(source instanceof labels.LabelReference))
      super(null, source)
    else {
      super(null, null)
      this.label = source
    }
  }

  length() {
    return this.label ? 2 : this.get_binary().length / 16
  }

  static disassemble(instruction, cell_value, state) {
    const { source } = instruction.decode_operators(cell_value, state)
    return new instruction(source)
  }

  read_values(state) {
    return {
      sr: this.source.get_value(state)
    }
  }

  get_binary() {
    return `${this.op_code}000000${this.source.code}${this.source.binary_value()}`
  }

  static decode_operators(code, state) {
    return {
      source: Operand.get_by_code({ fst: 10, snd: 16 }, code).decode({ fst: 10, snd: 16 }, code, state),
    }
  }

  update_label(labels, state) {
    if (this.label) {
      const label = labels.find(x => x.label === this.label.name)
      if (label) {
        const address = dec2hex(label.address, 16)
        this.source = new Immediate(address)
      }
      else {
        throw new UndefinedLabel(`Etiqueta no encontrada: ${this.label.name}`)
      }
    }
    return super.update_label(labels, state)
  }
}


class CALL extends SourceOnlyInstruction {
  execute_with_state(state) {
    const { sr } = this.read_values(state)
    state.write_stack(state.SP, dec2hex(state.PC, 16))
    state.assign_pc(sr)
    state.SP -= 1
  }

  static get_name() {
    return "CALL"
  }
}


class RET extends Instruction {
  get_binary() {
    return `${this.op_code}000000000000`
  }

  execute_with_state(state) {
    if (state.empty_stack()){
      throw new EmptyStackError()
    }
    state.SP += 1
    state.recover_stack(state.read_memory(state.SP))
  }
  static disassemble(instruction, cell_value, state) {
    return new instruction()
  }

  static get_name() {
    return "RET"
  }
}


class JMP extends SourceOnlyInstruction {
  execute_with_state(state) {
    const { sr } = this.read_values(state)
    state.assign_pc(sr)
  }

  static get_name() {
    return "JMP"
  }
}


class ConditionalJump extends Instruction {
  constructor(label, offset = null) {
    super()
    this.prefix = this.constructor.prefix
    this.label = label
    this.offset = offset
  }

  static disassemble(instruction, cell_value, state) {
    const { offset } = instruction.decode_operators(cell_value, state)
    return new instruction("", offset)
  }

  static has_op_code(code) {
    return this.prefix === code.slice(0, 4) && this.op_code === code.slice(4, 8)
  }

  static decode_operators(code, state) {
    return {
      offset: tc2dec(code.slice(8, 16))
    }
  }

  update_label(labels, state) {
    const label = labels.find(x => x.label === this.label.name)
    if (label)
      this.offset = label.address - state.PC - 1
    else
      throw new UndefinedLabel(`Etiqueta no encontrada: ${this.label.name}`)
    return super.update_label(labels, state)
  }

  execute_with_state(state) {
    if (this.condition_matches(state)) {
      state.organic_pc = false
      state.PC += this.offset
    }
  }

  get_binary() {
    return `${this.prefix}${this.op_code}${fixN(8, dec2bin(this.offset))}`
  }
}


class JE extends ConditionalJump {
  condition_matches(state) {
    return state.Z
  }

  static get_name() {
    return "JE"
  }
}


class JNE extends ConditionalJump {
  condition_matches(state) {
    return !state.Z
  }

  static get_name() {
    return "JNE"
  }
}


class JLE extends ConditionalJump {
  condition_matches(state) {
    return state.Z || (state.N ^ state.V)
  }

  static get_name() {
    return "JLE"
  }
}


class JG extends ConditionalJump {
  condition_matches(state) {
    return !(state.Z || (state.N ^ state.V))
  }

  static get_name() {
    return "JG"
  }
}


class JL extends ConditionalJump {
  condition_matches(state) {
    return state.N ^ state.V
  }

  static get_name() {
    return "JL"
  }
}


class JGE extends ConditionalJump {
  condition_matches(state) {
    return !(state.N ^ state.V)
  }

  static get_name() {
    return "JGE"
  }
}


class JLEU extends ConditionalJump {
  condition_matches(state) {
    return state.C || state.Z
  }

  static get_name() {
    return "JLEU"
  }
}


class JGU extends ConditionalJump {
  condition_matches(state) {
    return !(state.C || state.Z)
  }

  static get_name() {
    return "JGU"
  }
}


class JCS extends ConditionalJump {
  condition_matches(state) {
    return state.C
  }

  static get_name() {
    return "JCS"
  }
}


class JNEG extends ConditionalJump {
  condition_matches(state) {
    return state.N
  }

  static get_name() {
    return "JNEG"
  }
}


class JVS extends ConditionalJump {
  condition_matches(state) {
    return state.V
  }

  static get_name() {
    return "JVS"
  }
}

MUL.op_code = '0000'
MOV.op_code = '0001'
ADD.op_code = '0010'
SUB.op_code = '0011'
CMP.op_code = '0110'
DIV.op_code = '0111'
CALL.op_code = '1011'
RET.op_code = '1100'
JE.op_code = '0001'
JNE.op_code = '1001'
JLE.op_code = '0010'
JG.op_code = '1010'
JL.op_code = '0011'
JGE.op_code = '1011'
JLEU.op_code = '0100'
JGU.op_code = '1100'
JCS.op_code = '0101'
JNEG.op_code = '0110'
JVS.op_code = '0111'
JMP.op_code = '1010'
AND.op_code = '0100'
OR.op_code = '0101'
NOT.op_code = '1001'
ConditionalJump.prefix = "1111"

const Instructions = {
  ADD,
  SUB,
  CMP,
  MOV,
  MUL,
  DIV,
  CALL,
  RET,
  JE,
  JNE,
  JLE,
  JG,
  JL,
  JGE,
  JLEU,
  JGU,
  JCS,
  JNEG,
  JVS,
  JMP,
  AND,
  OR,
  NOT,
}

export default Instructions