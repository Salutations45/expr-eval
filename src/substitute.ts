import { Expression } from './expression';
import { Instruction, I, ternaryInstruction, binaryInstruction, unaryInstruction, SimpleInstruction, ExpressionInstruction, IEXPR, IEXPREVAL, ExpressionEvaluator } from './instruction';

export default function substitute(tokens: Instruction[], variable: string, expr: Expression) {
	const newexpression: Instruction[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const item = tokens[i];
		const type = item.type;
		if (type === I.IVAR && item.value === variable) {
			for (let j = 0; j < expr.tokens.length; j++) {
				const expritem = expr.tokens[j];
				let replitem: Instruction;
				if (expritem.type === I.IOP1) {
					replitem = unaryInstruction(expritem.value);
				} else if (expritem.type === I.IOP2) {
					replitem = binaryInstruction(expritem.value);
				} else if (expritem.type === I.IOP3) {
					replitem = ternaryInstruction(expritem.value);
				} else if (expritem.type === IEXPR) {
					replitem = new ExpressionInstruction(expritem.value);
				} else if (expritem.type === IEXPREVAL) {
					replitem = new ExpressionEvaluator(expritem.value);
				} else {
					replitem = new SimpleInstruction(expritem.type, expritem.value);
				}
				newexpression.push(replitem);
			}
		} else if (type === IEXPR) {
			newexpression.push(new ExpressionInstruction(substitute(item.value, variable, expr)));
		} else {
			newexpression.push(item);
		}
	}
	return newexpression;
}
