@{%
const invalidlabels = [
                /^R[0-7]$/gi,
                /^0x[0-9a-f]{4}$/gi,
                /^(MOV|ADD|OR|AND|SUB|MUL|DIV|CMP|CALL|JMP|RET|JE|JNE|JLE|JG|JL|JGE|JLEU|JGU|JCS|JNEG|JVS|NOT)$/gi,
                ]
%}
@builtin "whitespace.ne"

MAIN                -> _ (Label ":" __:?):* (Instruction) _{%([_, labelinfo, [[instruction]]])=>{
	return {
		label: labelinfo.length ? labelinfo[0][0] : null,
		instruction
	}
}
	%}

Instruction  		-> InstructionT1 | InstructionT2 | InstructionT3 | InstructionT4 | InstructionT5 | InstructionT6

InstructionT1       -> OperationT1 _ Operand ["," | _]:+ Operand {%
							function ([[instruction], _, [target], __, [source]]) {
								return {
									instruction,
									type: 'two_operand',
									target,
									source
								}
							}
						%}

InstructionT2       -> OperationT2 _ OperandLabel {%
							function ([[instruction], _, sr]) {
								return {
									instruction,
									type: 'one_source',
									source: sr[0].length > 0 ? sr[0][0] : sr[0]
								}
							}
					%}

InstructionT3       -> OperationT3 {%
							function ([[instruction]]) {
								return {
									instruction,
									type: 'no_operands'
								}
							}
						%}


InstructionT4       -> OperationT4 _ Label {%
							function ([[instruction], _, offset]) {
								return {
									instruction,
									type: 'relative_jump',
									offset
								}
							}
						%}

InstructionT5       -> OperationT5 _ Operand {%
							function ([[instruction], _, [target]]) {
								return {
									instruction,
									type: 'one_target',
									target
								}
							}
						%}

InstructionT6       -> OperationT6 _ OnlyInmediate "]":+{%
							function ([[instruction], _, [assembleIn]]) {
								return {
									instruction,
									type: 'one_target',
									assembleIn
								}
							}
						%}

OperationT1         -> "MOV"i
                    | "ADD"i
                    | "AND"i
                    | "OR"i
                    | "SUB"i
                    | "MUL"i
                    | "DIV"i
                    | "CMP"i

OperationT2         -> "CALL"i
			        | "JMP"i

OperationT3         -> "RET"i

OperationT4         -> "JE"i
                    | "JNE"i
                    | "JLE"i
                    | "JG"i
                    | "JL"i
                    | "JGE"i
                    | "JLEU"i
                    | "JGU"i
                    | "JCS"i
                    | "JNEG"i
                    | "JVS"i

OperationT5         -> "NOT"i

OperationT6		    -> "[ASSEMBLE:"i

Operand             -> Register
        			| Immediate
        			| Direct
        			| Indirect
        			| IndirectRegister

OperandLabel 		-> Operand | Label

OnlyInmediate	    -> Immediate

Label               -> ([a-zA-Z0-9]):+ {% function([data], _, reject) {
											const value = data.join("")
											if (invalidlabels.some(i=>value.match(i)))
												return reject
											return {
												type:'label',
												value
											}
										}
									%}

Register            -> "R"i [0-7] {%
							function([_, value]){
								return {
									type: 'register',
									value
								}
							}
						%}

Immediate           -> ("0x"i) hexdigit hexdigit hexdigit hexdigit {%
							function(data){
								return {
									type: 'immediate',
									value: data.join("")
								}
							}
						%}

Direct              -> "[" Immediate "]" {%
							function(data){
								return {
									type: 'direct',
									value: data[1].value
								}
							}
						%}

Indirect            -> "[" Direct "]"{%
							function(data){
								return {
									type: 'indirect',
									value: data[1].value
								}
							}
						%}

IndirectRegister    -> "[" Register "]"{%
							function(data){
								return {
									type: 'indirect_register',
									value: data[1].value
								}
							}
						%}

hexdigit            -> [a-fA-F0-9]
