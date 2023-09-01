import { T, Token } from './token';
import { Instruction, I, ternaryInstruction, binaryInstruction, unaryInstruction } from './instruction';
import contains from './contains';
import { TokenStream } from './token-stream';

export class ParserState {

  tokens: TokenStream ;
  current?: Token;
  nextToken?: Token;
  savedCurrent?: Token;;
  savedNextToken?: Token;;
  allowMemberAccess: boolean;
  
  constructor(public parser, tokenStream: TokenStream, options: {allowMemberAccess?: boolean}) {
    this.tokens = tokenStream;
    this.next();
    this.allowMemberAccess = options.allowMemberAccess !== false;
  }

  next() {
    this.current = this.nextToken;
    return (this.nextToken = this.tokens.next());
  }

  tokenMatches(token, value?) {
    if (typeof value === 'undefined') {
      return true;
    } else if (Array.isArray(value)) {
      return contains(value, token.value);
    } else if (typeof value === 'function') {
      return value(token);
    } else {
      return token.value === value;
    }
  }

  save() {
    this.savedCurrent = this.current;
    this.savedNextToken = this.nextToken;
    this.tokens.save();
  }

  restore() {
    this.tokens.restore();
    this.current = this.savedCurrent;
    this.nextToken = this.savedNextToken;
  }

  accept(type, value?) {
    if (this.nextToken?.type === type && this.tokenMatches(this.nextToken, value)) {
      this.next();
      return true;
    }
    return false;
  }

  expect(type, value?) {
    if (!this.accept(type, value)) {
      const coords = this.tokens.getCoordinates();
      throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
    }
  }

  parseAtom(instr) {
    const unaryOps = this.tokens.parser.unaryOps;
    function isPrefixOperator(token) {
      return token.value in unaryOps;
    }

    if (this.accept(T.TNAME) || this.accept(T.TOP, isPrefixOperator)) {
      instr.push(new Instruction(I.IVAR, this.current!.value));
    } else if (this.accept(T.TNUMBER)) {
      instr.push(new Instruction(I.INUMBER, this.current!.value));
    } else if (this.accept(T.TSTRING)) {
      instr.push(new Instruction(I.INUMBER, this.current!.value));
    } else if (this.accept(T.TPAREN, '(')) {
      this.parseExpression(instr);
      this.expect(T.TPAREN, ')');
    } else if (this.accept(T.TBRACKET, '[')) {
      if (this.accept(T.TBRACKET, ']')) {
        instr.push(new Instruction(I.IARRAY, 0));
      } else {
        const argCount = this.parseArrayList(instr);
        instr.push(new Instruction(I.IARRAY, argCount));
      }
    } else {
      throw new Error('unexpected ' + this.nextToken);
    }
  }

  parseExpression(instr) {
    const exprInstr = [];
    if (this.parseUntilEndStatement(instr, exprInstr)) {
      return;
    }
    this.parseVariableAssignmentExpression(exprInstr);
    if (this.parseUntilEndStatement(instr, exprInstr)) {
      return;
    }
    this.pushExpression(instr, exprInstr);
  }

  pushExpression(instr, exprInstr) {
    for (let i = 0, len = exprInstr.length; i < len; i++) {
      instr.push(exprInstr[i]);
    }
  }

  parseUntilEndStatement(instr, exprInstr: Instruction[]) {
    if (!this.accept(T.TSEMICOLON)) return false;
    if (this.nextToken && this.nextToken.type !== T.TEOF && !(this.nextToken.type === T.TPAREN && this.nextToken.value === ')')) {
      exprInstr.push(new Instruction(I.IENDSTATEMENT));
    }
    if (this.nextToken!.type !== T.TEOF) {
      this.parseExpression(exprInstr);
    }
    instr.push(new Instruction(I.IEXPR, exprInstr));
    return true;
  }

  parseArrayList(instr) {
    let argCount = 0;

    while (!this.accept(T.TBRACKET, ']')) {
      this.parseExpression(instr);
      ++argCount;
      while (this.accept(T.TCOMMA)) {
        this.parseExpression(instr);
        ++argCount;
      }
    }

    return argCount;
  }

  parseVariableAssignmentExpression(instr) {
    this.parseConditionalExpression(instr);
    while (this.accept(T.TOP, '=')) {
      const varName = instr.pop();
      const varValue = [];
      const lastInstrIndex = instr.length - 1;
      if (varName.type === I.IFUNCALL) {
        if (!this.tokens.isOperatorEnabled('()=')) {
          throw new Error('function definition is not permitted');
        }
        for (let i = 0, len = varName.value + 1; i < len; i++) {
          const index = lastInstrIndex - i;
          if (instr[index].type === I.IVAR) {
            instr[index] = new Instruction(I.IVARNAME, instr[index].value);
          }
        }
        this.parseVariableAssignmentExpression(varValue);
        instr.push(new Instruction(I.IEXPR, varValue));
        instr.push(new Instruction(I.IFUNDEF, varName.value));
        continue;
      }
      if (varName.type !== I.IVAR && varName.type !== I.IMEMBER) {
        throw new Error('expected variable for assignment');
      }
      this.parseVariableAssignmentExpression(varValue);
      instr.push(new Instruction(I.IVARNAME, varName.value));
      instr.push(new Instruction(I.IEXPR, varValue));
      instr.push(binaryInstruction('='));
    }
  }

  parseConditionalExpression(instr) {
    this.parseOrExpression(instr);
    while (this.accept(T.TOP, '?')) {
      const trueBranch = [];
      const falseBranch = [];
      this.parseConditionalExpression(trueBranch);
      this.expect(T.TOP, ':');
      this.parseConditionalExpression(falseBranch);
      instr.push(new Instruction(I.IEXPR, trueBranch));
      instr.push(new Instruction(I.IEXPR, falseBranch));
      instr.push(ternaryInstruction('?'));
    }
  }

  parseOrExpression(instr) {
    this.parseAndExpression(instr);
    while (this.accept(T.TOP, 'or')) {
      const falseBranch = [];
      this.parseAndExpression(falseBranch);
      instr.push(new Instruction(I.IEXPR, falseBranch));
      instr.push(binaryInstruction('or'));
    }
  }

  parseAndExpression(instr) {
    this.parseComparison(instr);
    while (this.accept(T.TOP, 'and')) {
      const trueBranch = [];
      this.parseComparison(trueBranch);
      instr.push(new Instruction(I.IEXPR, trueBranch));
      instr.push(binaryInstruction('and'));
    }
  }

  parseComparison(instr) {
    this.parseAddSub(instr);
    while (this.accept(T.TOP, COMPARISON_OPERATORS)) {
      const op = this.current;
      this.parseAddSub(instr);
      instr.push(binaryInstruction(op?.value));
    }
  }

  parseAddSub(instr) {
    this.parseTerm(instr);
    while (this.accept(T.TOP, ADD_SUB_OPERATORS)) {
      const op = this.current;
      this.parseTerm(instr);
      instr.push(binaryInstruction(op?.value));
    }
  }

  parseTerm(instr) {
    this.parseFactor(instr);
    while (this.accept(T.TOP, TERM_OPERATORS)) {
      const op = this.current;
      this.parseFactor(instr);
      instr.push(binaryInstruction(op?.value));
    }
  }

  parseFactor(instr) {
    const unaryOps = this.tokens.parser.unaryOps;
    function isPrefixOperator(token) {
      return token.value in unaryOps;
    }

    this.save();
    if (this.accept(T.TOP, isPrefixOperator)) {
      if (this.current?.value !== '-' && this.current?.value !== '+') {
        if (this.nextToken?.type === T.TPAREN && this.nextToken.value === '(') {
          this.restore();
          this.parseExponential(instr);
          return;
        } else if (this.nextToken?.type === T.TSEMICOLON || this.nextToken?.type === T.TCOMMA || this.nextToken?.type === T.TEOF || (this.nextToken?.type === T.TPAREN && this.nextToken?.value === ')')) {
          this.restore();
          this.parseAtom(instr);
          return;
        }
      }

      const op = this.current;
      this.parseFactor(instr);
      instr.push(unaryInstruction(op?.value));
    } else {
      this.parseExponential(instr);
    }
  }

  parseExponential(instr) {
    this.parsePostfixExpression(instr);
    while (this.accept(T.TOP, '^')) {
      this.parseFactor(instr);
      instr.push(binaryInstruction('^'));
    }
  }

  parsePostfixExpression(instr) {
    this.parseFunctionCall(instr);
    while (this.accept(T.TOP, '!')) {
      instr.push(unaryInstruction('!'));
    }
  }

  parseFunctionCall(instr) {
    const unaryOps = this.tokens.parser.unaryOps;
    function isPrefixOperator(token) {
      return token.value in unaryOps;
    }

    if (this.accept(T.TOP, isPrefixOperator)) {
      const op = this.current;
      this.parseAtom(instr);
      instr.push(unaryInstruction(op?.value));
    } else {
      this.parseMemberExpression(instr);
      while (this.accept(T.TPAREN, '(')) {
        if (this.accept(T.TPAREN, ')')) {
          instr.push(new Instruction(I.IFUNCALL, 0));
        } else {
          const argCount = this.parseArgumentList(instr);
          instr.push(new Instruction(I.IFUNCALL, argCount));
        }
      }
    }
  }

  parseArgumentList(instr) {
    let argCount = 0;

    while (!this.accept(T.TPAREN, ')')) {
      this.parseExpression(instr);
      ++argCount;
      while (this.accept(T.TCOMMA)) {
        this.parseExpression(instr);
        ++argCount;
      }
    }
    return argCount;
  }

  parseMemberExpression(instr) {
    this.parseAtom(instr);
    while (this.accept(T.TOP, '.') || this.accept(T.TBRACKET, '[')) {
      const op = this.current;

      if (op?.value === '.') {
        if (!this.allowMemberAccess) {
          throw new Error('unexpected ".", member access is not permitted');
        }

        this.expect(T.TNAME);
        instr.push(new Instruction(I.IMEMBER, this.current?.value));
      } else if (op?.value === '[') {
        if (!this.tokens.isOperatorEnabled('[')) {
          throw new Error('unexpected "[]", arrays are disabled');
        }

        this.parseExpression(instr);
        this.expect(T.TBRACKET, ']');
        instr.push(binaryInstruction('['));
      } else {
        throw new Error('unexpected symbol: ' + op?.value);
      }
    }
  }
}

const COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];
const ADD_SUB_OPERATORS = ['+', '-', '||'];
const TERM_OPERATORS = ['*', '/', '%'];
