import computer from '../src/qweb/qcomputer'
import { Register, Immediate, Direct } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
import { getHex, getOperandValue } from './utils'
let assert = require('assert')
let { hex2dec } = require('../src/qweb/helper')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('CALL RET and STACK', function () {
  describe('CALL puts the value of PC in stack, source in the PC and decrements SP', function () {
    it('should put 0x0005 in PC', function () {
      computer.load_many([{
        instructions: [
          new Instructions.CALL(new Immediate("0x0005")),
        ], from_cell: '0x0000'
      }])
      const sp = computer.state.SP
      computer.execute_cycle()

      assert.strictEqual(2, computer.state.read_memory(hex2dec("FFEF")))
      assert.strictEqual(sp - 1, computer.state.SP)
      assert.strictEqual("0x0005",getHex(computer.state.PC))
    })

    it('should put 0xFFFF in PC', function () {
      const direct = new Direct("0x2323")
      computer.load_many([{
        instructions: [
          new Instructions.MOV(direct, new Immediate("0xFFFF")),
          new Instructions.CALL(direct),
        ], from_cell: '0x0000'
      }])
      const sp = computer.state.SP
      computer.execute_cycle()
      computer.execute_cycle()

      assert.strictEqual(5, computer.state.read_memory(hex2dec("FFEF")))
      assert.strictEqual(sp - 1, computer.state.SP)
      assert.strictEqual("0xFFFF",  getHex(computer.state.PC))
    })
  })
  describe('RET increments SP, put value of [SP] in PC', function () {
    it('should put 2 in PC', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [new Instructions.CALL(new Immediate("0x0005")),],
        from_cell: "0x0000"
      },
      {
        instructions: [
          new Instructions.MOV(r1, new Immediate("0x0003")),
          new Instructions.RET()
        ],
        from_cell: "0x0005"
      }])

      computer.execute()

      assert.strictEqual(2, computer.state.PC)
      assert.strictEqual(hex2dec("0xFFEF"), computer.state.SP)
      assert.strictEqual(3, getOperandValue(r1))
    })
  })

  describe('multiple CALLs', function () {
    it('should put 5 in R1', function () {
      const r1 = new Register(1)
      computer.load_many([{
        instructions: [new Instructions.CALL(new Immediate("0x0005")),],
        from_cell: "0x0000"
      }, {
        instructions: [
          new Instructions.MOV(r1, new Immediate("0x0003")),
          new Instructions.CALL(new Immediate("0xA005")),
          new Instructions.RET()
        ],
        from_cell: "0x0005"
      }, {
        instructions: [
          new Instructions.ADD(r1, new Immediate("0x0002")),
          new Instructions.RET()
        ],
        from_cell: "0xA005"
      }])

      computer.execute()

      assert.strictEqual(2, computer.state.PC)
      assert.strictEqual(hex2dec("0xFFEF"), computer.state.SP)
      assert.strictEqual(5, getOperandValue(r1))
    })
  })
})
