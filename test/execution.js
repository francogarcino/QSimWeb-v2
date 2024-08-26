import computer from '../src/qweb/qcomputer'
import { Register, Immediate, Direct } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
import { getOperandValue } from './utils'
let assert = require('assert')
let { dec2hex, hex2dec } = require('../src/qweb/helper')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Execution', function () {
  describe('execute_cycle shows correct values in registers first step', function () {
    it('should put 0x0001 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()

      assert.strictEqual(1, getOperandValue(r1))
    })
    it('should put 2 in PC', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()

      assert.strictEqual(2, computer.state.PC)
    })
    it('should put 1 in MAR', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()

      assert.strictEqual(1, computer.state.MAR)
    })
    it('should put 10 in MBR', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x000A")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()

      assert.strictEqual(10, computer.state.MBR)
    })
  })
  describe('execute_cycle shows correct values in registers second step', function () {
    it('should put 2 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()
      computer.execute_cycle()

      assert.strictEqual(2, getOperandValue(r1))
    })
    it('should put 4 in PC', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()
      computer.execute_cycle()

      assert.strictEqual(4, computer.state.PC)
    })
    it('should put 1 in MAR', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0001")),
          new Instructions.ADD(r1, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()
      computer.execute_cycle()

      assert.strictEqual(3, computer.state.MAR)
    })
    it('should put 10 in MBR', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x000A")),
          new Instructions.ADD(r1, new Immediate("0x000F")),
        ], from_cell: '0x0000'
      }])
      computer.execute_cycle()
      computer.execute_cycle()

      assert.strictEqual(15, computer.state.MBR)
    })
  })
  describe('when executing an instruction', function () {
    it('should assemble the target value and then the source value', function () {
      computer.load_many([{
        instructions: [
          new Instructions.MOV(new Direct("0x2020"), new Immediate("0x2021")),
        ], from_cell: '0x0000'
      }])
      computer.execute()

      assert.strictEqual('1200', dec2hex(computer.state.read_memory(0), 16))
      assert.strictEqual('2020', dec2hex(computer.state.read_memory(1), 16))
      assert.strictEqual('2021', dec2hex(computer.state.read_memory(2), 16))
    })
    it('should read the source value and then the target value', function () {
      computer.load_many([{
        instructions: [
          new Instructions.ADD(new Direct("0x20ff"), new Direct("0x2021")),
        ], from_cell: '0x0000'
      }])
      computer.execute()

      const targetIndex = computer.state.actions.findIndex(action => action.name === 'read_memory' && action.data.cell === hex2dec('20ff'))
      const sourceIndex = computer.state.actions.findIndex(action => action.name === 'read_memory' && action.data.cell === hex2dec('2021'))
      assert.ok(targetIndex > sourceIndex)
    })
  })
})
