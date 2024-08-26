import Instructions from '../../src/qweb/instructions'
import computer from '../../src/qweb/qcomputer'
import { Register, Immediate } from '../../src/qweb/operands'
import labels from '../../src/qweb/labels'
import qConfig from '../../src/qweb/qConfig'
import { dec2hex } from '../../src/qweb/helper'
import { getOperandValue } from '../utils'
var assert = require('assert')

beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Conditional Jumps', function () {
  it('JG should jump when number is greater', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0004")),
        new Instructions.MOV(r2, new Immediate("0x0001")),
        new Instructions.CMP(r1, r2),
        new Instructions.JG(new labels.LabelReference("salto")),
        new Instructions.MOV(r1, new Immediate("0x0002")),
        new labels.Label("salto", new Instructions.MOV(r2, new Immediate("0x0003")))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()

    assert.strictEqual(4, getOperandValue(r1))
    assert.strictEqual(3, getOperandValue(r2))
  })
  it('JG should jump when number is greater with sign', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.MOV(r2, new Immediate("0xFFFE")),
        new Instructions.CMP(r1, r2),
        new Instructions.JG(new labels.LabelReference("salto")),
        new Instructions.MOV(r1, new Immediate("0x0002")),
        new labels.Label("salto", new Instructions.MOV(r2, new Immediate("0x0003")))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()

    assert.strictEqual('0xFFFF', `0x${dec2hex(getOperandValue(r1), 16)}`)
    assert.strictEqual(3, getOperandValue(r2))
  })
  it('JG should not jump when number is equal', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFF")),
        new Instructions.MOV(r2, new Immediate("0xFFFF")),
        new Instructions.CMP(r1, r2),
        new Instructions.JG(new labels.LabelReference("salto")),
        new Instructions.MOV(r1, new Immediate("0x0002")),
        new labels.Label("salto", new Instructions.MOV(r2, new Immediate("0x0003")))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()

    assert.strictEqual(2, getOperandValue(r1))
    assert.strictEqual(3, getOperandValue(r2))
  })
  it('JG should not jump when number is lower', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0x0003")),
        new Instructions.MOV(r2, new Immediate("0x0004")),
        new Instructions.CMP(r1, r2),
        new Instructions.JG(new labels.LabelReference("salto")),
        new Instructions.MOV(r1, new Immediate("0x0002")),
        new labels.Label("salto", new Instructions.MOV(r2, new Immediate("0x0003")))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()

    assert.strictEqual(2, getOperandValue(r1))
    assert.strictEqual(3, getOperandValue(r2))
  })
  it('JG should not jump when number is lower with sign', function () {
    const r1 = new Register(1)
    const r2 = new Register(2)
    computer.load_many([{
      instructions: [
        new Instructions.MOV(r1, new Immediate("0xFFFD")),
        new Instructions.MOV(r2, new Immediate("0xFFFF")),
        new Instructions.CMP(r1, r2),
        new Instructions.JG(new labels.LabelReference("salto")),
        new Instructions.MOV(r1, new Immediate("0x0002")),
        new labels.Label("salto", new Instructions.MOV(r2, new Immediate("0x0003")))
      ],
      from_cell: "0x0000"
    }])
    computer.execute()

    assert.strictEqual(2, getOperandValue(r1))
    assert.strictEqual(3, getOperandValue(r2))
  })
})
