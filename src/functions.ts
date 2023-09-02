import contains from './contains';

export function add(a, b) {
	return Number(a) + Number(b);
}

export function sub(a, b) {
	return a - b;
}

export function mul(a, b) {
	return a * b;
}

export function div(a, b) {
	return a / b;
}

export function mod(a, b) {
	return a % b;
}

export function concat(a, b) {
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.concat(b);
	}
	return '' + a + b;
}

export function equal(a, b) {
	return a === b;
}

export function notEqual(a, b) {
	return a !== b;
}

export function greaterThan(a, b) {
	return a > b;
}

export function lessThan(a, b) {
	return a < b;
}

export function greaterThanEqual(a, b) {
	return a >= b;
}

export function lessThanEqual(a, b) {
	return a <= b;
}

export function andOperator(a, b) {
	return Boolean(a && b);
}

export function orOperator(a, b) {
	return Boolean(a || b);
}

export function inOperator(a, b) {
	return contains(b, a);
}

export function neg(a) {
	return -a;
}

export function not(a) {
	return !a;
}

export function random(a) {
	return Math.random() * (a || 1);
}

export function stringOrArrayLength(s) {
	if (Array.isArray(s)) {
		return s.length;
	}
	return String(s).length;
}

export function condition(cond, yep, nope) {
	return cond ? yep : nope;
}

export function setVar(name, value, variables) {
	if (variables) variables[name] = value;
	return value;
}

export function arrayIndex(array, index) {
	return array[index | 0];
}

export function max(...args) {
	if(Array.isArray(args[0])) {
		return Math.max(...args[0]);
	}
	return Math.max(...args);
}

export function min(...args) {
	if(Array.isArray(args[0])) {
		return Math.min(...args[0]);
	}
	return Math.min(...args);
}

export function stringOrArrayIndexOf(target, s) {
	if (!(Array.isArray(s) || typeof s === 'string')) {
		throw new Error('Second argument to indexOf is not a string or array');
	}
	return s.indexOf(target);
}

export function arrayJoin(sep, a) {
	if (!Array.isArray(a)) {
		throw new Error('Second argument to join is not an array');
	}
	return a.join(sep);
}

export function sum(array) {
	if (!Array.isArray(array)) {
		throw new Error('Sum argument is not an array');
	}

	return array.reduce(function (total, value) {
		return total + Number(value);
	}, 0);
}
