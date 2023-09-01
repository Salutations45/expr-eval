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
  sign,
  sum
} from './functions';
import { Value } from './value';

enum OptType {
  ADD = 'add',
  SUBSTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
  REMAINDER = 'remainder',
  POWER = 'power',
  COMPARAISON = 'comparison',
  LOGIC = 'logical',
  CONDITION = 'conditional',
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
  '<': OptType.COMPARAISON,
  '>': OptType.COMPARAISON,
  '<=': OptType.COMPARAISON,
  '>=': OptType.COMPARAISON,
  '==': OptType.COMPARAISON,
  '!=': OptType.COMPARAISON,
  and: OptType.LOGIC,
  or: OptType.LOGIC,
  not: OptType.LOGIC,
  '?': OptType.CONDITION,
  ':': OptType.CONDITION,
  '=': OptType.ASSIGN,
  '[': OptType.ARRAY,
  '()=': OptType.FNDEF
};


export interface OperatorOptions {
    add?: boolean,
    comparison?: boolean,
    concat?: boolean,
    conditional?: boolean,
    divide?: boolean,
    logical?: boolean,
    multiply?: boolean,
    power?: boolean,
    remainder?: boolean,
    subtract?: boolean,
    sqrt?: boolean,
    abs?: boolean,
    ceil?: boolean,
    floor?: boolean,
    round?: boolean,
    trunc?: boolean,
    exp?: boolean,
    length?: boolean,
    in?: boolean,
    random?: boolean,
    min?: boolean,
    max?: boolean,
    assignment?: boolean,
    array?: boolean,
    fndef?: boolean,
    sign?: boolean,
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
    sign: Math.sign || sign
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
    if: condition,
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

  
  getOptionName(op) {
    return optionNameMap[op] || op;
  }

  isOperatorEnabled(op) {
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

