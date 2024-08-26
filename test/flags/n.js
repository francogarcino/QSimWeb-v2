import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import Instructions from '../../src/qweb/instructions'
import qConfig from '../../src/qweb/qConfig'
let assert = require('assert')

beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Flag N', function () {
  it('should be 1 when ADD result starts with 1', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x7FFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.N)
  })
  it('should be 0 when ADD result starts with 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.N)
  })
  it('should be 1 when SUB result starts with 1', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.SUB(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.N)
  })
  it('should be 0 when SUB result starts with 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x00FF")),
        new Instructions.SUB(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.N)
  })
  it('should be 1 when MUL result starts with 1', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x4FFF")),
        new Instructions.MUL(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.N)
  })
  it('should be 0 when MUL result starts with 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x00FF")),
        new Instructions.MUL(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.N)
  })
  it('should be 1 when DIV result starts with 1', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.DIV(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.N)
  })
  it('should be 0 when DIV result starts with 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.DIV(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.N)
  })
})
