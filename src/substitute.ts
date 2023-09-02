import { Expression } from './expression';
import { Instruction, I, ternaryInstruction, binaryInstruction, unaryInstruction, Instr } from './instruction';

export default function substitute(tokens: Instr[], variable: string, expr: Expression) {
	const newexpression: Instr[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const item = tokens[i];
		const type = item.type;
		if (type === I.IVAR && item.value === variable) {
			for (let j = 0; j < expr.tokens.length; j++) {
				const expritem = expr.tokens[j];
				let replitem: Instr;
				if (expritem.type === I.IOP1) {
					replitem = unaryInstruction(expritem.value);
				} else if (expritem.type === I.IOP2) {
					replitem = binaryInstruction(expritem.value);
				} else if (expritem.type === I.IOP3) {
					replitem = ternaryInstruction(expritem.value);
				} else if (expritem.type === I.IEXPR) {
					replitem = new Instruction(I.IEXPR, expritem.value);
				} else if (expritem.type === I.IEXPREVAL) {
					replitem = new Instruction(I.IEXPREVAL, expritem.value);
				} else {
					replitem = new Instruction(expritem.type, expritem.value);
				}
				newexpression.push(replitem);
			}
		} else if (type === I.IEXPR) {
			newexpression.push(new Instruction(I.IEXPR, substitute(item.value, variable, expr)));
		} else {
			newexpression.push(item);
		}
	}
	return newexpression;
}
