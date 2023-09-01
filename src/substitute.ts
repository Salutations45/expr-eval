import { Expression } from './expression';
import { Instruction, I, ternaryInstruction, binaryInstruction, unaryInstruction } from './instruction';

export default function substitute(tokens: Instruction[], variable: string, expr: Expression) {
  const newexpression: Instruction[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const item = tokens[i];
    const type = item.type;
    if (type === I.IVAR && item.value === variable) {
      for (let j = 0; j < expr.tokens.length; j++) {
        const expritem = expr.tokens[j];
        let replitem;
        if (expritem.type === I.IOP1) {
          replitem = unaryInstruction(expritem.value);
        } else if (expritem.type === I.IOP2) {
          replitem = binaryInstruction(expritem.value);
        } else if (expritem.type === I.IOP3) {
          replitem = ternaryInstruction(expritem.value);
        } else {
          replitem = new Instruction(expritem.type, expritem.value);
        }
        newexpression.push(replitem);
      }
    } else if (type === I.IEXPR) {
      newexpression.push(new Instruction(I.IEXPR, substitute(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}
