import { I, Instr } from './Instruction';

export default function expressionToString(tokens: Instr[], toJS: boolean) {
	let nstack: string[] = [];
	for (const item of tokens) {
		const type = item.type;
		if (type === I.INUMBER) {
			if (typeof item.value === 'number' && item.value < 0) {
				nstack.push('(' + item.value + ')');
			} else if (Array.isArray(item.value)) {
				nstack.push('[' + item.value.map(escapeValue).join(', ') + ']');
			} else {
				nstack.push(String(escapeValue(item.value)));
			}
		} else if (type === I.IOP2) {
			const n2 = nstack.pop()!;
			const n1 = nstack.pop()!;
			const f = item.value;
			if (toJS) {
				if (f === '^') {
					nstack.push('Math.pow(' + n1 + ', ' + n2 + ')');
				} else if (f === 'and') {
					nstack.push('(!!' + n1 + ' && !!' + n2 + ')');
				} else if (f === 'or') {
					nstack.push('(!!' + n1 + ' || !!' + n2 + ')');
				} else if (f === '==') {
					nstack.push('(' + n1 + ' === ' + n2 + ')');
				} else if (f === '!=') {
					nstack.push('(' + n1 + ' !== ' + n2 + ')');
				} else if (f === '[') {
					nstack.push(n1 + '[(' + n2 + ') | 0]');
				} else {
					nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
				}
			} else {
				if (f === '[') {
					nstack.push(n1 + '[' + n2 + ']');
				} else {
					nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
				}
			}
		} else if (type === I.IOP3) {
			const n3 = nstack.pop()!;
			const n2 = nstack.pop()!;
			const n1 = nstack.pop()!;
			const f = item.value;
			if (f === '?') {
				nstack.push('(' + n1 + ' ? ' + n2 + ' : ' + n3 + ')');
			} else {
				throw new Error('invalid Expression');
			}
		} else if (type === I.IVAR || type === I.IVARNAME) {
			nstack.push(item.value as string);
		} else if (type === I.IOP1) {
			const n1 = nstack.pop()!;
			const f = item.value;
			if (f === '-' || f === '+') {
				nstack.push('(' + f + n1 + ')');
			} else if (toJS) {
				if (f === 'not') {
					nstack.push('(' + '!' + n1 + ')');
				} else {
					nstack.push(f + '(' + n1 + ')');
				}
			} else {
				nstack.push('(' + f + ' ' + n1 + ')');
			}
		} else if (type === I.IFUNCALL) {
			let argCount = Number(item.value);
			const args: string[] = [];
			while (argCount-- > 0) {
				args.unshift(nstack.pop()!);
			}
			const f = nstack.pop();
			nstack.push(f + '(' + args.join(', ') + ')');
		} else if (type === I.IFUNDEF) {
			const n2 = nstack.pop()!;
			let argCount = Number(item.value);
			const args: string[] = [];
			while (argCount-- > 0) {
				args.unshift(nstack.pop()!);
			}
			const n1 = nstack.pop()!;
			if (toJS) {
				nstack.push('(' + n1 + ' = function(' + args.join(', ') + ') { return ' + n2 + ' })');
			} else {
				nstack.push('(' + n1 + '(' + args.join(', ') + ') = ' + n2 + ')');
			}
		} else if (type === I.IMEMBER) {
			const n1 = nstack.pop()!;
			nstack.push(n1 + '.' + item.value);
		} else if (type === I.IARRAY) {
			let argCount = Number(item.value);
			const args: string[] = [];
			while (argCount-- > 0) {
				args.unshift(nstack.pop()!);
			}
			nstack.push('[' + args.join(', ') + ']');
		} else if (item.type === I.IEXPR) {
			nstack.push('(' + expressionToString(item.value, toJS) + ')');
		} else if (type === I.IENDSTATEMENT) {
			// eslint-disable no-empty
		} else {
			throw new Error('invalid Expression');
		}
	}
	if (nstack.length > 1) {
		if (toJS) {
			nstack = [nstack.join(',')];
		} else {
			nstack = [nstack.join(';')];
		}
	}
	return String(nstack[0]);
}

function escapeValue<T>(v: T) {
	if (typeof v === 'string') {
		return JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	}
	return v;
}
