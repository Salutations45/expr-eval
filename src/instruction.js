export const INUMBER = 'INUMBER';
export const IOP1 = 'IOP1';
export const IOP2 = 'IOP2';
export const IOP3 = 'IOP3';
export const IVAR = 'IVAR';
export const IVARNAME = 'IVARNAME';
export const IFUNCALL = 'IFUNCALL';
export const IFUNDEF = 'IFUNDEF';
export const IEXPR = 'IEXPR';
export const IEXPREVAL = 'IEXPREVAL';
export const IMEMBER = 'IMEMBER';
export const IENDSTATEMENT = 'IENDSTATEMENT';
export const IARRAY = 'IARRAY';

export class Instruction {
  constructor(type, value) {
    this.type = type;
    this.value = (value !== undefined && value !== null) ? value : 0;
  }

  toString() {
    switch (this.type) {
      case INUMBER:
      case IOP1:
      case IOP2:
      case IOP3:
      case IVAR:
      case IVARNAME:
      case IENDSTATEMENT:
        return this.value;
      case IFUNCALL:
        return 'CALL ' + this.value;
      case IFUNDEF:
        return 'DEF ' + this.value;
      case IARRAY:
        return 'ARRAY ' + this.value;
      case IMEMBER:
        return '.' + this.value;
      default:
        return 'Invalid Instruction';
    }
  }
}

export function unaryInstruction(value) {
  return new Instruction(IOP1, value);
}

export function binaryInstruction(value) {
  return new Instruction(IOP2, value);
}

export function ternaryInstruction(value) {
  return new Instruction(IOP3, value);
}
