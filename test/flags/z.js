import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import Instructions from '../../src/qweb/instructions'
import qConfig from '../../src/qweb/qConfig'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Flag Z', function () {
  it('should be 1 when ADD is 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.ADD(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.Z)
  })
  it('should be 0 when ADD is different than 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.ADD(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.Z)
  })
  it('should be 1 when SUB is 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0001")),
        new Instructions.SUB(r1, new Immediate("0x0001"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.Z)
  })
  it('should be 0 when ADD is different than 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x000F")),
        new Instructions.ADD(r1, new Immediate("0x0000"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.Z)
  })
  it('should be 0 when SUB is different than 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0001")),
        new Instructions.SUB(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.Z)
  })
  it('should be 1 when MUL is 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0001")),
        new Instructions.MUL(r1, new Immediate("0x0000"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.Z)
  })
  it('should be 0 when MUL is different than 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0001")),
        new Instructions.MUL(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.Z)
  })
  it('should be 1 when DIV is 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0000")),
        new Instructions.DIV(r1, new Immediate("0x0003"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(true, computer.state.Z)
  })
  it('should be 0 when DIV is different than 0', function () {
    const r1 = new Register(1)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0004")),
        new Instructions.DIV(r1, new Immediate("0x0002"))
      ], from_cell: '0x0000'
    }])
    computer.execute()
    assert.strictEqual(false, computer.state.Z)
  })
})
