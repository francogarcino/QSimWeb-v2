import parser from "../src/qweb/language/parser";
import assert from "assert";

describe('Syntax Validation', function () {
    describe('Instruction format', function () {
        it('should raise an exception if a two operands instruction misses its comma', function () {
            const res = parser.parse_code("MOV R0 R1")
            assert.strictEqual(1, res.errors.length)
        })
    })
    describe('Case sensitive', function () {
        describe('Instructions follow a strict syntax', function () {
            it('should raise an exception when a full lowercase instruction is received', function () {
                const res = parser.parse_code("mov R0, R2")
                assert.strictEqual(1, res.errors.length)
            })
            it('should raise an exception when an instruction is written in a mix of lower and uppercases', function () {
                const res = parser.parse_code("moV R0, R2")
                assert.strictEqual(1, res.errors.length)
            })
        })
        describe('Modes follow a strict syntax', function () {
            it('should raise an exception if an register is typed in lowercase', function () {
                const res= parser.parse_code("MOV r0, R1")
                assert.strictEqual(1, res.errors.length)
            })
            it('should raise an exception if an immediate is typed in lowercase', function () {
                let res = parser.parse_code("MOV R0, 0X2222") // 0X is wrong
                assert.strictEqual(1, res.errors.length)

                res= parser.parse_code("MOV R0, 0xc0de") // lowercase hexadecimal digits are wrong
                assert.strictEqual(1, res.errors.length)
            })
            it('should raise an exception if an direct is typed in lowercase', function () {
                let res = parser.parse_code("MOV R0, [0X2222]") // 0X is wrong
                assert.strictEqual(1, res.errors.length)

                res = parser.parse_code("MOV R0, [0xc0de]") // lowercase hexadecimal digits are wrong
                assert.strictEqual(1, res.errors.length)
            })
            it('should raise an exception if an memory indirect is typed in lowercase', function () {
                let res = parser.parse_code("MOV R0, [[0X2222]]") // 0X is wrong
                assert.strictEqual(1, res.errors.length)

                res = parser.parse_code("MOV R0, [[0xc0de]]") // lowercase hexadecimal digits are wrong
                assert.strictEqual(1, res.errors.length)
            })
            it('should raise an exception if an register indirect is typed in lowercase', function () {
                const res= parser.parse_code("MOV R0, [r1]") // 0X is wrong
                assert.strictEqual(1, res.errors.length)
            })
        })
    })
    describe('No Q input', function () {
        it('should raise an exception when the input is not Q code', function () {
                const res = parser.parse_code("helloWorld")
                assert.strictEqual(1, res.errors.length)
        })
    })
    describe('Recursive calls detection', function () {
        it('should detect when a routine calls itself', () => {
            const res = parser.parse_code("inf: ADD R0, 0x0001 \n CALL inf")
            assert.strictEqual(1, res.recursives.length)
            const call = res.recursives[0]
            assert.strictEqual(2, call.line)
            assert.strictEqual("inf", call.recursive_call)
        });
        it('should detect when a routine would loop without end due to a JMP to its label', () => {
            const res = parser.parse_code("loop: JMP loop")
            assert.strictEqual(1, res.recursives.length)
            const call = res.recursives[0]
            assert.strictEqual(1, call.line)
            assert.strictEqual("loop", call.recursive_call)
        });
    })
})
