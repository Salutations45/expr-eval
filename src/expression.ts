import simplify from './simplify';
import substitute from './substitute';
import evaluate from './evaluate';
import expressionToString from './expression-to-string';
import getSymbols from './get-symbols';
import { Parser } from './parser';
import { Value } from './value';

export class Expression {
  constructor(public tokens, public parser: Parser) {
    
  }

  simplify(values?: Value) {
    values = values || {};
    return new Expression(simplify(this.tokens, this.parser.unaryOps, this.parser.binaryOps, this.parser.ternaryOps, values), this.parser);
  }

  substitute(variable, expr) {
    if (!(expr instanceof Expression)) {
      expr = this.parser.parse(String(expr));
    }

    return new Expression(substitute(this.tokens, variable, expr), this.parser);
  }

  evaluate(values?) {
    return evaluate(this.tokens, this, values);
  }

  toString() {
    return expressionToString(this.tokens, false);
  }

  symbols(options = {}) {
    const vars = [];
    getSymbols(this.tokens, vars, options);
    return vars;
  }

  variables(options = {}) {
    const vars = [];
    getSymbols(this.tokens, vars, options);
    const functions = this.parser.functions;
    return vars.filter(function (name) {
      return !(name in functions);
    });
  }

  toJSFunction(param?, variables?) {
    const expr = this;
    const f = new Function(param, 'with(this.parser.functions) with (this.parser.ternaryOps) with (this.parser.binaryOps) with (this.parser.unaryOps) { return ' + expressionToString(this.simplify(variables).tokens, true) + '; }'); // eslint-disable-line no-new-func
    return function (...args) {
      return f.apply(expr, args);
    };
  }
}
