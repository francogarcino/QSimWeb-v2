import Instructions from '../src/qweb/instructions'
import computer from '../src/qweb/qcomputer'
import { Register, Immediate, Direct } from '../src/qweb/operands'
import { DisabledInstructionError, DisabledRegisterError, IncompleteRoutineError, DivideByZeroError, UndefinedCellValueError, UndefinedLabel, DisabledAddressingModeError, EmptyStackError } from '../src/qweb/exceptions'
import labels from '../src/qweb/labels'
import qConfig from '../src/qweb/qConfig'
var assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})


describe('Error handling', function () {
  describe('When ADD is disabled and try to run a program with an ADD instruction', function () {
    it('Should raise DisabledInstructionError error', function () {
      const r1 = new Register(1)
      qConfig.setItem("instruction", [{ "name": "ADD", "enabled": false, "display_name": "ADD" }])
      computer.load_many([{ instructions: [new Instructions.ADD(r1, new Immediate("0x0005"))], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, DisabledInstructionError, "La instruccion ADD esta deshabilitada")
    })
  })
  describe('When R7 is disabled and try to read that register', function () {
    it('Should raise DisabledRegisterError error', function () {
      const r7 = new Register(7)
      const r1 = new Register(1)
      qConfig.set_config()
      qConfig.setItem('registers_number', 5)
      computer.restart()
      computer.load_many([{ instructions: [new Instructions.MOV(r1, r7)], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, DisabledRegisterError, "El registro R7 esta deshabilitado")
    })
  })
  describe('When R7 is disabled and try to write that register', function () {
    it('Should raise DisabledRegisterError error', function () {
      const r7 = new Register(7)
      qConfig.set_config()
      qConfig.setItem('registers_number', 5)
      computer.restart()
      computer.load_many([{ instructions: [new Instructions.MOV(r7, new Immediate('0x2000'))], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, DisabledRegisterError, "El registro R7 esta deshabilitado")
    })
  })
  describe('When label is not defined', function () {
    it('should raise UndefinedLabel error if not defined', function () {
      const r1 = new Register(1)
      const r2 = new Register(2)
      const load = () => {
        computer.load_many([{
          instructions: [
            new Instructions.MOV(r1, new Immediate("0xFFFF")),
            new Instructions.ADD(r1, new Immediate("0x0001")),
            new Instructions.JE(new labels.LabelReference("fin")),
            new Instructions.MOV(r1, new Immediate("0x0003")),
            new Instructions.MOV(r2, new Immediate("0x0003")),
          ], from_cell: '0x0000'
        }])
      }
      assertError(load, UndefinedLabel, "Etiqueta no encontrada: fin")
    })
    it('should raise UndefinedLabel error if not defined CALL', function () {
      const r1 = new Register(1)
      const r2 = new Register(2)
      const load = () => {
        computer.load_many([{
          instructions: [
            new Instructions.MOV(r1, new Immediate("0xFFFF")),
            new Instructions.ADD(r1, new Immediate("0x0001")),
            new Instructions.CALL(new labels.LabelReference("fin")),
            new Instructions.MOV(r1, new Immediate("0x0003")),
            new Instructions.MOV(r2, new Immediate("0x0003")),
          ], from_cell: '0x0000'
        }])
      }
      assertError(load, UndefinedLabel, "Etiqueta no encontrada: fin")
    })
  })
  describe('When try to read an uninitialized cell and default value of uninitialized cell is empty', function () {
    it('Should raise UndefinedCellValueError error', function () {
      qConfig.setItem('default_value', { 'cells': 'error', 'registers': 'zero' })
      computer.load_many([{ instructions: [new Instructions.ADD(new Direct("0xffff"), new Immediate("0x0001"))], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, UndefinedCellValueError, "La celda FFFF no esta inicializada")
    })
  })
  describe('When Register is disabled and try to run a program with an Register addressing mode', function () {
    it('Should raise DisabledAddressingModeError error', function () {
      const r1 = new Register(1)
      qConfig.setItem('addressing_mode', [{
        name: "Register",
        enabled: false,
        display_name: "Registro"
      }, {
        name: "Immediate",
        enabled: true
      }])
      computer.load_many([{ instructions: [new Instructions.ADD(r1, new Immediate("0x0005"))], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, DisabledAddressingModeError, "El modo de direccionamiento Registro esta deshabilitado")
    })
  })
  describe('When dividing by zero', function () {
    it('Should raise DivideByZeroError error', function () {
      computer.load_many([{ instructions: [new Instructions.DIV(new Register(1), new Immediate("0x0000"))], from_cell: '0x0000' }])
      assertError(function () { computer.execute() }, DivideByZeroError, "No es posible dividir por 0")
    })
  })
  describe('When a routine has a missing RET', function () {
    it('Should raise IncompleteRoutineError error', function () {
      computer.load_many([
        {
          instructions: [
            new Instructions.CALL(new labels.LabelReference("routine")),
          ],
          from_cell: '0x0000'
        },
        {
          instructions: [
            new labels.Label("routine", new Instructions.MOV(new Register(0), new Register(2))),
          ],
          from_cell: '0x2000'
        }
      ])
      assertError(function () { computer.execute() }, IncompleteRoutineError, "Hubo un error, es posible que te falte un RET")
    })
  })
  describe('When a routine has a RET with empty stack', function () {
    it('Should raise EmptyStackError error', function () {
      const r2 = new Register(2)
      computer.load_many([
        {
          instructions: [
            new Instructions.MOV(r2, new Immediate("0x0003")),
            new Instructions.RET(),
          ],
          from_cell: '0x0002'
        },
      ])
      assertError(function () { computer.execute() }, EmptyStackError, "Hubo un error, es posible que tengas un RET sin un CALL")
    })
    it('Should raise EmptyStackError error', function () {
      const r2 = new Register(2)
      computer.load_many([
        {
          instructions: [
            new Instructions.MOV(r2, new Immediate("0x0003")),
            new Instructions.RET(),
          ],
          from_cell: '0x0000'
        },
      ])
      assertError(function () { computer.execute() }, EmptyStackError, "Hubo un error, es posible que tengas un RET sin un CALL")
    })
  })
})

function assertError(func, error, message) {
  assert.throws(
    func,
    function (err) { return err instanceof error && err.message === message }
  )
}