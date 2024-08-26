import computer from '../src/qweb/qcomputer'
import { Register, Immediate } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
import { getHexOperandValue, getOperandValue } from './utils'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Logical Operations', function () {
  describe('AND', function () {
    it('should perform the AND between bits of operands and store its result in target', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0x0003")),
          new Instructions.AND(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(1, getOperandValue(r1))
    })
  })
  describe('OR', function () {
    it('should perform the OR between bits of operands and store its result in target', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFFF3")),
          new Instructions.OR(r1, new Immediate("0xFFF1")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual("0xFFF3", getHexOperandValue(r1))
    })
  })
  describe('NOT', function () {
    it('should perform the NOT of target and store its result in target', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFFF3")),
          new Instructions.NOT(r1),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(12, getOperandValue(r1))
    })
  })
})
