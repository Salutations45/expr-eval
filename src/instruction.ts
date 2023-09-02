
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
}
export const IEXPR = 'IEXPR';
export const IEXPREVAL = 'IEXPREVAL';

export type Instruction = SimpleInstruction | ExpressionInstruction | ExpressionEvaluator;

export class ExpressionEvaluator {
	readonly type = 'IEXPREVAL';
	constructor(public value: (scope: any)=>Promise<unknown>) {}
}

export class ExpressionInstruction {
	readonly type = 'IEXPR';
	constructor(public value: Instruction[]) {}
}

export class SimpleInstruction {
	constructor(public readonly type: I, public value: string | number = 0) {}

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
	return new SimpleInstruction(I.IOP1, value);
}

export function binaryInstruction(value: string | number) {
	return new SimpleInstruction(I.IOP2, value);
}

export function ternaryInstruction(value: string | number) {
	return new SimpleInstruction(I.IOP3, value);
}
