import { Register, Indirect, IndirectRegister, Immediate, Direct } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import translator from '../src/qweb/language/translator'
import labels from '../src/qweb/labels'
let assert = require('assert')

describe('Translator cases', function () {
  describe('Two operands translation', function () {
    it('should return an ADD with R1 as target and [0x3333] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "ADD",
          type: "two_operand",
          target: {
            type: "register",
            value: 1
          },
          source: {
            type: "direct",
            value: "0x3333"
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.ADD)
      assert.ok(instruction.target instanceof Register)
      assert.strictEqual(1, instruction.target.id)
      assert.ok(instruction.source instanceof Direct)
      assert.strictEqual("0x3333", instruction.source.cell_id)
    })
    it('should return a CMP with [R1] as target and 0x3333 as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "CMP",
          type: "two_operand",
          target: {
            type: "indirect_register",
            value: 1
          },
          source: {
            type: "immediate",
            value: "0x3333"
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.CMP)
      assert.ok(instruction.target instanceof IndirectRegister)
      assert.strictEqual(1, instruction.target.id)
      assert.ok(instruction.source instanceof Immediate)
      assert.strictEqual("0x3333", instruction.source.value)
    })
    it('should return a SUB with [[0x3232]] as target and [R3] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "SUB",
          type: "two_operand",
          target: {
            type: "indirect",
            value: "0x3232"
          },
          source: {
            type: "indirect_register",
            value: 3
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.SUB)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof IndirectRegister)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return a MOV with [0x3232] as target and R3 as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "MOV",
          type: "two_operand",
          target: {
            type: "direct",
            value: "0x3232"
          },
          source: {
            type: "register",
            value: 3
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.MOV)
      assert.ok(instruction.target instanceof Direct)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof Register)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return a MUL with [[0x3232]] as target and [[0x3232]] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "MUL",
          type: "two_operand",
          target: {
            type: "indirect",
            value: "0x3232"
          },
          source: {
            type: "indirect",
            value: '0x3232'
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.MUL)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof Indirect)
      assert.strictEqual("0x3232", instruction.source.cell_id)
    })
    it('should return a DIV with [[0x3232]] as target and [R3] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "DIV",
          type: "two_operand",
          target: {
            type: "indirect",
            value: "0x3232"
          },
          source: {
            type: "indirect_register",
            value: 3
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.DIV)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof IndirectRegister)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return an AND with [[0x3232]] as target and [R3] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "AND",
          type: "two_operand",
          target: {
            type: "indirect",
            value: "0x3232"
          },
          source: {
            type: "indirect_register",
            value: 3
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.AND)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof IndirectRegister)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return an OR with [[0x3232]] as target and [R3] as source', function () {

      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "OR",
          type: "two_operand",
          target: {
            type: "indirect",
            value: "0x3232"
          },
          source: {
            type: "indirect_register",
            value: 3
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.OR)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual("0x3232", instruction.target.cell_id)
      assert.ok(instruction.source instanceof IndirectRegister)
      assert.strictEqual(3, instruction.source.id)
    })
  })

  describe('Two operands with label translation', function () {
    it('should return a label with an instruction with R2 as target and [0x3333] as source', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'suma'
        },
        instruction: {
          instruction: "ADD",
          type: "two_operand",
          target: {
            type: "register",
            value: 1
          },
          source: {
            type: "direct",
            value: "0x3333"
          }
        }
      }])

      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("suma", label_instruction.name)
      assert.ok(instruction instanceof Instructions.ADD)
      assert.ok(instruction.target instanceof Register)
      assert.strictEqual(1, instruction.target.id)
      assert.ok(instruction.source instanceof Direct)
      assert.strictEqual("0x3333", instruction.source.cell_id)
    })
  })

  describe('No operands translation', function () {
    it('should return a RET', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "RET",
          type: "no_operands",
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.RET)
    })
  })

  describe('No operands with label translation', function () {
    it('should return a RET', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'retorno'
        },
        instruction: {
          instruction: "RET",
          type: "no_operands",
        }
      }])

      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("retorno", label_instruction.name)
      assert.ok(instruction instanceof Instructions.RET)
    })
  })

  describe('One source translation', function () {
    it('should return a JMP with 0x3333 as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JMP",
          type: "one_source",
          source: {
            type: "immediate",
            value: "0x3333"
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.JMP)
      assert.ok(instruction.source instanceof Immediate)
      assert.strictEqual("0x3333", instruction.source.value)
    })
    it('should return a CALL with R3 as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "CALL",
          type: "one_source",
          source: {
            type: "register",
            value: 3
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.CALL)
      assert.ok(instruction.source instanceof Register)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return a JMP with [R3] as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JMP",
          type: "one_source",
          source: {
            type: "indirect_register",
            value: 3
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.JMP)
      assert.ok(instruction.source instanceof IndirectRegister)
      assert.strictEqual(3, instruction.source.id)
    })
    it('should return a CALL with [[0x4444]] as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "CALL",
          type: "one_source",
          source: {
            type: "indirect",
            value: '0x4444'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.CALL)
      assert.ok(instruction.source instanceof Indirect)
      assert.strictEqual('0x4444', instruction.source.cell_id)
    })
    it('should return a JMP with [0x4444] as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JMP",
          type: "one_source",
          source: {
            type: "direct",
            value: '0x4444'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.JMP)
      assert.ok(instruction.source instanceof Direct)
      assert.strictEqual('0x4444', instruction.source.cell_id)
    })
    it('should return a CALL with label as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "CALL",
          type: "one_source",
          source: {
            type: "label",
            value: 'rutina'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.CALL)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual('rutina', instruction.label.name)
    })
    it('should return a JMP with label as source', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JMP",
          type: "one_source",
          source: {
            type: "label",
            value: 'rutina'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.JMP)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual('rutina', instruction.label.name)
    })
  })

  describe('One source with label translation', function () {
    it('should return a label with a CALL instruction with label as source', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'retorno'
        },
        instruction: {
          instruction: "CALL",
          type: "one_source",
          source: {
            type: "label",
            value: 'rutina'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("retorno", label_instruction.name)
      assert.ok(instruction instanceof Instructions.CALL)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual('rutina', instruction.label.name)
    })
  })

  describe('One target translation', function () {
    it('should return a NOT with 0x3333 as target', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "immediate",
            value: "0x3333"
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof Immediate)
      assert.strictEqual("0x3333", instruction.target.value)
    })
    it('should return a NOT with R3 as target', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "register",
            value: 3
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof Register)
      assert.strictEqual(3, instruction.target.id)
    })
    it('should return a NOT with [R3] as target', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "indirect_register",
            value: 3
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof IndirectRegister)
      assert.strictEqual(3, instruction.target.id)
    })
    it('should return a NOT with [[0x4444]] as target', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "indirect",
            value: '0x4444'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof Indirect)
      assert.strictEqual('0x4444', instruction.target.cell_id)
    })
    it('should return a NOT with [0x4444] as target', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "direct",
            value: '0x4444'
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const instruction = result[0]
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof Direct)
      assert.strictEqual('0x4444', instruction.target.cell_id)
    })
  })

  describe('One target with label translation', function () {
    it('should return a label with a NOT instruction with label as target', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'retorno'
        },
        instruction: {
          instruction: "NOT",
          type: "one_target",
          target: {
            type: "register",
            value: 3
          },
        }
      }])

      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("retorno", label_instruction.name)
      assert.ok(instruction instanceof Instructions.NOT)
      assert.ok(instruction.target instanceof Register)
      assert.strictEqual(3, instruction.target.id)
    })
  })

  describe('Relative jump translation', function () {
    it('should return a JE with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JE",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JE)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JNE with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JNE",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JNE)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JLE with label as offset', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'etiqueta'
        },
        instruction: {
          instruction: "JLE",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("etiqueta", label_instruction.name)
      assert.ok(instruction instanceof Instructions.JLE)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JG with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JG",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JG)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JL with label as offset', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'etiqueta'
        },
        instruction: {
          instruction: "JL",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("etiqueta", label_instruction.name)
      assert.ok(instruction instanceof Instructions.JL)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JGE with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JGE",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JGE)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JLEU with label as offset', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'etiqueta'
        },
        instruction: {
          instruction: "JLEU",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("etiqueta", label_instruction.name)
      assert.ok(instruction instanceof Instructions.JLEU)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JGU with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JGU",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JGU)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JCS with label as offset', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'etiqueta'
        },
        instruction: {
          instruction: "JCS",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("etiqueta", label_instruction.name)
      assert.ok(instruction instanceof Instructions.JCS)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JNEG with label as offset', function () {
      const result = translator.toQ([{
        label: null,
        instruction: {
          instruction: "JNEG",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const instruction = result[0]

      assert.ok(instruction instanceof Instructions.JNEG)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
    it('should return a JVS with label as offset', function () {
      const result = translator.toQ([{
        label: {
          type: 'label',
          value: 'etiqueta'
        },
        instruction: {
          instruction: "JVS",
          type: "relative_jump",
          offset: {
            type: "label",
            value: "fin"
          },
        }
      }])
      assert.strictEqual(1, result.length)
      const label_instruction = result[0]
      const instruction = label_instruction.instruction

      assert.ok(label_instruction instanceof labels.Label)
      assert.strictEqual("etiqueta", label_instruction.name)
      assert.ok(instruction instanceof Instructions.JVS)
      assert.ok(instruction.label instanceof labels.LabelReference)
      assert.strictEqual("fin", instruction.label.name)
    })
  })
})
