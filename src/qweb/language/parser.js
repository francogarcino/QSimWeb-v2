import {default as grammar} from './grammar';
import {Routine} from '../routine'

const nearley = require("nearley");
const instructions = ["MOV", "ADD", "MUL", "AND", "OR", "DIV", "CMP", "SUB"]

class Parser {
    parse_line(codeToParse, index) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
        try {
            //Le mandamos la linea completa como feed
            parser.feed(codeToParse)
            //Chequeo si la linea empieza con una instrucción valida
            const startsWithInstruction = instructions.some(instruction => codeToParse.startsWith(instruction));
            //Si la linea completa no alcanza, quiere decir que la linea está mal formada, no hay resultados, entonces es un error
            if (parser.results.length === 0 && startsWithInstruction) {
                //Si no tengo resultados y la linea empieza con una instrucción de Q1, entonces es una instrucción incompleta
                throw new IncompleteInstructionError(codeToParse, index)
            }
            if (parser.results.length === 0) {
                //En caso de que no empiece con una instrucción, no es una instrucción válida.
                throw new InvalidInstructionError(codeToParse, index)
            }
            //Si no lanzó error, tiene que haber un resultado válido
            //Nearley devuelve una lista de resultados válidos porque permite ambigüedad en gramáticas
            //La nuestra no es ambigua, entonces usamos el primer resultado.
            return parser.results[0]
        } catch (error) {
            if (error instanceof InvalidInstructionError)
                throw error
            throw new ParserError(parser.lexer.buffer, error.offset, index)
        }
    }

    parse_code(codeToParse) {
        let assembly_cell = '0000'
        let code_lines = codeToParse.split(/\r\n|\r|\n/)
        let first_with_code = code_lines.find(line => !line.startsWith("#") && line.trim() !== "")
        
        let currentRoutine = (first_with_code !== undefined && first_with_code.includes(":")) ? first_with_code.split(":")[0] : ""
        let shouldUpdateRoutine = true

        const result = code_lines.reduce((acc, line, index) => {
            let { routines, errors, recursives } = acc;
            line = line.includes('#') ? line.slice(0, line.indexOf('#')) : line;
            line = line.trim();
            if (!line) return acc;
            
            try {
                const parsed_instruction = this.parse_line(line, index);
                if (parsed_instruction.instruction.assembleIn) {
                    assembly_cell = parsed_instruction.instruction.assembleIn.value.slice(2);
                    shouldUpdateRoutine = true;
    
                    let routine = new Routine(assembly_cell);
                    routines.push(routine);
                } else {
                    let recursive_body = !shouldUpdateRoutine && line.includes(currentRoutine) && currentRoutine.trim() !== "";
                    let recursive_declaration = (line.split(" ").filter(string => string.includes(currentRoutine)).length > 1) && currentRoutine.trim() !== "";
                    this.detect_recursion(recursive_body, recursive_declaration, recursives, currentRoutine, index);
    
                    const __ret = this.update_metadata(shouldUpdateRoutine, line, currentRoutine, routines, index);
                    shouldUpdateRoutine = __ret.shouldUpdateRoutine;
                    currentRoutine = __ret.currentRoutine;
                    routines[routines.length - 1].add_instruction(parsed_instruction);
                }
            } catch (error) {
                errors.push({ error, line: index });
            }
            return { routines, errors, recursives };
        }, { routines: [new Routine(assembly_cell)], errors: [], recursives: [] });

        return result;
    }

    validate_duplicated(code) {
        const names = code.map(r => r.name);
        const uniqueNames = new Set(names);
        if (names.length > uniqueNames.size) {
            throw new DuplicatedNameError();
        }
    }

    validate_empty_code(code) {
        let code_lines = code.split(/\r\n|\r|\n/)
        let first_with_code = code_lines.find(line => !line.startsWith("#") && line.trim() !== "")
        if (first_with_code === undefined) {
            throw new EmptyCode()
        }
    }

    validate_commons_code(code) {
        let code_lines = code.split(/\r\n|\r|\n/);
        let without_comments_or_blanks = code_lines.filter(line => !line.trim().startsWith("#") && line.trim() !== '')
        
        if (without_comments_or_blanks.length === 0) {
            return;
        }

        if (!this.validate_start_with_assemble(without_comments_or_blanks[0])) {
            throw new CommonsTabError();
        }
    }

    validate_start_with_assemble(code) {
        let regex = /^\[assemble:/i;
        return regex.test(code)
    }

    update_metadata(shouldUpdateRoutine, line, currentRoutine, routines, index) {
        if (shouldUpdateRoutine) {
            shouldUpdateRoutine = false
            if (line.includes(":")) {
                currentRoutine = line.split(":")[0]
            }
            routines[routines.length - 1].setName(currentRoutine)
            routines[routines.length - 1].setEditorLine(index + 1)
        } else {
            if (line.includes(":")) {
                routines[routines.length - 1].labels.push(line.split(":")[0])
            }
        }
        return {shouldUpdateRoutine, currentRoutine};
    }

    detect_recursion(recursive_body, recursive_declaration, recursives, currentRoutine, index) {
        if (recursive_body || recursive_declaration) {
            recursives.push({
                recursive_call: currentRoutine,
                line: index + 1
            })
        }
    }
}

export class DuplicatedNameError extends Error { constructor() { super(`Alguna rutina esta definida más de una vez`) } }

export class DuplicatedDirectionError extends Error { constructor() { super(`---`) } }

export class CommonsTabError extends Error { constructor() { super("Todas las rutinas de la biblioteca deben explicitar donde se ensamblan") } }

export class EmptyCode extends Error { constructor() { super("No hay código Q para ensamblar y ejecutar") } }

export class InvalidInstructionError extends Error {
    constructor(invalidCode, index) {
        super(`La línea ${index + 1} no es una instrucción válida o está mal formulada: \n ${invalidCode} `)
        this.shorterMessage = "Instrucción no valida"
        this.invalidCode = invalidCode
        this.line = index
    }
}

export class IncompleteInstructionError extends Error {
    constructor(invalidCode, index) {
        super(`La instrucción de la linea ${index + 1} está incompleta: \n ${invalidCode} `)
        this.shorterMessage = "Instrucción incompleta"
        this.invalidCode = invalidCode
        this.line = index
    }
}

export class ParserError extends Error {
    constructor(invalidCode, index, line) {
        const startsWithInstruction = instructions.some(instruction => invalidCode.startsWith(instruction));
        if (index === undefined && startsWithInstruction) {
            super(`La instrucción está incompleta: \n${invalidCode}\n${" ".repeat(index)}^`)
            this.shorterMessage = `Instrucción incompleta: \n${invalidCode}\n${" ".repeat(index)}^`
            this.invalidCode = invalidCode
            this.index = index
            this.line = line
        } else {
            super(`Hubo un error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`)
            this.shorterMessage = `Error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`
            this.invalidCode = invalidCode
            this.index = index
            this.line = line
        }
    }
}

export default new Parser()