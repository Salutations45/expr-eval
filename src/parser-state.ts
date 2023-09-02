import { T, Token } from './token';
import { Instruction, I, ternaryInstruction, binaryInstruction, unaryInstruction, SimpleInstruction, ExpressionInstruction } from './instruction';
import contains from './contains';
import { TokenStream } from './token-stream';
import { Value } from './value';
import { Parser } from './parser';

export class ParserState {

	tokens: TokenStream ;
	current?: Token;
	nextToken?: Token;
	savedCurrent?: Token;
	savedNextToken?: Token;
	allowMemberAccess: boolean;
	
	constructor(public parser: Parser, tokenStream: TokenStream, options: {allowMemberAccess?: boolean}) {
		this.tokens = tokenStream;
		this.next();
		this.allowMemberAccess = options.allowMemberAccess !== false;
	}

	next() {
		this.current = this.nextToken;
		return (this.nextToken = this.tokens.next());
	}

	tokenMatches(token: Token, value?) {
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

	accept(type: T, value?) {
		if (this.nextToken?.type === type && this.tokenMatches(this.nextToken!, value)) {
			this.next();
			return true;
		}
		return false;
	}

	expect(type: T, value?: Value) {
		if (!this.accept(type, value)) {
			const coords = this.tokens.getCoordinates();
			throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
		}
	}

	parseAtom(instr: Instruction[]) {
		const unaryOps = this.tokens.parser.unaryOps;

		function isPrefixOperator(token: Token) {
			return token.value in unaryOps;
		}

		if (this.accept(T.TNAME) || this.accept(T.TOP, isPrefixOperator)) {
			instr.push(new SimpleInstruction(I.IVAR, this.current!.value));
		} else if (this.accept(T.TNUMBER)) {
			instr.push(new SimpleInstruction(I.INUMBER, this.current!.value));
		} else if (this.accept(T.TSTRING)) {
			instr.push(new SimpleInstruction(I.INUMBER, this.current!.value));
		} else if (this.accept(T.TPAREN, '(')) {
			this.parseExpression(instr);
			this.expect(T.TPAREN, ')');
		} else if (this.accept(T.TBRACKET, '[')) {
			if (this.accept(T.TBRACKET, ']')) {
				instr.push(new SimpleInstruction(I.IARRAY, 0));
			} else {
				const argCount = this.parseArrayList(instr);
				instr.push(new SimpleInstruction(I.IARRAY, argCount));
			}
		} else {
			throw new Error('unexpected ' + this.nextToken);
		}
	}

	parseExpression(instr: Instruction[]) {
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

	pushExpression(instr: Instruction[], exprInstr: Instruction[]) {
		for (let i = 0, len = exprInstr.length; i < len; i++) {
			instr.push(exprInstr[i]);
		}
	}

	parseUntilEndStatement(instr: Instruction[], exprInstr: Instruction[]) {
		if (!this.accept(T.TSEMICOLON)) return false;
		if (this.nextToken && this.nextToken.type !== T.TEOF && !(this.nextToken.type === T.TPAREN && this.nextToken.value === ')')) {
			exprInstr.push(new SimpleInstruction(I.IENDSTATEMENT));
		}
		if (this.nextToken!.type !== T.TEOF) {
			this.parseExpression(exprInstr);
		}
		instr.push(new ExpressionInstruction(exprInstr));
		return true;
	}

	parseArrayList(instr: Instruction[]) {
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

	parseVariableAssignmentExpression(instr: Instruction[]) {
		this.parseConditionalExpression(instr);
		while (this.accept(T.TOP, '=')) {
			const varName = instr.pop()!;
			const varValue = [];
			const lastInstrIndex = instr.length - 1;
			if (varName.type === I.IFUNCALL) {
				if (!this.tokens.isOperatorEnabled('()=')) {
					throw new Error('function definition is not permitted');
				}
				for (let i = 0, len = varName.value as number + 1; i < len; i++) {
					const index = lastInstrIndex - i;
					const inst = instr[index]
					if(inst.type === I.IVAR) {
						instr[index] = new SimpleInstruction(I.IVARNAME, inst.value);
					}
				}
				this.parseVariableAssignmentExpression(varValue);
				instr.push(new ExpressionInstruction(varValue));
				instr.push(new SimpleInstruction(I.IFUNDEF, varName.value));
				continue;
			}
			if (varName.type !== I.IVAR && varName.type !== I.IMEMBER) {
				throw new Error('expected variable for assignment');
			}
			this.parseVariableAssignmentExpression(varValue);
			instr.push(new SimpleInstruction(I.IVARNAME, varName.value));
			instr.push(new ExpressionInstruction(varValue));
			instr.push(binaryInstruction('='));
		}
	}

	parseConditionalExpression(instr: Instruction[]) {
		this.parseOrExpression(instr);
		while (this.accept(T.TOP, '?')) {
			const trueBranch = [];
			const falseBranch = [];
			this.parseConditionalExpression(trueBranch);
			this.expect(T.TOP, ':');
			this.parseConditionalExpression(falseBranch);
			instr.push(new ExpressionInstruction(trueBranch));
			instr.push(new ExpressionInstruction(falseBranch));
			instr.push(ternaryInstruction('?'));
		}
	}

	parseOrExpression(instr: Instruction[]) {
		this.parseAndExpression(instr);
		while (this.accept(T.TOP, 'or')) {
			const falseBranch = [];
			this.parseAndExpression(falseBranch);
			instr.push(new ExpressionInstruction(falseBranch));
			instr.push(binaryInstruction('or'));
		}
	}

	parseAndExpression(instr: Instruction[]) {
		this.parseComparison(instr);
		while (this.accept(T.TOP, 'and')) {
			const trueBranch = [];
			this.parseComparison(trueBranch);
			instr.push(new ExpressionInstruction(trueBranch));
			instr.push(binaryInstruction('and'));
		}
	}

	parseComparison(instr: Instruction[]) {
		this.parseAddSub(instr);
		while (this.accept(T.TOP, COMPARISON_OPERATORS)) {
			const op = this.current;
			this.parseAddSub(instr);
			instr.push(binaryInstruction(op!.value));
		}
	}

	parseAddSub(instr: Instruction[]) {
		this.parseTerm(instr);
		while (this.accept(T.TOP, ADD_SUB_OPERATORS)) {
			const op = this.current;
			this.parseTerm(instr);
			instr.push(binaryInstruction(op!.value));
		}
	}

	parseTerm(instr: Instruction[]) {
		this.parseFactor(instr);
		while (this.accept(T.TOP, TERM_OPERATORS)) {
			const op = this.current;
			this.parseFactor(instr);
			instr.push(binaryInstruction(op!.value));
		}
	}

	parseFactor(instr: Instruction[]) {
		const unaryOps = this.tokens.parser.unaryOps;

		this.save();
		if (this.accept(T.TOP, (token: Token) => token.value in unaryOps )) {
			if (this.current!.value !== '-' && this.current!.value !== '+') {
				if (this.nextToken?.type === T.TPAREN && this.nextToken.value === '(') {
					this.restore();
					this.parseExponential(instr);
					return;
				} else if (this.nextToken!.type === T.TSEMICOLON || this.nextToken!.type === T.TCOMMA || this.nextToken!.type === T.TEOF || (this.nextToken!.type === T.TPAREN && this.nextToken!.value === ')')) {
					this.restore();
					this.parseAtom(instr);
					return;
				}
			}

			const op = this.current;
			this.parseFactor(instr);
			instr.push(unaryInstruction(op!.value));
		} else {
			this.parseExponential(instr);
		}
	}

	parseExponential(instr: Instruction[]) {
		this.parsePostfixExpression(instr);
		while (this.accept(T.TOP, '^')) {
			this.parseFactor(instr);
			instr.push(binaryInstruction('^'));
		}
	}

	parsePostfixExpression(instr: Instruction[]) {
		this.parseFunctionCall(instr);
		while (this.accept(T.TOP, '!')) {
			instr.push(unaryInstruction('!'));
		}
	}

	parseFunctionCall(instr: Instruction[]) {
		const unaryOps = this.tokens.parser.unaryOps;
		function isPrefixOperator(token) {
			return token.value in unaryOps;
		}

		if (this.accept(T.TOP, isPrefixOperator)) {
			const op = this.current;
			this.parseAtom(instr);
			instr.push(unaryInstruction(op!.value));
		} else {
			this.parseMemberExpression(instr);
			while (this.accept(T.TPAREN, '(')) {
				if (this.accept(T.TPAREN, ')')) {
					instr.push(new SimpleInstruction(I.IFUNCALL, 0));
				} else {
					const argCount = this.parseArgumentList(instr);
					instr.push(new SimpleInstruction(I.IFUNCALL, argCount));
				}
			}
		}
	}

	parseArgumentList(instr: Instruction[]) {
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

	parseMemberExpression(instr: Instruction[]) {
		this.parseAtom(instr);
		while (this.accept(T.TOP, '.') || this.accept(T.TBRACKET, '[')) {
			const op = this.current;

			if (op?.value === '.') {
				if (!this.allowMemberAccess) {
					throw new Error('unexpected ".", member access is not permitted');
				}

				this.expect(T.TNAME);
				instr.push(new SimpleInstruction(I.IMEMBER, this.current?.value));
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
const ADD_SUB_OPERATORS = ['+', '-'];
const TERM_OPERATORS = ['*', '/', '%'];
