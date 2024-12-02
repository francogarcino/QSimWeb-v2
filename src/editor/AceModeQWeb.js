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
  constructor(getTabs) {
    this.routines = []
    this.getTabs = getTabs;
  }
  getCodeFromLibrary() {
    const tabs = this.getTabs();
    if (0 < tabs.length) {
      return tabs[1].code; 
    }
    console.error("Invalid session index");
    return "";
  }
  suggests = [
    {"instruction": "MOV", "description": "copia el valor", "label": false},
    {"instruction": "ADD", "description": "", "label": false},
    {"instruction": "SUB", "description": "", "label": false},
    {"instruction": "DIV", "description": "división sin resto", "label": false},
    {"instruction": "MUL", "description": "modifica R7 siempre", "label": false},

    {"instruction": "CALL", "description": "invoca una rutina", "label": true, "in_scope": false},
    {"instruction": "RET", "description": "marca el fin de una rutina", "label": false},

    {"instruction": "CMP", "description": "modifica los flags", "label": false},
    {"instruction": "JMP", "description": "", "label": true, "in_scope": true},
    {"instruction": "JE", "description": "si son iguales", "label": true, "in_scope": true},
    {"instruction": "JNE", "description": "si no son iguales", "label": true, "in_scope": true},
    {"instruction": "JLE", "description": "si es menor o igual", "label": true, "in_scope": true},
    {"instruction": "JG", "description": "si es mayor", "label": true, "in_scope": true},
    {"instruction": "JL", "description": "si es menor estricto", "label": true, "in_scope": true},
    {"instruction": "JGE", "description": "si es mayor o igual", "label": true, "in_scope": true},
    {"instruction": "JLEU", "description": "JLE, pero en BSS", "label": true, "in_scope": true},
    {"instruction": "JGU", "description": "JG, pero en BSS", "label": true, "in_scope": true},
    {"instruction": "JCS", "description": "JL, pero en BSS", "label": true, "in_scope": true},
    {"instruction": "JNEG", "description": "si se activa Negativo", "label": true, "in_scope": true},
    {"instruction": "JVS", "description": "si se activa Overflow", "label": true, "in_scope": true},

    {"instruction": "NOT", "description": "", "label": false},
    {"instruction": "AND", "description": "", "label": false},
    {"instruction": "OR", "description": "", "label": false}
  ];

  getCompletions(editor, session, pos, prefix, callback) {
    var instrucciones = qConfig.getItem("instruction")
    const line = session.getLine(pos.row).trim();

    // por alguna razon, si se intenta setear desde el CodeExecutor, no se actualizan correctamente
    const { routines: routinesFromSession } = parser.parse_code(session.getValue())
    const { routines: routinesFromLibrary } = parser.parse_code(this.getCodeFromLibrary())

    const routines = [...routinesFromSession, ...routinesFromLibrary];

    const withLabels = this.suggests.filter(s => s.label)
    const labeledMatchs = withLabels.filter(inst => line.includes(inst.instruction) && instrucciones.find(i => i.name === inst.instruction).enabled);

    // recomendación de etiquetas
    if (labeledMatchs.length > 0) {
      this.suggestions_for_labeled(line, callback, routines, pos);
      return;
    }

    // Una sola recomendación de instrucción por linea
    if (this.suggests.some(suggestion => { return line.includes(suggestion.instruction); }) ||
        line.match(/[aA][sS][sS][eE][mM][bB][lL][eE]/)) {
      callback(null, []);
      return;
    }

    // recomendación de instrucción
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

  suggestions_for_labeled(line, callback, routines, pos) {
    // TODO, deberia contemplar el caso 'label: CALL label'
    if (line.includes("CALL")) {
      callback(null, routines.map(r => {
        return {
          value: r.name
        }
      }));
    } else {
      let prevs = routines.filter(r => r.start_line < pos.row + 1)
      const current = routines[Math.max(0, prevs.length - 1)]
      if (current.labels.length > 0) {
        callback(null, current.labels.map(l => {
          return {
            value: l
          }
        }));
      }
    }
  }
}