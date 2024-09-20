import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-language_tools"

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
  getCompletions(editor, session, pos, prefix, callback) {
    var wordList = ["ADD", "AND"];
    if (prefix === prefix.toUpperCase()) {
      callback(null, wordList.map(function(word) {
        return {
          caption: word,
          value: word,
          meta: "static"
        };
      }));
    }
  }
}