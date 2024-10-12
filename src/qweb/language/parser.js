import { default as grammar } from './grammar';
import { Routine } from '../routine'

const nearley = require("nearley");
const instructions = ["MOV","ADD","MUL","AND", "OR", "DIV", "CMP", "SUB"]

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
    //TODO: agregar un chequeo de que si codeToParse es '' lance una Exception

    let currentRoutine = ""
    let shouldUpdateRoutine = true

    return codeToParse.split(/\r\n|\r|\n/).reduce((acc, line, index) => {
      let { routines, errors } = acc;
      line = line.includes('#') ? line.slice(0, line.indexOf('#')) : line
      line = line.trim();
      if (!line) return acc
      try {
        const parsed_instruction = this.parse_line(line, index)
        if (parsed_instruction.instruction.assembleIn) {
          assembly_cell = parsed_instruction.instruction.assembleIn.value.slice(2)
          shouldUpdateRoutine = true

          let routine = new Routine(assembly_cell)
          routines.push(routine)
        }
        else {
          if (shouldUpdateRoutine) {
            shouldUpdateRoutine = false
            if (line.includes(":")) {
              currentRoutine = line.split(":")[0]
            }
            routines[routines.length - 1].setName(currentRoutine)
          }
          routines[routines.length - 1].add_instruction(parsed_instruction)
        }
      }
      catch (error) {
        errors.push({ error, line: index })
      }

      return { routines, errors }; 
    }, { routines: [new Routine(assembly_cell)], errors: [] })
  }

}

export class InvalidInstructionError extends Error {
  constructor(invalidCode, index) {
    super(`La linea ${index + 1} no es una instrucción valida o esta mal formulada: \n ${invalidCode} `)
    this.shorterMessage = "Instrucción no valida"
    this.invalidCode = invalidCode
    this.line = index
  }
}
export class IncompleteInstructionError extends Error {
  constructor(invalidCode, index) {
    super(`La instrucción de la linea ${index + 1} esta incompleta: \n ${invalidCode} `)
    this.shorterMessage = "Instrucción incompleta"
    this.invalidCode = invalidCode
    this.line = index
  }
}
export class ParserError extends Error {
  constructor(invalidCode, index, line) {
    const startsWithInstruction = instructions.some(instruction => invalidCode.startsWith(instruction));
    if(index === undefined && startsWithInstruction) {
      super(`La instrucción esta incompleta: \n${invalidCode}\n${" ".repeat(index)}^`)
      this.shorterMessage = `Instrucción incompleta: \n${invalidCode}\n${" ".repeat(index)}^`
      this.invalidCode = invalidCode
      this.index = index
      this.line = line
    }
    else {
      super(`Hubo un error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`)
      this.shorterMessage = `Error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`
      this.invalidCode = invalidCode
      this.index = index
      this.line = line
    }
  }
}

export default new Parser()