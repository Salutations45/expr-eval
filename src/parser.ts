import { T } from './token';
import { TokenStream } from './token-stream';
import { ParserState } from './parser-state';
import { Expression } from './expression';
import {
	add,
	sub,
	mul,
	div,
	mod,
	concat,
	equal,
	notEqual,
	greaterThan,
	lessThan,
	greaterThanEqual,
	lessThanEqual,
	andOperator,
	orOperator,
	inOperator,
	neg,
	not,
	random,
	stringOrArrayLength,
	condition,
	setVar,
	arrayIndex,
	max,
	min,
	stringOrArrayIndexOf,
	arrayJoin,
	sum
} from './functions';
import { Value } from './value';

export enum OptType {
	ADD = 'add',
	SUBSTRACT = 'subtract',
	MULTIPLY = 'multiply',
	DIVIDE = 'divide',
	REMAINDER = 'remainder',
	POWER = 'power',
	COMPARE = 'comparison',
	LOGIC = 'logical',
	CONDITION = 'conditional',
	IN = 'in',
	ASSIGN = 'assignment',
	ARRAY = 'array',
	FNDEF = 'fndef'
}

const optionNameMap = {
	'+': OptType.ADD,
	'-': OptType.SUBSTRACT,
	'*': OptType.MULTIPLY,
	'/': OptType.DIVIDE,
	'%': OptType.REMAINDER,
	'^': OptType.POWER,
	'<': OptType.COMPARE,
	'>': OptType.COMPARE,
	'<=': OptType.COMPARE,
	'>=': OptType.COMPARE,
	'==': OptType.COMPARE,
	'!=': OptType.COMPARE,
	and: OptType.LOGIC,
	or: OptType.LOGIC,
	not: OptType.LOGIC,
	in: OptType.IN,
	'?': OptType.CONDITION,
	':': OptType.CONDITION,
	'=': OptType.ASSIGN,
	'[': OptType.ARRAY,
	'()=': OptType.FNDEF
};

export type OperatorOptions = {
	[key in OptType]?: boolean
}

export interface ParserOptions {
	allowMemberAccess?: boolean;
	operators?: OperatorOptions;
}

export class Parser {
	unaryOps = {
		ceil: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		trunc: Math.trunc,
		'-': neg,
		'+': Number,
		not,
		length: stringOrArrayLength,
		sign: Math.sign
	};
	
	binaryOps = {
		'+': add,
		'-': sub,
		'*': mul,
		'/': div,
		'%': mod,
		'^': Math.pow,
		'==': equal,
		'!=': notEqual,
		'>': greaterThan,
		'<': lessThan,
		'>=': greaterThanEqual,
		'<=': lessThanEqual,
		and: andOperator,
		or: orOperator,
		in: inOperator,
		'=': setVar,
		'[': arrayIndex
	};

	ternaryOps = {
		'?': condition
	};

	functions = {
		random,
		min,
		max,
		pow: Math.pow,
		indexOf: stringOrArrayIndexOf,
		join: arrayJoin,
		sum,
		concat
	};

	consts = {
		PI: Math.PI,
		true: true,
		false: false
	};

	constructor(public options: ParserOptions = {operators: {}}) {
	}

	static parse(expr: string) {
		return sharedParser.parse(expr);
	}

	static evaluate(expr: string, variables?: Value) {
		return sharedParser.parse(expr).evaluate(variables);
	}
	
	getOptionName(op: string): string {
		return optionNameMap[op] || op;
	}

	isOperatorEnabled(op: string) {
		const optionName = this.getOptionName(op);
		const operators = this.options.operators || {};

		return !(optionName in operators) || !!operators[optionName];
	}

	parse(expr: string) {
		const instr = [];
		const parserState = new ParserState(
			this,
			new TokenStream(this, expr),
			{ allowMemberAccess: this.options.allowMemberAccess }
		);

		parserState.parseExpression(instr);
		parserState.expect(T.TEOF, 'EOF');

		return new Expression(instr, this);
	}

	evaluate(expr: string, variables?: Value) {
		return this.parse(expr).evaluate(variables);
	}
}

const sharedParser = new Parser();

