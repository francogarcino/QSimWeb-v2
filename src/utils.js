import { dec2hex, dec2bin, hex2dec } from './qweb/helper'

export function hexa(value) {
  return `0x${value}`
}

export function toHexa(value){
  return hexa(dec2hex(value, 16))
}

export function toBin(value){
  return String(dec2bin(hex2dec(value))).padStart(16, "0")
}

export function toDec(value){
  return hex2dec(value)
}

export function getDetails(value) {
  return [
    {
      key: 'Binario:',
      value: value === "" ? "" : toBin(value)
    },
    {
      key: 'Decimal:',
      value: value === "" ? "" : toDec(value)
    }
  ]
}
