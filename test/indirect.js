import computer from '../src/qweb/qcomputer'
import { Immediate, Direct, Indirect } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
let assert = require('assert')
let { hex2dec } = require('../src/qweb/helper')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('indirect', function () {
  describe("MOV puts the value in memory cell that target's content points to when target is indirect", function () {
    it('should put 5 in 0xFEDE', function () {
      const indirect = new Indirect("0x2323")
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFEDE")),
          new Instructions.MOV(indirect, new Immediate("0x0005")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(5, computer.state.read_memory(hex2dec("FEDE")))
    })
  })
  describe('ADD puts the sum of target and source in target', function () {
    it('should put 5 in 0xFEDE', function () {
      const direct = new Direct("0x2323")
      const indirect = new Indirect("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFEDE")),
          new Instructions.MOV(indirect, new Immediate("0x0000")),
          new Instructions.ADD(indirect, new Immediate("0x0005"))], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(5, computer.state.read_memory(hex2dec("FEDE")))
    })

    it('should put 6 in 0xFEDE', function () {
      const direct = new Direct("0x2323")
      const indirect = new Indirect("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFEDE")),
          new Instructions.MOV(indirect, new Immediate("0x0000")),
          new Instructions.ADD(indirect, new Immediate("0x0005")),
          new Instructions.ADD(indirect, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(6, computer.state.read_memory(hex2dec("FEDE")))
    })

    it('should put 0 in 0xFEDE', function () {
      const direct = new Direct("0x2323")
      const indirect = new Indirect("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFEDE")),
          new Instructions.MOV(indirect, new Immediate("0xFFFF")),
          new Instructions.ADD(indirect, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(0, computer.state.read_memory(hex2dec("FEDE")))
    })

    it('should put 10 in 0xFEDE', function () {
      const indirect = new Indirect("0x2323")
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFEDE")),
          new Instructions.MOV(indirect, new Immediate("0x0005")),
          new Instructions.ADD(indirect, indirect),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(10, computer.state.read_memory(hex2dec("FEDE")))
    })

  })
})
