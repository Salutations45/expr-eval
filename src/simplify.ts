import { Instruction, I, Instr } from './Instruction';
import { Parser } from './Parser';

export default function simplify(tokens: Instr[], parser: Parser, values: { [propertyName: string]: unknown }) {
	const nstack: Instr[] = [];
	const newexpression: Instr[] = [];
	for (const item of tokens) {
		const type = item.type;
		if (type === I.INUMBER || type === I.IVARNAME) {
			if (Array.isArray(item.value)) {
				/*
				nstack.push(...simplify(
					(item.value as any)
					.map((x: unknown) => { new Instruction(I.INUMBER, x)})
					.concat(new Instruction(I.IARRAY, item.value.length))
				, parser, values));*/
			}else {
				nstack.push(item);
			}
		} else if (type === I.IVAR && Object.keys(values).includes(item.value)) {
			nstack.push(new Instruction(I.INUMBER, values[item.value]));
		} else if (type === I.IOP2 && nstack.length > 1) {
			const n2 = nstack.pop()!;
			const n1 = nstack.pop()!;
			const f = parser.binaryOps[item.value];
			nstack.push(new Instruction(I.INUMBER, f(n1.value, n2.value)));
		} else if (type === I.IOP3 && nstack.length > 2) {
			const n3 = nstack.pop() as any;
			const n2 = nstack.pop() as any;
			const n1 = nstack.pop() as any;
			if (item.value === '?') {
				nstack.push(n1.value ? n2.value : n3.value);
			} else {
				const f = parser.ternaryOps[item.value];
				nstack.push(new Instruction(I.INUMBER, f(n1.value, n2.value, n3.value)));
			}
		} else if (type === I.IOP1 && nstack.length > 0) {
			const n1 = nstack.pop()!;
			const f = parser.unaryOps[item.value];
			nstack.push(new Instruction(I.INUMBER, f(n1.value)));
		} else if (type === I.IEXPR) {
			while (nstack.length > 0) {
				newexpression.push(nstack.shift()!);
			}
			newexpression.push(new Instruction(I.IEXPR, simplify(item.value, parser, values)));
		} else if (type === I.IMEMBER && nstack.length > 0) {
			const n1 = nstack.pop() as any;
			nstack.push(new Instruction(I.INUMBER, n1.value[item.value]));
		}
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
