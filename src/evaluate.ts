import { Expression } from './Expression';
import { ExpressionInstruction, I, Instr, Instruction } from './Instruction';

export default async function evaluate(tokens: Instr[], expr: Expression, scope: { [propertyName: string]: unknown } = {}) {
	const nstack: unknown[] = [];

	if (isExpressionEvaluator(tokens)) {
		return resolveExpression(tokens, scope);
	}

	for (const item of tokens) {
		const type = item.type;
		if (type === I.INUMBER || type === I.IVARNAME) {
			nstack.push(item.value);
		} else if (type === I.IOP2) {
			const n2 = nstack.pop() as any;
			const n1 = nstack.pop() as any;
			if (item.value === 'and') {
				nstack.push(n1 ? !!await evaluate(n2, expr, scope) : false);
			} else if (item.value === 'or') {
				nstack.push(n1 ? true : !!await evaluate(n2, expr, scope));
			} else if (item.value === '=') {
				const f = expr.parser.binaryOps[item.value];
				nstack.push(f(n1, await evaluate(n2, expr, scope), scope));
			} else {
				const f = expr.parser.binaryOps[item.value];
				nstack.push(f(await resolveExpression(n1, scope), await resolveExpression(n2, scope)));
			}
		} else if (type === I.IOP3) {
			const n3 = nstack.pop() as any;
			const n2 = nstack.pop() as any;
			const n1 = nstack.pop() as any;
			if (item.value === '?') {
				nstack.push(await evaluate(n1 ? n2 : n3, expr, scope));
			} else {
				const f = expr.parser.ternaryOps[item.value];
				nstack.push(f(await resolveExpression(n1, scope), await resolveExpression(n2, scope), await resolveExpression(n3, scope)));
			}
		} else if (type === I.IVAR) {
			if (/^__proto__|prototype|constructor$/.test(item.value)) {
				throw new Error('prototype access detected');
			}
			if (item.value in expr.parser.consts) {
				nstack.push(expr.parser.consts[item.value]);
			} else if (item.value in expr.parser.unaryOps && expr.parser.isOperatorEnabled(item.value as string)) {
				nstack.push(expr.parser.unaryOps[item.value]);
			} else {
				const v = scope[item.value];
				if (v !== undefined) {
					nstack.push(v);
				} else {
					throw new Error('undefined variable: ' + item.value);
				}
			}
		} else if (type === I.IOP1) {
			const n1 = nstack.pop();
			const f = expr.parser.unaryOps[item.value];
			nstack.push(f(resolveExpression(n1, scope)));
		} else if (type === I.IFUNCALL) {
			let argCount = Number(item.value);
			const args: unknown[] = [];
			while (argCount-- > 0) {
				args.unshift(resolveExpression(nstack.pop(), scope));
			}
			const f = nstack.pop();
			if (typeof f === 'function') {
				nstack.push(await f(...args));
			} else {
				throw new Error(f + ' is not a function');
			}
		} else if (type === I.IFUNDEF) {
			const n2 = nstack.pop();
			const args: unknown[] = [];
			let argCount = Number(item.value);
			while (argCount-- > 0) {
				args.unshift(nstack.pop());
			}
			const n1 = nstack.pop();
			const f = function (...argsArray: unknown[]) {
				const functionScope = Object.assign({}, scope);
				for (let i = 0, len = args.length; i < len; i++) {
					functionScope[args[i] as string] = argsArray[i];
				}
				return evaluate(n2 as Instr[], expr, functionScope);
			};
			Object.defineProperty(f, 'name', {
				value: n1,
				writable: false
			});
			scope[n1 as string] = f;
			nstack.push(f);
		} else if (type === I.IEXPR) {
			nstack.push(createExpressionEvaluator(item, expr));
		} else if (type === I.IEXPREVAL) {
			nstack.push(item);
		} else if (type === I.IMEMBER) {
			const n1 = nstack.pop()!;
			nstack.push(n1[item.value]);
		} else if (type === I.IENDSTATEMENT) {
			nstack.pop();
		} else if (type === I.IARRAY) {
			let argCount = Number(item.value);
			const args: unknown[] = [];
			while (argCount-- > 0) {
				args.unshift(nstack.pop());
			}
			nstack.push(args);
		} else {
			throw new Error('invalid Expression');
		}
	}
	if (nstack.length > 1) {
		throw new Error('invalid Expression (parity)');
	}
	// Explicitly return zero to avoid test issues caused by -0
	return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], scope);
}

function createExpressionEvaluator(token: ExpressionInstruction, expr: Expression) {
	if (isExpressionEvaluator(token)) return token;

	return new Instruction(I.IEXPREVAL, async function (scope: { [propertyName: string]: unknown } = {}) {
		return evaluate(token.value, expr, scope);
	});
}

function isExpressionEvaluator(n: unknown): n is Instruction<I.IEXPREVAL> {
	return n instanceof Instruction && n.type === I.IEXPREVAL;
}

function resolveExpression(n: unknown, values: unknown) {
	return isExpressionEvaluator(n) ? n.value(values) : n;
}
