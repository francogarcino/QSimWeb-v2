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

describe('arithmetic', function () {
  describe('ADD puts the sum of target and source in target', function () {
    it('should put 5 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.ADD(r1, new Immediate("0x0005"))], from_cell: '0x0000' }])
      computer.execute()
      assert.strictEqual(5, getOperandValue(r1))
    })

    it('should put 6 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.ADD(r1, new Immediate("0x0005")), new Instructions.ADD(r1, new Immediate("0x0001"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(6, getOperandValue(r1))
    })

    it('should put 0 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.ADD(r1, new Immediate("0xFFFF")), new Instructions.ADD(r1, new Immediate("0x0001"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(0, getOperandValue(r1))
    })
  })
  describe('SUB puts the substraction of target and source in target', function () {
    it('should put 4 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0005")), new Instructions.SUB(r1, new Immediate("0x0001"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(4, getOperandValue(r1))
    })
    it('should put ffff in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0000")), new Instructions.SUB(r1, new Immediate("0x0001"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual("0xFFFF", getHexOperandValue(r1))
    })
  })
  describe('MUL puts the product of target and source in target', function () {
    it('should put 4 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0001")), new Instructions.MUL(r1, new Immediate("0x0004"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(4, getOperandValue(r1))
    })
    it('should put 0 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x8000")), new Instructions.MUL(r1, new Immediate("0x0002"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(0, getOperandValue(r1))
    })
  })
  describe('MUL puts the 16 most significant bits in R7', function () {
    it('should put 0001 in R7 when mul_modifies_r7 is true', function () {
      qConfig.setItem('mul_modifies_r7', true)
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x8000")), new Instructions.MUL(r1, new Immediate("0x0002"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(1, computer.state.read_register(7))
    })
    it('should not modify R7 when mul_modifies_r7 is false', function () {
      qConfig.setItem('mul_modifies_r7', false)
      const r1 = new Register(1)
      const r7 = new Register(7)
      computer.load_many([{ instructions: [new Instructions.MOV(r7, new Immediate("0x0004")), new Instructions.MOV(r1, new Immediate("0x8000")), new Instructions.MUL(r1, new Immediate("0x0002"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(4, getOperandValue(r7))
    })
  })
  describe('DIV puts the division of target and source in target', function () {
    it('should put 4 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0009")), new Instructions.DIV(r1, new Immediate("0x0002"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(4, getOperandValue(r1))
    })
    it('should put 0 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0001")), new Instructions.DIV(r1, new Immediate("0x0002"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(0, getOperandValue(r1))
    })
  })
  describe('MOV puts the source in target', function () {
    it('should put 0x0005 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{ instructions: [new Instructions.MOV(r1, new Immediate("0x0005"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(5, getOperandValue(r1))
    })
  })
  describe('CMP calculates the substraction of target and source but do not stores the result', function () {
    it('should calculate the flags', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0x0005")),
          new Instructions.CMP(r1, new Immediate("0x0005"))
        ], from_cell: '0x0000'
      }])
      computer.execute()

      assert.strictEqual(5, getOperandValue(r1))
      assert.strictEqual(true, computer.state.Z)
      assert.strictEqual(false, computer.state.N)
      assert.strictEqual(false, computer.state.C)
      assert.strictEqual(false, computer.state.V)
    })
  })
})
