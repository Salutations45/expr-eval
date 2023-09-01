import simplify from './simplify';
import substitute from './substitute';
import evaluate from './evaluate';
import expressionToString from './expression-to-string';
import getSymbols from './get-symbols';

export class Expression {
  constructor(tokens, parser) {
    this.tokens = tokens;
    this.parser = parser;
    this.unaryOps = parser.unaryOps;
    this.binaryOps = parser.binaryOps;
    this.ternaryOps = parser.ternaryOps;
    this.functions = parser.functions;
  }

  simplify(values) {
    values = values || {};
    return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
  }

  substitute(variable, expr) {
    if (!(expr instanceof Expression)) {
      expr = this.parser.parse(String(expr));
    }

    return new Expression(substitute(this.tokens, variable, expr), this.parser);
  }

  evaluate(values) {
    values = values || {};
    return evaluate(this.tokens, this, values);
  }

  toString() {
    return expressionToString(this.tokens, false);
  }

  symbols(options) {
    options = options || {};
    const vars = [];
    getSymbols(this.tokens, vars, options);
    return vars;
  }

  variables(options) {
    options = options || {};
    const vars = [];
    getSymbols(this.tokens, vars, options);
    const functions = this.functions;
    return vars.filter(function (name) {
      return !(name in functions);
    });
  }

  toJSFunction(param, variables) {
    const expr = this;
    const f = new Function(param, 'with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return ' + expressionToString(this.simplify(variables).tokens, true) + '; }'); // eslint-disable-line no-new-func
    return function () {
      return f.apply(expr, arguments);
    };
  }
}
