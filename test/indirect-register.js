import computer from '../src/qweb/qcomputer'
import  { Register, IndirectRegister, Immediate } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
let assert = require('assert')
let { hex2dec } = require('../src/qweb/helper')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('indirect register', function () {
  describe("MOV puts the value in memory cell that register's content points to when target is indirect register", function () {
    it('should put 5 in 0xFEDE', function () {
      const r1 = new Register(1)
      const ir1 = new IndirectRegister(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFEDE")),
          new Instructions.MOV(ir1, new Immediate("0x0005")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(5, computer.state.read_memory(hex2dec("FEDE")))
    })
  })
  describe('ADD puts the sum of target and source in target', function () {
    it('should put 5 in 0xFEDE', function () {
      const r1 = new Register(1)
      const ir1 = new IndirectRegister(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFEDE")),
          new Instructions.MOV(ir1, new Immediate("0x0000")),
          new Instructions.ADD(ir1, new Immediate("0x0005"))], from_cell: '0x0000'
      }])
      computer.execute()

      assert.strictEqual(5, computer.state.read_memory(hex2dec("FEDE")))
    })

    it('should put 6 in 0xFEDE', function () {
      const r1 = new Register(1)
      const ir1 = new IndirectRegister(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFEDE")),
          new Instructions.MOV(ir1, new Immediate("0x0000")),
          new Instructions.ADD(ir1, new Immediate("0x0005")),
          new Instructions.ADD(ir1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(6, computer.state.read_memory(hex2dec("FEDE")))
    })

    it('should put 0 in 0xFEDE', function () {
      const r1 = new Register(1)
      const ir1 = new IndirectRegister(1)
      computer.load_many([{
        instructions: [
          new Instructions.MOV(r1, new Immediate("0xFEDE")),
          new Instructions.MOV(ir1, new Immediate("0xFFFF")),
          new Instructions.ADD(ir1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(0, computer.state.read_memory(hex2dec("FEDE")))
    })
  })
})
