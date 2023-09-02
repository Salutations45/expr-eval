import { Instruction, I, SimpleInstruction, IEXPR, ExpressionInstruction } from './instruction';
import { Value } from './value';

export default function simplify(tokens, unaryOps, binaryOps, ternaryOps, values: Value) {
	const nstack: Instruction[] = [];
	const newexpression: Instruction[] = [];
	let n1, n2, n3;
	let f;
	for (let i = 0; i < tokens.length; i++) {
		let item = tokens[i];
		const type = item.type;
		if (type === I.INUMBER || type === I.IVARNAME) {
			if (Array.isArray(item.value)) {
				nstack.push(...simplify(item.value.map(function (x) {
					return new SimpleInstruction(I.INUMBER, x);
				}).concat(new SimpleInstruction(I.IARRAY, item.value.length)), unaryOps, binaryOps, ternaryOps, values));
			} else {
				nstack.push(item);
			}
		} else if (type === I.IVAR && Object.keys(values).includes(item.value)) {
			item = new SimpleInstruction(I.INUMBER, values[item.value]);
			nstack.push(item);
		} else if (type === I.IOP2 && nstack.length > 1) {
			n2 = nstack.pop();
			n1 = nstack.pop();
			f = binaryOps[item.value];
			item = new SimpleInstruction(I.INUMBER, f(n1.value, n2.value));
			nstack.push(item);
		} else if (type === I.IOP3 && nstack.length > 2) {
			n3 = nstack.pop();
			n2 = nstack.pop();
			n1 = nstack.pop();
			if (item.value === '?') {
				nstack.push(n1.value ? n2.value : n3.value);
			} else {
				f = ternaryOps[item.value];
				item = new SimpleInstruction(I.INUMBER, f(n1.value, n2.value, n3.value));
				nstack.push(item);
			}
		} else if (type === I.IOP1 && nstack.length > 0) {
			n1 = nstack.pop();
			f = unaryOps[item.value];
			item = new SimpleInstruction(I.INUMBER, f(n1.value));
			nstack.push(item);
		} else if (type === IEXPR) {
			while (nstack.length > 0) {
				newexpression.push(nstack.shift()!);
			}
			newexpression.push(new ExpressionInstruction(simplify(item.value, unaryOps, binaryOps, ternaryOps, values)));
		} else if (type === I.IMEMBER && nstack.length > 0) {
			n1 = nstack.pop();
			nstack.push(new SimpleInstruction(I.INUMBER, n1.value[item.value]));
		}// eslint-disable-line
		/* else if (type === IARRAY && nstack.length >= item.value) {
			var length = item.value;
			while (length-- > 0) {
				newexpression.push(nstack.pop());
			}
			newexpression.push(new Instruction(IARRAY, item.value));
		} */ else {
			while (nstack.length > 0) {
				newexpression.push(nstack.shift()!);
			}
			newexpression.push(item);
		}
	}
	while (nstack.length > 0) {
		newexpression.push(nstack.shift()!);
	}
	return newexpression;
}
