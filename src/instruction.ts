
export enum I {
	INUMBER = 'INUMBER',
	IOP1 = 'IOP1',
	IOP2 = 'IOP2',
	IOP3 = 'IOP3',
	IVAR = 'IVAR',
	IVARNAME = 'IVARNAME',
	IFUNCALL = 'IFUNCALL',
	IFUNDEF = 'IFUNDEF',
	IMEMBER = 'IMEMBER',
	IENDSTATEMENT = 'IENDSTATEMENT',
	IARRAY = 'IARRAY',
	IEXPR = 'IEXPR',
	IEXPREVAL = 'IEXPREVAL',
}

export type Instr = SimpleInstruction | OperatorInstruction | VariableInstruction | ExpressionEvaluator | ExpressionInstruction;

export interface SimpleInstruction {
	readonly type: I.INUMBER | I.IFUNCALL | I.IFUNDEF | I.IENDSTATEMENT | I.IARRAY;
	value: unknown;
}

export interface OperatorInstruction {
	readonly type: I.IOP1 | I.IOP2 | I.IOP3;
	value: string;
}

export interface VariableInstruction {
	readonly type: I.IMEMBER | I.IVAR | I.IVARNAME;
	value: string;
}

export interface ExpressionEvaluator {
	readonly type: I.IEXPREVAL;
	value: (scope: { [propertyName: string]: unknown })=>Promise<unknown>;
}

export interface ExpressionInstruction {
	readonly type: I.IEXPR;
	value: Instr[];
}

export class Instruction<T extends I> {
	constructor(public readonly type: T, public readonly value: any = 0) {}

	toString() {
		switch (this.type) {
			case I.INUMBER:
			case I.IOP1:
			case I.IOP2:
			case I.IOP3:
			case I.IVAR:
			case I.IVARNAME:
			case I.IENDSTATEMENT:
				return this.value;
			case I.IFUNCALL:
				return 'CALL ' + this.value;
			case I.IFUNDEF:
				return 'DEF ' + this.value;
			case I.IARRAY:
				return 'ARRAY ' + this.value;
			case I.IMEMBER:
				return '.' + this.value;
			default:
				return 'Invalid Instruction';
		}
	}
}

export function unaryInstruction(value: string | number) {
	return new Instruction(I.IOP1, value);
}

export function binaryInstruction(value: string | number) {
	return new Instruction(I.IOP2, value);
}

export function ternaryInstruction(value: string | number) {
	return new Instruction(I.IOP3, value);
}
