import parser from "../src/qweb/language/parser";
import assert from "assert";
import { ParserError, InvalidInstructionError } from '../src/qweb/language/parser'

describe('Syntax Validation', function () {
    describe('Instruction format', function () {
        it('should raise an exception if a two operands instruction misses its comma', function () {
            assert.throws(
                () => parser.parse_code("MOV R0 R1"),
                ParserError
            )
        })
    })
    describe('Case sensitive', function () {
        describe('Instructions follow a strict syntax', function () {
            it('should raise an exception when a full lowercase instruction is received', function () {
                assert.throws(
                    () => parser.parse_code("mov R0, R2"),
                    ParserError
                )
            })
            it('should raise an exception when an instruction is written in a mix of lower and uppercases', function () {
                assert.throws(
                    () => parser.parse_code("moV R0, R2"),
                    ParserError
                )
            })
        })
        describe('Modes follow a strict syntax', function () {
            it('should raise an exception if an register is typed in lowercase', function () {
                assert.throws(
                    () => parser.parse_code("MOV r0, R1"),
                    ParserError
                )
            })
            it('should raise an exception if an immediate is typed in lowercase', function () {
                assert.throws(
                    () => parser.parse_code("MOV R0, 0X2222"), // 0X is wrong
                    ParserError
                )

                assert.throws(
                    () => parser.parse_code("MOV R0, 0xc0de"), // lowercase hexadecimal digits are wrong
                    ParserError
                )
            })
            it('should raise an exception if an direct is typed in lowercase', function () {
                assert.throws(
                    () => parser.parse_code("MOV R0, [0X2222]"), // 0X is wrong
                    ParserError
                )

                assert.throws(
                    () => parser.parse_code("MOV R0, [0xc0de]"), // lowercase hexadecimal digits are wrong
                    ParserError
                )
            })
            it('should raise an exception if an memory indirect is typed in lowercase', function () {
                assert.throws(
                    () => parser.parse_code("MOV R0, [[0X2222]]"), // 0X is wrong
                    ParserError
                )

                assert.throws(
                    () => parser.parse_code("MOV R0, [[0xc0de]]"), // lowercase hexadecimal digits are wrong
                    ParserError
                )
            })
            it('should raise an exception if an register indirect is typed in lowercase', function () {
                assert.throws(
                    () => parser.parse_code("MOV R0, [r1]"), // 0X is wrong
                    ParserError
                )
            })
        })
    })
    describe('No Q input', function () {
        it('should raise an exception when the input is not Q code', function () {
            assert.throws(
                () => parser.parse_code("helloWorld"),
                InvalidInstructionError
            )
        })
    })
})
