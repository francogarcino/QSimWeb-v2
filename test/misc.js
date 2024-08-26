import computer from '../src/qweb/qcomputer'
import { Register, IndirectRegister, Immediate, Direct, Indirect } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
import labels from '../src/qweb/labels'
import { getOperandValue } from './utils'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Misc', function () {
  describe('self-modifying code', function () {
    it('should put 0x0002 in R0', function () {
      const r0 = new Register(0)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(new Direct("0x0004"), new Immediate("0x0002")),
          new Instructions.ADD(r0, new Immediate("0x0000")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(2, getOperandValue(r0))
    })
    it('should put 0x0005 in R0', function () {
      const r0 = new Register(0)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(new Direct("0x000C"), new Immediate("0x0007")),
          new Instructions.MOV(new Indirect("0x000C"), new Immediate("0x0005")),
          new Instructions.ADD(r0, new Immediate("0x0000")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(5, getOperandValue(r0))
    })
    it('should put 0x0008 in R0', function () {
      const r0 = new Register(0)
      const r5 = new Register(5)
      const ir5 = new IndirectRegister(5)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r5, new Immediate("0x0005")),
          new Instructions.MOV(ir5, new Immediate("0x0008")),
          new Instructions.ADD(r0, new Immediate("0x0000")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(8, getOperandValue(r0))
    })
    it('should put 0x0008 in R0', function () {
      const r0 = new Register(0)
      /**
       * The second instruction: new Instructions.MOV(new Direct("0x0005"), new Immediate("0x1823"))
       * moves the value 0x1823 which is equal to the assemble of the instruction MOV R0 R3
       */
      computer.load_many([{
        instructions: [
          new Instructions.MOV(new Register(3), new Immediate("0x0008")),
          new Instructions.MOV(new Direct("0x0005"), new Immediate("0x1823")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(8, getOperandValue(r0))
    })
  })

  describe('large program', function () {
    it('should put 0x0020 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(new Register(1), new Immediate("0x0001")),
          new Instructions.CALL(new labels.LabelReference("mulPorDos")),
          new Instructions.CALL(new labels.LabelReference("mulPorDos")),
          new Instructions.CALL(new labels.LabelReference("mulPorDos")),
          new Instructions.CALL(new labels.LabelReference("mulPorDos")),
          new Instructions.CALL(new labels.LabelReference("mulPorDos")),
        ], from_cell: '0x0000'
      },{
        instructions: [
          new labels.Label("mulPorDos", new Instructions.MUL(r1, new Immediate("0x0002"))),
          new Instructions.RET(),
        ], from_cell: '0x2000'
      }])
      computer.execute()
      assert.strictEqual(32, getOperandValue(r1))
    })
  })
})
