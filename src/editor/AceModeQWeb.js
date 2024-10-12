import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-language_tools"
import qConfig from "../qweb/qConfig";
import parser from "../qweb/language/parser";

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
  constructor() {
    this.routines = []
  }
  suggests = [
    {"instruction": "MOV", "description": "copia el valor", "label": false},
    {"instruction": "ADD", "description": "", "label": false},
    {"instruction": "SUB", "description": "", "label": false},
    {"instruction": "DIV", "description": "división sin resto", "label": false},
    {"instruction": "MUL", "description": "modifica R7 siempre", "label": false},

    {"instruction": "CALL", "description": "invoca la rutina indicada", "label": true},
    {"instruction": "RET", "description": "marca el fin de una rutina", "label": false},

    {"instruction": "CMP", "description": "modifica los flags", "label": false},
    {"instruction": "JMP", "description": "", "label": true},
    {"instruction": "JE", "description": "si son iguales", "label": true},
    {"instruction": "JNE", "description": "si no son iguales", "label": true},
    {"instruction": "JLE", "description": "si es menor o igual", "label": true},
    {"instruction": "JG", "description": "si es mayor", "label": true},
    {"instruction": "JL", "description": "si es menor estricto", "label": true},
    {"instruction": "JGE", "description": "si es mayor o igual", "label": true},
    {"instruction": "JLEU", "description": "JLE, pero en BSS", "label": true},
    {"instruction": "JGU", "description": "JG, pero en BSS", "label": true},
    {"instruction": "JCS", "description": "JL, pero en BSS", "label": true},
    {"instruction": "JNEG", "description": "si se activa Negativo", "label": true},
    {"instruction": "JVS", "description": "si se activa Overflow", "label": true},

    {"instruction": "NOT", "description": "", "label": false},
    {"instruction": "AND", "description": "", "label": false},
    {"instruction": "OR", "description": "", "label": false}
  ];
  getCompletions(editor, session, pos, prefix, callback) {
    var instrucciones = qConfig.getItem("instruction")
    const line = session.getLine(pos.row).trim();

    // por alguna razon, si se intenta setear desde el CodeExecutor, no se actualizan correctamente
    const { routines, errors } = parser.parse_code(session.getValue())

    const test = [ {"name": "alguna rutina"} ]
    const instructionsWithLabels = this.suggests.filter(s => s.label)

    if (instructionsWithLabels.some(inst => {return line.startsWith(inst.instruction)})) {
      callback(null, routines.map(r => {
        return {
          value: r.name
        }
      }));
      return;
    }

    if (this.suggests.some(suggestion => { return line.includes(suggestion.instruction); })) {
      callback(null, []);
      return;
    }

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