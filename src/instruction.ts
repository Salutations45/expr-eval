import { Value } from "./value";


export enum I {
  INUMBER = 'INUMBER',
  IOP1 = 'IOP1',
  IOP2 = 'IOP2',
  IOP3 = 'IOP3',
  IVAR = 'IVAR',
  IVARNAME = 'IVARNAME',
  IFUNCALL = 'IFUNCALL',
  IFUNDEF = 'IFUNDEF',
  IEXPR = 'IEXPR',
  IEXPREVAL = 'IEXPREVAL',
  IMEMBER = 'IMEMBER',
  IENDSTATEMENT = 'IENDSTATEMENT',
  IARRAY = 'IARRAY',
}

export class Instruction {

  value: any;

  constructor(public type: I, value?) {
    this.value = (value !== undefined && value !== null) ? value : 0;
  }

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

export function unaryInstruction(value: Value) {
  return new Instruction(I.IOP1, value);
}

export function binaryInstruction(value: Value) {
  return new Instruction(I.IOP2, value);
}

export function ternaryInstruction(value: Value) {
  return new Instruction(I.IOP3, value);
}
