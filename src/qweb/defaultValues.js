import { UndefinedCellValueError } from './exceptions'

class DefaultValue {
  find_subclass(cellValueName) {
    const Subclass = this.getSubclases().find(scls => scls.handles(cellValueName))
    return new Subclass(cellValueName)
  }

  getSubclases() {
    throw new Error('Not implemented')
  }

  value() {
    throw new Error('Not implemented')
  }

  getRandomNumber() {
    return (0 + Math.floor((9999 - 0) * Math.random())).toString().padStart(4, "0")
  }
}

export class DefaultCellValue extends DefaultValue {
  getSubclases() {
    return [
      ZeroValue,
      RandomValue,
      ErrorCellValue
    ]
  }
}

class ZeroValue extends DefaultCellValue {
  static handles(valueName) {
    return valueName === 'zero'
  }

  value() {
    return '0000'
  }
}

class RandomValue extends DefaultCellValue {
  static handles(valueName) {
    return valueName === 'random'
  }

  value() {
    return this.getRandomNumber()
  }
}

class ErrorCellValue extends DefaultCellValue {
  static handles(cellValueName) {
    return cellValueName === 'error'
  }

  value(cell) {
    throw new UndefinedCellValueError(`La celda ${cell} no esta inicializada`)
  }
}

export class DefaultRegisterValue extends DefaultValue {
  getSubclases() {
    return [
      ZeroValue,
      RandomValue
    ]
  }
}

export default { DefaultCellValue, DefaultRegisterValue }