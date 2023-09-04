import simplify from './simplify';
import substitute from './substitute';
import evaluate from './evaluate';
import expressionToString from './expressionToString';
import getSymbols from './getSymbols';
import { Parser } from './Parser';
import { Value } from './Value';
import { Instr } from './Instruction';

export class Expression {
	constructor(public tokens: Instr[], public parser: Parser) {
	}

	simplify(values: Value = {}) {
		return new Expression(simplify(this.tokens, this.parser, values), this.parser);
	}

	substitute(variable: string, expr: Expression | string) {
		if (!(expr instanceof Expression)) {
			expr = this.parser.parse(String(expr));
		}
		return new Expression(substitute(this.tokens, variable, expr), this.parser);
	}

	evaluate(values?: Value) {
		return evaluate(this.tokens, this, values);
	}

	toString() {
		return expressionToString(this.tokens, false);
	}

	symbols(options = {}) {
		const vars: Value = [];
		getSymbols(this.tokens, vars, options);
		return vars;
	}

	variables(options = {}) {
		const vars = [];
		getSymbols(this.tokens, vars, options);
		const consts = this.parser.consts;
		return vars.filter( (name) => !(name in consts) );
	}

	toJSFunction(param?: string, variables?: Value) {
		const f = new Function(param!, 'with(this.parser.consts) with (this.parser.ternaryOps) with (this.parser.binaryOps) with (this.parser.unaryOps) { return ' + expressionToString(this.simplify(variables).tokens, true) + '; }'); // eslint-disable-line no-new-func
		return (...args: unknown[]) => {
			return f.apply(this, args);
		};
	}
}