import Instructions from '../instructions'
import { Immediate, Register, Direct, Indirect, IndirectRegister } from '../operands'
import labels from '../labels'

const rules = {
  instructions: [
    {
      name: 'mov',
      type: 'two_operand',
      value: Instructions.MOV
    },
    {
      name: 'add',
      type: 'two_operand',
      value: Instructions.ADD
    },
    {
      name: 'sub',
      type: 'two_operand',
      value: Instructions.SUB
    },
    {
      name: 'mul',
      type: 'two_operand',
      value: Instructions.MUL
    },
    {
      name: 'cmp',
      type: 'two_operand',
      value: Instructions.CMP
    },
    {
      name: 'div',
      type: 'two_operand',
      value: Instructions.DIV
    },
    {
      name: 'and',
      type: 'two_operand',
      value: Instructions.AND
    },
    {
      name: 'or',
      type: 'two_operand',
      value: Instructions.OR
    },
    {
      name: 'call',
      type: 'one_source',
      value: Instructions.CALL
    },
    {
      name: 'jmp',
      type: 'one_source',
      value: Instructions.JMP
    },
    {
      name: 'ret',
      type: 'no_operands',
      value: Instructions.RET
    },
    {
      name: 'not',
      type: 'one_target',
      value: Instructions.NOT
    },
    {
      name: 'je',
      type: 'relative_jump',
      value: Instructions.JE
    },
    {
      name: 'jne',
      type: 'relative_jump',
      value: Instructions.JNE
    },
    {
      name: 'jle',
      type: 'relative_jump',
      value: Instructions.JLE
    },
    {
      name: 'jg',
      type: 'relative_jump',
      value: Instructions.JG
    },
    {
      name: 'jl',
      type: 'relative_jump',
      value: Instructions.JL
    },
    {
      name: 'jge',
      type: 'relative_jump',
      value: Instructions.JGE
    },
    {
      name: 'jleu',
      type: 'relative_jump',
      value: Instructions.JLEU
    },
    {
      name: 'jgu',
      type: 'relative_jump',
      value: Instructions.JGU
    },
    {
      name: 'jcs',
      type: 'relative_jump',
      value: Instructions.JCS
    },
    {
      name: 'jneg',
      type: 'relative_jump',
      value: Instructions.JNEG
    },
    {
      name: 'jvs',
      type: 'relative_jump',
      value: Instructions.JVS
    }
  ],
  instructions_types: [
    {
      name: "two_operand",
      get_operands: (parsed_line, operands) => {
        return [
          new (operands.find(o => o.name === parsed_line.target.type).value)(parsed_line.target.value),
          new (operands.find(o => o.name === parsed_line.source.type).value)(parsed_line.source.value),
        ]
      }
    },
    {
      name: "one_source",
      get_operands: (parsed_line, operands) => {
        return [
          new (operands.find(o => o.name === parsed_line.source.type).value)(parsed_line.source.value),
        ]
      }
    },
    {
      name: "no_operands",
      get_operands: (parsed_line, operands) => {
        return []
      }
    }, {
      name: "relative_jump",
      get_operands: (parsed_line, operands) => {
        return [
          new (operands.find(o => o.name === parsed_line.offset.type).value)(parsed_line.offset.value)
        ]
      }
    },
    {
      name: "one_target",
      get_operands: (parsed_line, operands) => {
        return [
          new (operands.find(o => o.name === parsed_line.target.type).value)(parsed_line.target.value),
        ]
      }
    },
  ],
  operands: [
    {
      name: 'register',
      value: Register
    },
    {
      name: 'immediate',
      value: Immediate
    },
    {
      name: 'direct',
      value: Direct
    },
    {
      name: 'indirect',
      value: Indirect
    },
    {
      name: 'indirect_register',
      value: IndirectRegister
    },
    {
      name: 'label',
      value: labels.LabelReference
    }
  ]
}

class Translator {
  constructor(rules) {
    this.rules = rules
  }

  toQ(parsed_code) {
    return parsed_code.map(parsed_line => {
      const instruction = this.get_instruction(parsed_line.instruction)
      const instruction_type = this.get_instruction_type(parsed_line.instruction)
      const operands = instruction_type.get_operands(parsed_line.instruction, this.rules.operands)
      let instructionInstance = new instruction(...operands)
      if (parsed_line.label) {
        return new labels.Label(parsed_line.label.value, instructionInstance)
      }
      return instructionInstance
    })
  }

  get_instruction(parsed_line) {
    return this.rules.instructions.find(i =>
      i.name === parsed_line.instruction.toLowerCase() &&
      i.type === parsed_line.type).value
  }

  get_instruction_type(parsed_line) {
    return this.rules.instructions_types.find(it => it.name === parsed_line.type)
  }

  translate_code(parsed_code) {
    return parsed_code
      .filter(routine => routine.instructions.length > 0)
      .map(routine => {
        return { ...routine, instructions: this.toQ(routine.instructions) }
      })
  }
}

export default new Translator(rules)
