

import { default as grammar } from './grammar';
import { Routine } from '../routine'
const nearley = require("nearley");

class Parser {
  parse_line(codeToParse, index) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    try {
      //Le mandamos la linea completa como feed
      parser.feed(codeToParse)
      //Si la linea completa no alcanza, quiere decir que la linea está mal formada, no hay resultados, entonces es un error
      if (parser.results.length === 0)
        throw new InvalidInstructionError(codeToParse, index)
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
    let errors = []
    //TODO: agregar un chequeo de que si codeToParse es '' lance una Exception 
    //
    return codeToParse.split(/\r\n|\r|\n/).reduce((routines, line, index) => {
      line = line.includes('#') ? line.slice(0, line.indexOf('#')) : line //Delete comments
      
      if (!line) return routines
      try {
        const parsed_instruction = this.parse_line(line, index)
        if (parsed_instruction.instruction.assembleIn) {
          assembly_cell = parsed_instruction.instruction.assembleIn.value.slice(2)
          routines.push(new Routine(assembly_cell))
        }
        else {
          routines[routines.length - 1].add_instruction(parsed_instruction)
        }
      }
      catch (error) {
        errors.push({ error, line: index })
      }
      
      return { routines, errors }; 
    }, [new Routine(assembly_cell)])
  }

}

class InvalidInstructionError extends Error {
  constructor(invalidCode, index) {
    super(`Tu programa contiene al menos una instrucción incompleta o erronea: \n\nInstrucción fallida: ${invalidCode}\nEn la linea: ${index + 1}`)
    this.shorterMessage = "Error de sintaxis"
    this.invalidCode = invalidCode
    this.line = index
  }
}

class ParserError extends Error {
  constructor(invalidCode, index, line) {
    super(`Hubo un error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`)
    this.shorterMessage = `Error de sintaxis: \n${invalidCode}\n${" ".repeat(index)}^`
    this.invalidCode = invalidCode
    this.index = index
    this.line = line
  }
}

export default new Parser()