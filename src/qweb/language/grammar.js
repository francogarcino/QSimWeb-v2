// Generated automatically by nearley, version 2.19.3
// http://github.com/Hardmath123/nearley
let grammar;
(function () {
function id(x) { return x[0]; }

const invalidlabels = [
                /^R[0-7]$/gi,
                /^0x[0-9a-fA-F]{4}$/gi,
                /^(MOV|ADD|OR|AND|SUB|MUL|DIV|CMP|CALL|JMP|RET|JE|JNE|JLE|JG|JL|JGE|JLEU|JGU|JCS|JNEG|JVS|NOT)$/gi,
                ]
grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "MAIN$ebnf$1", "symbols": []},
    {"name": "MAIN$ebnf$1$subexpression$1$ebnf$1", "symbols": ["__"], "postprocess": id},
    {"name": "MAIN$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "MAIN$ebnf$1$subexpression$1", "symbols": ["Label", {"literal":":"}, "MAIN$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "MAIN$ebnf$1", "symbols": ["MAIN$ebnf$1", "MAIN$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "MAIN$subexpression$1", "symbols": ["Instruction"]},
    {"name": "MAIN", "symbols": ["_", "MAIN$ebnf$1", "MAIN$subexpression$1", "_"], "postprocess": ([_, labelinfo, [[instruction]]])=>{
        	return {
        		label: labelinfo.length ? labelinfo[0][0] : null,
        		instruction
        	}
        }
        	},
    {"name": "Instruction", "symbols": ["InstructionT1"]},
    {"name": "Instruction", "symbols": ["InstructionT2"]},
    {"name": "Instruction", "symbols": ["InstructionT3"]},
    {"name": "Instruction", "symbols": ["InstructionT4"]},
    {"name": "Instruction", "symbols": ["InstructionT5"]},
    {"name": "Instruction", "symbols": ["InstructionT6"]},
    {"name": "InstructionT1$ebnf$1", "symbols": [/[","]/]},
    {"name": "InstructionT1$ebnf$1", "symbols": ["InstructionT1$ebnf$1", /["," | _]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "InstructionT1", "symbols": ["OperationT1", "_", "Operand", "InstructionT1$ebnf$1", "Operand"], "postprocess": 
        function ([[instruction], _, [target], __, [source]]) {
        	return {
        		instruction,
        		type: 'two_operand',
        		target,
        		source
        	}
        }
        						},
    {"name": "InstructionT2", "symbols": ["OperationT2", "_", "OperandLabel"], "postprocess": 
        function ([[instruction], _, sr]) {
        	return {
        		instruction,
        		type: 'one_source',
        		source: sr[0].length > 0 ? sr[0][0] : sr[0]
        	}
        }
        					},
    {"name": "InstructionT3", "symbols": ["OperationT3"], "postprocess": 
        function ([[instruction]]) {
        	return {
        		instruction,
        		type: 'no_operands'
        	}
        }
        						},
    {"name": "InstructionT4", "symbols": ["OperationT4", "_", "Label"], "postprocess": 
        function ([[instruction], _, offset]) {
        	return {
        		instruction,
        		type: 'relative_jump',
        		offset
        	}
        }
        						},
    {"name": "InstructionT5", "symbols": ["OperationT5", "_", "Operand"], "postprocess": 
        function ([[instruction], _, [target]]) {
        	return {
        		instruction,
        		type: 'one_target',
        		target
        	}
        }
        						},
    {"name": "InstructionT6$ebnf$1", "symbols": [{"literal":"]"}]},
    {"name": "InstructionT6$ebnf$1", "symbols": ["InstructionT6$ebnf$1", {"literal":"]"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "InstructionT6", "symbols": ["OperationT6", "_", "OnlyInmediate", "InstructionT6$ebnf$1"], "postprocess": 
        function ([[instruction], _, [assembleIn]]) {
        	return {
        		instruction,
        		type: 'one_target',
        		assembleIn
        	}
        }
        						},
    {"name": "OperationT1$subexpression$1", "symbols": [/[M]/, /[O]/, /[V]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$1"]},
    {"name": "OperationT1$subexpression$2", "symbols": [/[A]/, /[D]/, /[D]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$2"]},
    {"name": "OperationT1$subexpression$3", "symbols": [/[A]/, /[N]/, /[D]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$3"]},
    {"name": "OperationT1$subexpression$4", "symbols": [/[O]/, /[R]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$4"]},
    {"name": "OperationT1$subexpression$5", "symbols": [/[S]/, /[U]/, /[B]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$5"]},
    {"name": "OperationT1$subexpression$6", "symbols": [/[M]/, /[U]/, /[L]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$6"]},
    {"name": "OperationT1$subexpression$7", "symbols": [/[D]/, /[I]/, /[V]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$7"]},
    {"name": "OperationT1$subexpression$8", "symbols": [/[C]/, /[M]/, /[P]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT1", "symbols": ["OperationT1$subexpression$8"]},
    {"name": "OperationT2$subexpression$1", "symbols": [/[C]/, /[A]/, /[L]/, /[L]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT2", "symbols": ["OperationT2$subexpression$1"]},
    {"name": "OperationT2$subexpression$2", "symbols": [/[J]/, /[M]/, /[P]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT2", "symbols": ["OperationT2$subexpression$2"]},
    {"name": "OperationT3$subexpression$1", "symbols": [/[R]/, /[E]/, /[T]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT3", "symbols": ["OperationT3$subexpression$1"]},
    {"name": "OperationT4$subexpression$1", "symbols": [/[J]/, /[E]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$1"]},
    {"name": "OperationT4$subexpression$2", "symbols": [/[J]/, /[N]/, /[E]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$2"]},
    {"name": "OperationT4$subexpression$3", "symbols": [/[J]/, /[L]/, /[E]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$3"]},
    {"name": "OperationT4$subexpression$4", "symbols": [/[J]/, /[G]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$4"]},
    {"name": "OperationT4$subexpression$5", "symbols": [/[J]/, /[L]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$5"]},
    {"name": "OperationT4$subexpression$6", "symbols": [/[J]/, /[G]/, /[E]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$6"]},
    {"name": "OperationT4$subexpression$7", "symbols": [/[J]/, /[L]/, /[E]/, /[U]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$7"]},
    {"name": "OperationT4$subexpression$8", "symbols": [/[J]/, /[G]/, /[U]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$8"]},
    {"name": "OperationT4$subexpression$9", "symbols": [/[J]/, /[C]/, /[S]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$9"]},
    {"name": "OperationT4$subexpression$10", "symbols": [/[J]/, /[N]/, /[E]/, /[G]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$10"]},
    {"name": "OperationT4$subexpression$11", "symbols": [/[J]/, /[V]/, /[S]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT4", "symbols": ["OperationT4$subexpression$11"]},
    {"name": "OperationT5$subexpression$1", "symbols": [/[N]/, /[O]/, /[T]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT5", "symbols": ["OperationT5$subexpression$1"]},
    {"name": "OperationT6$subexpression$1", "symbols": [{"literal":"["}, /[aA]/, /[sS]/, /[sS]/, /[eE]/, /[mM]/, /[bB]/, /[lL]/, /[eE]/, {"literal":":"}], "postprocess": function(d) {return d.join(""); }},
    {"name": "OperationT6", "symbols": ["OperationT6$subexpression$1"]},
    {"name": "Operand", "symbols": ["Register"]},
    {"name": "Operand", "symbols": ["Immediate"]},
    {"name": "Operand", "symbols": ["Direct"]},
    {"name": "Operand", "symbols": ["Indirect"]},
    {"name": "Operand", "symbols": ["IndirectRegister"]},
    {"name": "OperandLabel", "symbols": ["Operand"]},
    {"name": "OperandLabel", "symbols": ["Label"]},
    {"name": "OnlyInmediate", "symbols": ["Immediate"]},
    {"name": "Label$ebnf$1$subexpression$1", "symbols": [/[a-zA-Z0-9]/]},
    {"name": "Label$ebnf$1", "symbols": ["Label$ebnf$1$subexpression$1"]},
    {"name": "Label$ebnf$1$subexpression$2", "symbols": [/[a-zA-Z0-9]/]},
    {"name": "Label$ebnf$1", "symbols": ["Label$ebnf$1", "Label$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Label", "symbols": ["Label$ebnf$1"], "postprocess":  function([data], _, reject) {
        	const value = data.join("")
        	if (invalidlabels.some(i=>value.match(i)))
        		return reject
        	return {
        		type:'label',
        		value
        	}
        }
        									},
    {"name": "Register$subexpression$1", "symbols": [/[R]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "Register", "symbols": ["Register$subexpression$1", /[0-7]/], "postprocess": 
        function([_, value]){
        	return {
        		type: 'register',
        		value
        	}
        }
        						},
    {"name": "Immediate$subexpression$1$subexpression$1", "symbols": [{"literal":"0"}, /[x]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "Immediate$subexpression$1", "symbols": ["Immediate$subexpression$1$subexpression$1"]},
    {"name": "Immediate", "symbols": ["Immediate$subexpression$1", "hexdigit", "hexdigit", "hexdigit", "hexdigit"], "postprocess": 
        function(data){
        	return {
        		type: 'immediate',
        		value: data.join("")
        	}
        }
        						},
    {"name": "Direct", "symbols": [{"literal":"["}, "Immediate", {"literal":"]"}], "postprocess": 
        function(data){
        	return {
        		type: 'direct',
        		value: data[1].value
        	}
        }
        						},
    {"name": "Indirect", "symbols": [{"literal":"["}, "Direct", {"literal":"]"}], "postprocess": 
        function(data){
        	return {
        		type: 'indirect',
        		value: data[1].value
        	}
        }
        						},
    {"name": "IndirectRegister", "symbols": [{"literal":"["}, "Register", {"literal":"]"}], "postprocess": 
        function(data){
        	return {
        		type: 'indirect_register',
        		value: data[1].value
        	}
        }
        						},
    {"name": "hexdigit", "symbols": [/[A-F0-9]/]}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
export default grammar;
