
import { Parser } from './parser';
import { Token, T } from './token';

export class TokenStream {
  pos = 0;
  current? : Token;
  savedPosition = 0;
  savedCurrent? : Token;

  constructor(public parser: Parser, private expression: string) {

  }

  newToken(type: T, value, pos = this.pos) {
    return new Token(type, value, pos);
  }

  save() {
    this.savedPosition = this.pos;
    this.savedCurrent = this.current;
  }

  restore() {
    this.pos = this.savedPosition;
    this.current = this.savedCurrent;
  }

  next() {
    if (this.pos >= this.expression.length) {
      return this.newToken(T.TEOF, 'EOF');
    }

    if (this.isWhitespace() || this.isComment()) {
      return this.next();
    } else if (this.isRadixInteger() ||
      this.isNumber() ||
      this.isOperator() ||
      this.isString() ||
      this.isParen() ||
      this.isBracket() ||
      this.isComma() ||
      this.isSemicolon() ||
      this.isNamedOp() ||
      this.isConst() ||
      this.isName()) {
      return this.current;
    } else {
      this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
    }
  }

  isString() {
    let r = false;
    const startPos = this.pos;
    const quote = this.expression.charAt(startPos);

    if (quote === '\'' || quote === '"') {
      let index = this.expression.indexOf(quote, startPos + 1);
      while (index >= 0 && this.pos < this.expression.length) {
        this.pos = index + 1;
        if (this.expression.charAt(index - 1) !== '\\') {
          const rawString = this.expression.substring(startPos + 1, index);
          this.current = this.newToken(T.TSTRING, this.unescape(rawString), startPos);
          r = true;
          break;
        }
        index = this.expression.indexOf(quote, index + 1);
      }
    }
    return r;
  }

  isParen() {
    const c = this.expression.charAt(this.pos);
    if (c === '(' || c === ')') {
      this.current = this.newToken(T.TPAREN, c);
      this.pos++;
      return true;
    }
    return false;
  }

  isBracket() {
    const c = this.expression.charAt(this.pos);
    if ((c === '[' || c === ']') && this.isOperatorEnabled('[')) {
      this.current = this.newToken(T.TBRACKET, c);
      this.pos++;
      return true;
    }
    return false;
  }

  isComma() {
    const c = this.expression.charAt(this.pos);
    if (c === ',') {
      this.current = this.newToken(T.TCOMMA, ',');
      this.pos++;
      return true;
    }
    return false;
  }

  isSemicolon() {
    const c = this.expression.charAt(this.pos);
    if (c === ';') {
      this.current = this.newToken(T.TSEMICOLON, ';');
      this.pos++;
      return true;
    }
    return false;
  }

  isConst() {
    const startPos = this.pos;
    let i = startPos;
    for (; i < this.expression.length; i++) {
      const c = this.expression.charAt(i);
      if (c.toUpperCase() === c.toLowerCase()) {
        if (i === this.pos || (c !== '_' && c !== '.' && (c < '0' || c > '9'))) {
          break;
        }
      }
    }
    if (i > startPos) {
      const str = this.expression.substring(startPos, i);
      if (str in this.parser.consts) {
        this.current = this.newToken(T.TNUMBER, this.parser.consts[str]);
        this.pos += str.length;
        return true;
      }
    }
    return false;
  }

  isNamedOp() {
    const startPos = this.pos;
    let i = startPos;
    for (; i < this.expression.length; i++) {
      const c = this.expression.charAt(i);
      if (c.toUpperCase() === c.toLowerCase()) {
        if (i === this.pos || (c !== '_' && (c < '0' || c > '9'))) {
          break;
        }
      }
    }
    if (i > startPos) {
      const str = this.expression.substring(startPos, i);
      if (this.isOperatorEnabled(str) && (str in this.parser.binaryOps || str in this.parser.unaryOps || str in this.parser.ternaryOps)) {
        this.current = this.newToken(T.TOP, str);
        this.pos += str.length;
        return true;
      }
    }
    return false;
  }

  isName() {
    const startPos = this.pos;
    let i = startPos;
    let hasLetter = false;
    for (; i < this.expression.length; i++) {
      const c = this.expression.charAt(i);
      if (c.toUpperCase() === c.toLowerCase()) {
        if (i === this.pos && (c === '$' || c === '_')) {
          if (c === '_') {
            hasLetter = true;
          }
          continue;
        } else if (i === this.pos || !hasLetter || (c !== '_' && (c < '0' || c > '9'))) {
          break;
        }
      } else {
        hasLetter = true;
      }
    }
    if (hasLetter) {
      const str = this.expression.substring(startPos, i);
      this.current = this.newToken(T.TNAME, str);
      this.pos += str.length;
      return true;
    }
    return false;
  }

  isWhitespace() {
    let r = false;
    let c = this.expression.charAt(this.pos);
    while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      r = true;
      this.pos++;
      if (this.pos >= this.expression.length) {
        break;
      }
      c = this.expression.charAt(this.pos);
    }
    return r;
  }

  unescape(v) {
    let index = v.indexOf('\\');
    if (index < 0) {
      return v;
    }

    let buffer = v.substring(0, index);
    while (index >= 0) {
      const c = v.charAt(++index);
      let codePoint;
      switch (c) {
        case '\'':
          buffer += '\'';
          break;
        case '"':
          buffer += '"';
          break;
        case '\\':
          buffer += '\\';
          break;
        case '/':
          buffer += '/';
          break;
        case 'b':
          buffer += '\b';
          break;
        case 'f':
          buffer += '\f';
          break;
        case 'n':
          buffer += '\n';
          break;
        case 'r':
          buffer += '\r';
          break;
        case 't':
          buffer += '\t';
          break;
        case 'u':
          // interpret the following 4 characters as the hex of the unicode code point
          codePoint = v.substring(index + 1, index + 5);
          if (!codePointPattern.test(codePoint)) {
            this.parseError('Illegal escape sequence: \\u' + codePoint);
          }
          buffer += String.fromCharCode(parseInt(codePoint, 16));
          index += 4;
          break;
        default:
          throw this.parseError('Illegal escape sequence: "\\' + c + '"');
      }
      ++index;
      const backslash = v.indexOf('\\', index);
      buffer += v.substring(index, backslash < 0 ? v.length : backslash);
      index = backslash;
    }

    return buffer;
  }

  isComment() {
    const c = this.expression.charAt(this.pos);
    if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
      this.pos = this.expression.indexOf('*/', this.pos) + 2;
      if (this.pos === 1) {
        this.pos = this.expression.length;
      }
      return true;
    }
    return false;
  }

  isRadixInteger() {
    let pos = this.pos;

    if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
      return false;
    }
    ++pos;

    let radix;
    let validDigit;
    if (this.expression.charAt(pos) === 'x') {
      radix = 16;
      validDigit = /^[0-9a-f]$/i;
      ++pos;
    } else if (this.expression.charAt(pos) === 'b') {
      radix = 2;
      validDigit = /^[01]$/i;
      ++pos;
    } else {
      return false;
    }

    let valid = false;
    const startPos = pos;

    while (pos < this.expression.length) {
      const c = this.expression.charAt(pos);
      if (validDigit.test(c)) {
        pos++;
        valid = true;
      } else {
        break;
      }
    }

    if (valid) {
      this.current = this.newToken(T.TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
      this.pos = pos;
    }
    return valid;
  }

  isNumber() {
    let valid = false;
    let pos = this.pos;
    const startPos = pos;
    let resetPos = pos;
    let foundDot = false;
    let foundDigits = false;
    let c;

    while (pos < this.expression.length) {
      c = this.expression.charAt(pos);
      if ((c >= '0' && c <= '9') || (!foundDot && c === '.')) {
        if (c === '.') {
          foundDot = true;
        } else {
          foundDigits = true;
        }
        pos++;
        valid = foundDigits;
      } else {
        break;
      }
    }

    if (valid) {
      resetPos = pos;
    }

    if (c === 'e' || c === 'E') {
      pos++;
      let acceptSign = true;
      let validExponent = false;
      while (pos < this.expression.length) {
        c = this.expression.charAt(pos);
        if (acceptSign && (c === '+' || c === '-')) {
          acceptSign = false;
        } else if (c >= '0' && c <= '9') {
          validExponent = true;
          acceptSign = false;
        } else {
          break;
        }
        pos++;
      }

      if (!validExponent) {
        pos = resetPos;
      }
    }

    if (valid) {
      this.current = this.newToken(T.TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
      this.pos = pos;
    } else {
      this.pos = resetPos;
    }
    return valid;
  }

  isOperator() {
    const startPos = this.pos;
    const c = this.expression.charAt(this.pos);

    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
      this.current = this.newToken(T.TOP, c);
    } else if (c === '∙' || c === '•') {
      this.current = this.newToken(T.TOP, '*');
    } else if (c === '>') {
      if (this.expression.charAt(this.pos + 1) === '=') {
        this.current = this.newToken(T.TOP, '>=');
        this.pos++;
      } else {
        this.current = this.newToken(T.TOP, '>');
      }
    } else if (c === '<') {
      if (this.expression.charAt(this.pos + 1) === '=') {
        this.current = this.newToken(T.TOP, '<=');
        this.pos++;
      } else {
        this.current = this.newToken(T.TOP, '<');
      }
    } else if (c === '|') {
      if (this.expression.charAt(this.pos + 1) === '|') {
        this.current = this.newToken(T.TOP, '||');
        this.pos++;
      } else {
        return false;
      }
    } else if (c === '=') {
      if (this.expression.charAt(this.pos + 1) === '=') {
        this.current = this.newToken(T.TOP, '==');
        this.pos++;
      } else {
        this.current = this.newToken(T.TOP, c);
      }
    } else if (c === '!') {
      if (this.expression.charAt(this.pos + 1) === '=') {
        this.current = this.newToken(T.TOP, '!=');
        this.pos++;
      } else {
        this.current = this.newToken(T.TOP, c);
      }
    } else {
      return false;
    }
    this.pos++;

    if (this.isOperatorEnabled(this.current.value)) {
      return true;
    } else {
      this.pos = startPos;
      return false;
    }
  }

  isOperatorEnabled(op) {
    return this.parser.isOperatorEnabled(op);
  }

  getCoordinates() {
    let line = 0;
    let column;
    let newline = -1;
    do {
      line++;
      column = this.pos - newline;
      newline = this.expression.indexOf('\n', newline + 1);
    } while (newline >= 0 && newline < this.pos);

    return {
      line,
      column
    };
  }

  parseError(msg) {
    const coords = this.getCoordinates();
    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
  }
}

const codePointPattern = /^[0-9a-f]{4}$/i;
