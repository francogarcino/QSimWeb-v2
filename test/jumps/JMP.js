import Instructions from '../../src/qweb/instructions'
import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import qConfig from '../../src/qweb/qConfig'
import { getHexOperandValue, getOperandValue } from '../utils'
var assert = require('assert')

beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Conditional Jumps', function () {
  it('JMP changes the PC to the value of source', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.JMP(new Immediate("0x0006")),
        new Instructions.MOV(r1, new Immediate("0x0003")),
        new Instructions.MOV(r2, new Immediate("0x0003"))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()
    assert.strictEqual('0xFFFF', getHexOperandValue(r1))
    assert.strictEqual(3, getOperandValue(r2))
  })
})
