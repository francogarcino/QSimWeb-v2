import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import Instructions from '../../src/qweb/instructions'
import qConfig from '../../src/qweb/qConfig'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Flag C', function () {
  it('should be 1 when ADD result exceeds cell size', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.C)
  })
  it('should be 0 when ADD result is lower than cell size', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.C)
  })
  it('should be 1 when SUB source is greater than target', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0009")),
        new Instructions.SUB(r1, new Immediate("0xFFFF"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.C)
  })
  it('should be 0 when SUB source is lower than target', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.SUB(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.C)
  })
  it('should be 0 when SUB source is equal than target', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.SUB(r1, new Immediate("0x7FFF"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.C)
  })
  it('should be 1 when MUL result exceeds cell size', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.MUL(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.C)
  })
  it('should be 0 when MUL result is lower than cell size', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.MUL(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.C)
  })
  it('should be 0 for DIV', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.DIV(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.C)
  })
})
