
export enum T {
  TEOF = 'TEOF',
  TOP = 'TOP',
  TNUMBER = 'TNUMBER',
  TSTRING = 'TSTRING',
  TPAREN = 'TPAREN',
  TBRACKET = 'TBRACKET',
  TCOMMA = 'TCOMMA',
  TNAME = 'TNAME',
  TSEMICOLON = 'TSEMICOLON',
}

export class Token {
  constructor(public type: T, public value, public index: number) {}

  toString() {
    return this.type + ': ' + this.value;
  }
}
