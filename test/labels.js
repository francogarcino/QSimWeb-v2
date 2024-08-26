import computer from '../src/qweb/qcomputer'
import { Register, Immediate } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
import labels from '../src/qweb/labels'
import { getHexOperandValue, getOperandValue } from './utils'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Labels', function () {
  describe('JE', function () {
    it('should jump to the correct instruction', function () {
      const r1 = new Register(1)
      const r2 = new Register(2)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFFFF")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.JE(new labels.LabelReference("fin")),
          new Instructions.MOV(r1, new Immediate("0x0003")),
          new labels.Label("fin", new Instructions.MOV(r2, new Immediate("0x0003")))
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(0, getOperandValue(r1))
      assert.strictEqual(3, getOperandValue(r2))
    })
    it('CALL with label', function () {
      const r1 = new Register(1)

      computer.load_many([{
        instructions: [
          new Instructions.CALL(new labels.LabelReference("suma3")),
        ],
        from_cell: "0x0000"
      }, {
        instructions: [
          new labels.Label("suma3", new Instructions.ADD(r1, new Immediate("0x0003"))),
          new Instructions.RET()
        ],
        from_cell: "0x0005"
      }])
      computer.execute()

      assert.strictEqual(3, getOperandValue(r1))
    })
    it('multiple CALLs with label', function () {
      const r1 = new Register(1)

      computer.load_many([{
        instructions: [
          new Instructions.CALL(new labels.LabelReference("suma3")),
        ],
        from_cell: "0x0000"
      }, {
        instructions: [
          new labels.Label("suma3", new Instructions.ADD(r1, new Immediate("0x0003"))),
          new Instructions.CALL(new labels.LabelReference("suma1")),
          new Instructions.RET()
        ],
        from_cell: "0x0005"
      }, {
        instructions: [
          new labels.Label("suma1", new Instructions.ADD(r1, new Immediate("0x0001"))),
          new Instructions.RET()
        ],
        from_cell: "0x00FF"
      }])
      computer.execute()

      assert.strictEqual(4, getOperandValue(r1))
    })
    it('JMP with label', function () {
      const r1 = new Register(1)

      computer.load_many([{
        instructions: [
          new Instructions.JMP(new labels.LabelReference("suma3")),
          new Instructions.MOV(r1, new Immediate("0x0007")),
          new labels.Label("suma3", new Instructions.ADD(r1, new Immediate("0x0003"))),
        ], from_cell: '0x0000'
      }])
      computer.execute()

      assert.strictEqual(3, getOperandValue(r1))
    })

    it('should jump backwards', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0x0001")),
          new labels.Label("ciclo", new Instructions.SUB(r1, new Immediate("0x0001"))),
          new Instructions.JE(new labels.LabelReference("ciclo"))
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual("0xFFFF", getHexOperandValue(r1))
    })
  })
})
