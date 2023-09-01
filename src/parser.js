import { TEOF } from './token';
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
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  log10,
  neg,
  not,
  trunc,
  random,
  factorial,
  gamma,
  stringOrArrayLength,
  hypot,
  condition,
  roundTo,
  setVar,
  arrayIndex,
  max,
  min,
  arrayMapAsync,
  arrayFold,
  arrayFilterAsync,
  stringOrArrayIndexOf,
  arrayJoin,
  sign,
  cbrt,
  expm1,
  log1p,
  log2,
  sum
} from './functions';

export class Parser {
  constructor(options) {
    this.options = options || {};
    this.unaryOps = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sinh: Math.sinh || sinh,
      cosh: Math.cosh || cosh,
      tanh: Math.tanh || tanh,
      asinh: Math.asinh || asinh,
      acosh: Math.acosh || acosh,
      atanh: Math.atanh || atanh,
      sqrt: Math.sqrt,
      cbrt: Math.cbrt || cbrt,
      log: Math.log,
      log2: Math.log2 || log2,
      ln: Math.log,
      lg: Math.log10 || log10,
      log10: Math.log10 || log10,
      expm1: Math.expm1 || expm1,
      log1p: Math.log1p || log1p,
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round,
      trunc: Math.trunc || trunc,
      '-': neg,
      '+': Number,
      exp: Math.exp,
      not,
      length: stringOrArrayLength,
      '!': factorial,
      sign: Math.sign || sign
    };

    this.binaryOps = {
      '+': add,
      '-': sub,
      '*': mul,
      '/': div,
      '%': mod,
      '^': Math.pow,
      '||': concat,
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

    this.ternaryOps = {
      '?': condition
    };

    this.functions = {
      random,
      fac: factorial,
      min,
      max,
      hypot: Math.hypot || hypot,
      pyt: Math.hypot || hypot,
      pow: Math.pow,
      atan2: Math.atan2,
      if: condition,
      gamma,
      roundTo,
      map: arrayMapAsync,
      fold: arrayFold,
      filter: arrayFilterAsync,
      indexOf: stringOrArrayIndexOf,
      join: arrayJoin,
      sum
    };

    this.consts = {
      E: Math.E,
      PI: Math.PI,
      true: true,
      false: false
    };
  }

  static parse(expr) {
    return sharedParser.parse(expr);
  }

  static evaluate(expr, variables) {
    return sharedParser.parse(expr).evaluate(variables);
  }

  isOperatorEnabled(op) {
    const optionName = getOptionName(op);
    const operators = this.options.operators || {};

    return !(optionName in operators) || !!operators[optionName];
  }

  parse(expr) {
    const instr = [];
    const parserState = new ParserState(
      this,
      new TokenStream(this, expr),
      { allowMemberAccess: this.options.allowMemberAccess }
    );

    parserState.parseExpression(instr);
    parserState.expect(TEOF, 'EOF');

    return new Expression(instr, this);
  }

  evaluate(expr, variables) {
    return this.parse(expr).evaluate(variables);
  }
}

const sharedParser = new Parser();

const optionNameMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'remainder',
  '^': 'power',
  '!': 'factorial',
  '<': 'comparison',
  '>': 'comparison',
  '<=': 'comparison',
  '>=': 'comparison',
  '==': 'comparison',
  '!=': 'comparison',
  '||': 'concatenate',
  and: 'logical',
  or: 'logical',
  not: 'logical',
  '?': 'conditional',
  ':': 'conditional',
  '=': 'assignment',
  '[': 'array',
  '()=': 'fndef'
};

function getOptionName(op) {
  return optionNameMap[op] || op;
}
