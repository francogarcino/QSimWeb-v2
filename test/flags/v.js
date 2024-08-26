import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import Instructions from '../../src/qweb/instructions'
import qConfig from '../../src/qweb/qConfig'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Flag V', function () {
  it('should be 1 when ADD operands are positive and result is negative', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.V)
  })
  it('should be 1 when ADD operands are negative and result is positive', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.ADD(r1, new Immediate("0x8000"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.V)
  })
  it('should be 1 when SUB with a negative target and positive source is positive', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x8000")),
        new Instructions.SUB(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.V)
  })
  it('should be 1 when SUB with a positive target and negative source is negative', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.SUB(r1, new Immediate("0xFFFF"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.V)
  })
})
