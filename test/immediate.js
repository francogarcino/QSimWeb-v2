import computer from '../src/qweb/qcomputer'
import { Immediate } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
let assert = require('assert')


beforeEach(async () => {
  computer.restart()
  qConfig.set_config()
})

describe('Immediate', function () {
  describe('An immediate is not a valid target', function () {
    it('should show an error', function () {
      try {
        computer.load_many([{
          instructions: [
            new Instructions.ADD(new Immediate("0x0001"), new Immediate("0x0001"))
          ], from_cell: '0x0000'
        }])
        throw new Error('Test failed')
      } catch (e) {
        assert.strictEqual("El inmediato 0x0001 no es válido como destino en la instrucción ADD", e.message)
        assert.strictEqual("immediate-as-target", e.code)
      }
    })
  })
})
