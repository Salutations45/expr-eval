import contains from './contains';

export function add(a: any, b: any) {
	return a + b;
}

export function sub(a: unknown, b: unknown) {
	return Number(a) - Number(b);
}

export function mul(a: unknown, b: unknown) {
	return Number(a) * Number(b);
}

export function div(a: unknown, b: unknown) {
	return Number(a) / Number(b);
}

export function mod(a: unknown, b: unknown) {
	return Number(a) % Number(b);
}

export function concat(a: unknown, b: unknown) {
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.concat(b);
	}
	return '' + a + b;
}

export function equal(a: unknown, b: unknown) {
	return a === b;
}

export function notEqual(a: unknown, b: unknown) {
	return a !== b;
}

export function greaterThan(a: unknown, b: unknown) {
	return Number(a) > Number(b);
}

export function lessThan(a: unknown, b: unknown) {
	return Number(a) < Number(b);
}

export function greaterThanEqual(a: unknown, b: unknown) {
	return Number(a) >= Number(b);
}

export function lessThanEqual(a: unknown, b: unknown) {
	return Number(a) <= Number(b);
}

export function andOperator(a: unknown, b: unknown) {
	return Boolean(a && b);
}

export function orOperator(a: unknown, b: unknown) {
	return Boolean(a || b);
}

export function inOperator(a: unknown, b: unknown) {
	return contains(b, a);
}

export function neg(a: unknown) {
	return -Number(a);
}

export function not(a: unknown) {
	return !a;
}

export function random(a: unknown) {
	return Math.random() * (Number(a) || 1);
}

export function stringOrArrayLength(s: unknown) {
	if (Array.isArray(s)) {
		return s.length;
	}
	return String(s).length;
}

export function condition(cond: unknown, yep: unknown, nope: unknown) {
	return cond ? yep : nope;
}

export function setVar(name: unknown, value: unknown, variables: unknown) {
	if (variables && ( typeof name === 'string' || typeof name === 'number' ) ) {
		variables[name] = value;
	}
	return value;
}

export function arrayIndex(array: any, index: any) {
	return array[index | 0];
}

export function max(...args: any[]) {
	if(Array.isArray(args[0])) {
		return Math.max(...args[0]);
	}
	return Math.max(...args);
}

export function min(...args: any[]) {
	if(Array.isArray(args[0])) {
		return Math.min(...args[0]);
	}
	return Math.min(...args);
}

export function stringOrArrayIndexOf(target: any, s: unknown) {
	if (!(Array.isArray(s) || typeof s === 'string')) {
		throw new Error('Second argument to indexOf is not a string or array');
	}
	return s.indexOf(target);
}

export function arrayJoin(sep: unknown, a: unknown) {
	if (!Array.isArray(a)) {
		throw new Error('Second argument to join is not an array');
	}
	return a.join(String(sep));
}

export function sum(array: unknown) {
	if (!Array.isArray(array)) {
		throw new Error('Sum argument is not an array');
	}

	return array.reduce(function (total, value) {
		return total + Number(value);
	}, 0);
}
