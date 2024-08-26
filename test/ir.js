import computer from '../src/qweb/qcomputer'
import { Register, Immediate, Direct } from '../src/qweb/operands'
import Instructions from '../src/qweb/instructions'
import qConfig from '../src/qweb/qConfig'
let assert = require('assert')


beforeEach(async () => {
    computer.restart()
    qConfig.set_config()
})

describe('IR', function () {
    describe('The program MOV r1 r2', function () {
        it('should put 1862(MOV) in the IR', function () {
            computer.load_many([{
                instructions: [new Instructions.MOV(new Register(1), new Register(2)),],
                from_cell: "0x0000"
            }])

            computer.execute()

            assert.strictEqual('1862', computer.state.IR)
        })
    })
    describe('The program MOV r1 0x0001', function () {
        it('should put 18400001 in the IR', function () {
            computer.load_many([{
                instructions: [new Instructions.MOV(new Register(1), new Immediate("0x0001")),],
                from_cell: "0x0000"
            }])

            computer.execute()

            assert.strictEqual('18400001', computer.state.IR)
        })
    })
    describe('The program MOV [0x0002] 0x0001', function () {
        it('should put 120000020001 in the IR', function () {
            computer.load_many([{
                instructions: [new Instructions.MOV(new Direct('0x0002'), new Immediate("0x0001")),],
                from_cell: "0x0000"
            }])

            computer.execute()

            assert.strictEqual('120000020001', computer.state.IR)
        })
    })
    describe('The program MOV [0x0002] 0x0001 /n MOV R1 R2', function () {
        it('should put 1862 in the IR', function () {
            computer.load_many([{
                instructions: [
                    new Instructions.MOV(new Direct('0x0002'), new Immediate("0x0001")),
                    new Instructions.MOV(new Register(1), new Register(2)),],
                from_cell: "0x0000"
            }])

            computer.execute()

            assert.strictEqual('1862', computer.state.IR)
        })
    })
})