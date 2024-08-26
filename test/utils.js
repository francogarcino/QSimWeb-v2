import { dec2hex } from '../src/qweb/helper'
import computer from '../src/qweb/qcomputer'

export function getOperandValue(operand) {
  return operand.get_value(computer.state)
}

export function getHexOperandValue(operand) {
  return getHex(getOperandValue(operand))
}

export function getHex(value){
  return `0x${dec2hex(value, 16)}`
}