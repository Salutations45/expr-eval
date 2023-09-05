import simplify from './simplify';
import substitute from './substitute';
import evaluate from './evaluate';
import expressionToString from './expressionToString';
import getSymbols from './getSymbols';
import { Parser } from './Parser';
import { Instr } from './Instruction';

export class Expression {
	constructor(public tokens: Instr[], public parser: Parser) {
	}

	simplify(values: { [propertyName: string]: unknown } = {}) {
		return new Expression(simplify(this.tokens, this.parser, values), this.parser);
	}

	substitute(variable: string, expr: Expression | string) {
		if (!(expr instanceof Expression)) {
			expr = this.parser.parse(String(expr));
		}
		return new Expression(substitute(this.tokens, variable, expr), this.parser);
	}

	evaluate(values?: { [propertyName: string]: unknown }) {
		return evaluate(this.tokens, this, values);
	}

	toString() {
		return expressionToString(this.tokens, false);
	}

	symbols(options = {}) {
		const vars: string[] = [];
		getSymbols(this.tokens, vars, options);
		return vars;
	}

	variables(options = {}) {
		const vars: string[] = [];
		getSymbols(this.tokens, vars, options);
		const consts = this.parser.consts;
		return vars.filter( (name) => !(name in consts) );
	}

	toJSFunction(param?: string, variables?: { [propertyName: string]: unknown }) {
		const f = new Function(param!, 'with(this.parser.consts) with (this.parser.ternaryOps) with (this.parser.binaryOps) with (this.parser.unaryOps) { return (async function(){ return ' + expressionToString(this.simplify(variables).tokens, true) + ';})() }'); // eslint-disable-line no-new-func
		return async(...args: unknown[]) => {
			return f.apply(this, args);
		};
	}
}
