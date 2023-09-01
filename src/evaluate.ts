import { Expression } from './expression';
import { I, Instruction } from './instruction';
import { Value } from './value';

export default async function evaluate(tokens: Instruction[], expr: Expression, values = {}) {
  const nstack: any[] = [];
  let n1, n2, n3;
  let f, args, argCount;

  if (isExpressionEvaluator(tokens)) {
    return resolveExpression(tokens, values);
  }

  const numTokens = tokens.length;

  for (let i = 0; i < numTokens; i++) {
    const item = tokens[i];
    const type = item.type;
    if (type === I.INUMBER || type === I.IVARNAME) {
      nstack.push(item.value);
    } else if (type === I.IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === 'and') {
        nstack.push(n1 ? !!await evaluate(n2, expr, values) : false);
      } else if (item.value === 'or') {
        nstack.push(n1 ? true : !!await evaluate(n2, expr, values));
      } else if (item.value === '=') {
        f = expr.parser.binaryOps[item.value];
        nstack.push(f(n1, await evaluate(n2, expr, values), values));
      } else {
        f = expr.parser.binaryOps[item.value];
        nstack.push(f(await resolveExpression(n1, values), await resolveExpression(n2, values)));
      }
    } else if (type === I.IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(await evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.parser.ternaryOps[item.value];
        nstack.push(f(await resolveExpression(n1, values), await resolveExpression(n2, values), await resolveExpression(n3, values)));
      }
    } else if (type === I.IVAR) {
      if (/^__proto__|prototype|constructor$/.test(item.value)) {
        throw new Error('prototype access detected');
      }
      if (item.value in expr.parser.functions) {
        nstack.push(expr.parser.functions[item.value]);
      } else if (item.value in expr.parser.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
        nstack.push(expr.parser.unaryOps[item.value]);
      } else {
        const v = values[item.value];
        if (v !== undefined) {
          nstack.push(v);
        } else {
          throw new Error('undefined variable: ' + item.value);
        }
      }
    } else if (type === I.IOP1) {
      n1 = nstack.pop();
      f = expr.parser.unaryOps[item.value];
      nstack.push(f(resolveExpression(n1, values)));
    } else if (type === I.IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression(nstack.pop(), values));
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(await f.apply(undefined, args));
      } else {
        throw new Error(f + ' is not a function');
      }
    } else if (type === I.IFUNDEF) {
      // Create closure to keep references to arguments and expression
      nstack.push((function () {
        const n2 = nstack.pop();
        const args: any[] = [];
        let argCount = item.value;
        while (argCount-- > 0) {
          args.unshift(nstack.pop());
        }
        const n1 = nstack.pop();
        const f = function () {
          const scope = Object.assign({}, values);
          for (let i = 0, len = args.length; i < len; i++) {
            scope[args[i]] = arguments[i];
          }
          return evaluate(n2, expr, scope);
        };
        // f.name = n1
        Object.defineProperty(f, 'name', {
          value: n1,
          writable: false
        });
        values[n1] = f;
        return f;
      })());
    } else if (type === I.IEXPR) {
      nstack.push(createExpressionEvaluator(item, expr, values));
    } else if (type === I.IEXPREVAL) {
      nstack.push(item);
    } else if (type === I.IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else if (type === I.IENDSTATEMENT) {
      nstack.pop();
    } else if (type === I.IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push(args);
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  // Explicitly return zero to avoid test issues caused by -0
  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
}

function createExpressionEvaluator(token, expr, values) {
  if (isExpressionEvaluator(token)) return token;
  return {
    type: I.IEXPREVAL,
    value: async function (scope) {
      return evaluate(token.value, expr, scope);
    }
  };
}

function isExpressionEvaluator(n) {
  return n && n.type === I.IEXPREVAL;
}

function resolveExpression(n, values: Value) {
  return isExpressionEvaluator(n) ? n.value(values) : n;
}
