import computer from '../src/qweb/qcomputer'
import { Immediate, Direct } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
let assert = require('assert')
let { hex2dec } = require('../src/qweb/helper')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('direct', function () {
  describe('MOV puts the value in memory when target is direct', function () {
    it('should put 0x0005 in 0x2323', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{ instructions: [new Instructions.MOV(direct, new Immediate("0x0005"))], from_cell: '0x0000' }])
      computer.execute()

      assert.strictEqual(5, computer.state.read_memory(hex2dec("2323")))
    })
  })
  describe('ADD puts the sum of target and source in target', function () {
    it('should put 5 in 0x2323', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{ instructions: [new Instructions.MOV(direct, new Immediate("0x0000")), new Instructions.ADD(direct, new Immediate("0x0005"))], from_cell: '0x0000' }])
      computer.execute()
      assert.strictEqual(5, computer.state.read_memory(hex2dec("2323")))
    })

    it('should put 6 in 0x2323', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0x0000")),
          new Instructions.ADD(direct, new Immediate("0x0005")),
          new Instructions.ADD(direct, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(6, computer.state.read_memory(hex2dec("2323")))
    })

    it('should put 10 in 0x2323', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0x0000")),
          new Instructions.ADD(direct, new Immediate("0x0005")),
          new Instructions.ADD(direct, direct),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(10, computer.state.read_memory(hex2dec("2323")))
    })

    it('should put 0 in 0x2323', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFFFF")),
          new Instructions.ADD(direct, new Immediate("0x0001")),
        ], from_cell: '0x0000'
      }])
      computer.execute()
      assert.strictEqual(0, computer.state.read_memory(hex2dec("2323")))
    })
  })
})
