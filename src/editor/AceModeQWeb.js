import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-language_tools"
import qConfig from "../qweb/qConfig";

// Se configura que textos se deben resaltar en color, indicando que son validos como programa
export class CustomHighlightRules extends window.ace.acequire(
  "ace/mode/text_highlight_rules"
).TextHighlightRules {
  constructor() {
    super();

    var instructionsRegex = "MOV|ADD|OR|AND|SUB|MUL|DIV|CMP|CALL|JMP|RET|JE|JNE|JLE|JG|JL|JGE|JLEU|JGU|JCS|JNEG|JVS|NOT"

    var instructions = (
      instructionsRegex
    );

    var assemble = (
        "ASSEMBLE|" +
        "assemble|"
    );

    var registers = "(?:[R]?[0-7]).{0,0}";

    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
    var hexInteger = "(?:0[x][0-9A-F][0-9A-F][0-9A-F][0-9A-F])";
    var binInteger = "(?:0[bB][01]+)";
    var integer = "(?:" + decimalInteger + "|" + hexInteger + "|" + binInteger + ")";

    var keywordMapper = this.createKeywordMapper({
        "invalid.deprecated": "easterEgg",
        "string": assemble,
        "keyword": instructions
    }, "identifier");

    this.$rules = {
      start: [
        {
          token: "support.function",
          regex: registers + "\\b"
        },
        {
          token: keywordMapper,
          regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, 
        {
          token: "constant.numeric", // integer
          regex: integer + "\\b"
        },
        {
          token : "comment",
          regex : "#.*$"
        }
      ]
    };
  }
}

export default class CustomSqlMode extends window.ace.acequire("ace/mode/python")
  .Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}

export class CustomCompleter {
  suggests = [
    {"instruction": "MOV", "description": "copia el valor"},
    {"instruction": "ADD", "description": ""},
    {"instruction": "SUB", "description": ""},
    {"instruction": "DIV", "description": "división sin resto"},
    {"instruction": "MUL", "description": "modifica R7 siempre"},

    {"instruction": "CALL", "description": "invoca la rutina indicada"},
    {"instruction": "RET", "description": "marca el fin de una rutina"},

    {"instruction": "CMP", "description": "modifica los flags"},
    {"instruction": "JMP", "description": ""},
    {"instruction": "JE", "description": "si son iguales"},
    {"instruction": "JNE", "description": "si no son iguales"},
    {"instruction": "JLE", "description": "si es menor o igual"},
    {"instruction": "JG", "description": "si es mayor"},
    {"instruction": "JL", "description": "si es menor estricto"},
    {"instruction": "JGE", "description": "si es mayor o igual"},
    {"instruction": "JLEU", "description": "JLE, pero en BSS"},
    {"instruction": "JGU", "description": "JG, pero en BSS"},
    {"instruction": "JCS", "description": "JL, pero en BSS"},
    {"instruction": "JNEG", "description": "si se activa Negativo"},
    {"instruction": "JVS", "description": "si se activa Overflow"},

    {"instruction": "NOT", "description": ""},
    {"instruction": "AND", "description": ""},
    {"instruction": "OR", "description": ""}
  ];
  getCompletions(editor, session, pos, prefix, callback) {
    var instrucciones = qConfig.getItem("instruction")
    if (prefix === prefix.toUpperCase()) {
      var active = this.suggests.filter(valid_suggestions => {
        return instrucciones.some(i =>  { return i.name === valid_suggestions.instruction && i.enabled });
      });

      callback(null, active.map(suggestion => {
        return {
          caption: suggestion.instruction,
          value: suggestion.instruction,
          meta: suggestion.description || "instrucción"
        };
      }));
    }
  }
}