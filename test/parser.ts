/* global describe, it */

'use strict';

import { strictEqual, throws, deepStrictEqual, rejects } from 'assert';
import { Parser } from '../src/index';

describe('Parser', async function () {
  [
    { name: 'normal parse()', parser: new Parser() },
    { name: 'disallowing member access', parser: new Parser({ allowMemberAccess: false }) }
  ].forEach(function (tcase) {
    const parser = tcase.parser;
    describe(tcase.name, function () {
      it('should skip comments', async function () {
        strictEqual(await parser.evaluate('2/* comment */+/* another comment */3'), 5);
        strictEqual(await parser.evaluate('2/* comment *///* another comment */3'), 2 / 3);
        strictEqual(await parser.evaluate('/* comment at the beginning */2 + 3/* unterminated comment'), 5);
        strictEqual(await parser.evaluate('2 +/* comment\n with\n multiple\n lines */3'), 5);
      });

      it('should ignore whitespace', async function () {
        strictEqual(await parser.evaluate(' 3\r + \n \t 4 '), 7);
      });

      it('should accept variables starting with E', async function () {
        strictEqual(await parser.parse('2 * ERGONOMIC').evaluate({ ERGONOMIC: 1000 }), 2000);
      });

      it('should accept variables starting with PI', async function () {
        strictEqual(await parser.parse('1 / PITTSBURGH').evaluate({ PITTSBURGH: 2 }), 0.5);
      });

      it('should fail on empty parentheses', async function () {
        throws(function () { parser.parse('5/()'); }, Error);
      });

      it('should fail on 5/', async function () {
        throws(function () { parser.parse('5/'); }, Error);
      });

      it('should parse numbers', async function () {
        strictEqual(await parser.evaluate('123'), 123);
        strictEqual(await parser.evaluate('123.'), 123);
        strictEqual(await parser.evaluate('123.456'), 123.456);
        strictEqual(await parser.evaluate('.456'), 0.456);
        strictEqual(await parser.evaluate('0.456'), 0.456);
        strictEqual(await parser.evaluate('0.'), 0);
        strictEqual(await parser.evaluate('.0'), 0);
        strictEqual(await parser.evaluate('123.+3'), 126);
        strictEqual(await parser.evaluate('2/123'), 2 / 123);
      });

      it('should parse numbers using scientific notation', async function () {
        strictEqual(await parser.evaluate('123e2'), 12300);
        strictEqual(await parser.evaluate('123E2'), 12300);
        strictEqual(await parser.evaluate('123e12'), 123000000000000);
        strictEqual(await parser.evaluate('123e+12'), 123000000000000);
        strictEqual(await parser.evaluate('123E+12'), 123000000000000);
        strictEqual(await parser.evaluate('123e-12'), 0.000000000123);
        strictEqual(await parser.evaluate('123E-12'), 0.000000000123);
        strictEqual(await parser.evaluate('1.7e308'), 1.7e308);
        strictEqual(await parser.evaluate('1.7e-308'), 1.7e-308);
        strictEqual(await parser.evaluate('123.e3'), 123000);
        strictEqual(await parser.evaluate('123.456e+1'), 1234.56);
        strictEqual(await parser.evaluate('.456e-3'), 0.000456);
        strictEqual(await parser.evaluate('0.456'), 0.456);
        strictEqual(await parser.evaluate('0e3'), 0);
        strictEqual(await parser.evaluate('0e-3'), 0);
        strictEqual(await parser.evaluate('0e+3'), 0);
        strictEqual(await parser.evaluate('.0e+3'), 0);
        strictEqual(await parser.evaluate('.0e-3'), 0);
        strictEqual(await parser.evaluate('123e5+4'), 12300004);
        strictEqual(await parser.evaluate('123e+5+4'), 12300004);
        strictEqual(await parser.evaluate('123e-5+4'), 4.00123);
        strictEqual(await parser.evaluate('123e0'), 123);
        strictEqual(await parser.evaluate('123e01'), 1230);
        strictEqual(await parser.evaluate('123e+00000000002'), 12300);
        strictEqual(await parser.evaluate('123e-00000000002'), 1.23);
        strictEqual(await parser.evaluate('e1', { e1: 42 }), 42);
        strictEqual(await parser.evaluate('e+1', { e: 12 }), 13);
      });

      it('should fail on invalid numbers', async function () {
        throws(function () { parser.parse('123..'); }, Error);
        throws(function () { parser.parse('0..123'); }, Error);
        throws(function () { parser.parse('0..'); }, Error);
        throws(function () { parser.parse('.0.'); }, Error);
        throws(function () { parser.parse('.'); }, Error);
        throws(function () { parser.parse('1.23e'); }, Error);
        throws(function () { parser.parse('1.23e+'); }, Error);
        throws(function () { parser.parse('1.23e-'); }, Error);
        throws(function () { parser.parse('1.23e++4'); }, Error);
        throws(function () { parser.parse('1.23e--4'); }, Error);
        throws(function () { parser.parse('1.23e+-4'); }, Error);
        throws(function () { parser.parse('1.23e4-'); }, Error);
        throws(function () { parser.parse('1.23ee4'); }, Error);
        throws(function () { parser.parse('1.23ee.4'); }, Error);
        throws(function () { parser.parse('1.23e4.0'); }, Error);
        throws(function () { parser.parse('123e.4'); }, Error);
      });

      it('should parse hexadecimal integers correctly', async function () {
        strictEqual(await parser.evaluate('0x0'), 0x0);
        strictEqual(await parser.evaluate('0x1'), 0x1);
        strictEqual(await parser.evaluate('0xA'), 0xA);
        strictEqual(await parser.evaluate('0xF'), 0xF);
        strictEqual(await parser.evaluate('0x123'), 0x123);
        strictEqual(await parser.evaluate('0x123ABCD'), 0x123ABCD);
        strictEqual(await parser.evaluate('0xDEADBEEF'), 0xDEADBEEF);
        strictEqual(await parser.evaluate('0xdeadbeef'), 0xdeadbeef);
        strictEqual(await parser.evaluate('0xABCDEF'), 0xABCDEF);
        strictEqual(await parser.evaluate('0xabcdef'), 0xABCDEF);
        strictEqual(await parser.evaluate('0x1e+4'), 0x1e + 4);
        strictEqual(await parser.evaluate('0x1E+4'), 0x1e + 4);
        strictEqual(await parser.evaluate('0x1e-4'), 0x1e - 4);
        strictEqual(await parser.evaluate('0x1E-4'), 0x1e - 4);
        strictEqual(await parser.evaluate('0xFFFFFFFF'), Math.pow(2, 32) - 1);
        strictEqual(await parser.evaluate('0x100000000'), Math.pow(2, 32));
        strictEqual(await parser.evaluate('0x1FFFFFFFFFFFFF'), Math.pow(2, 53) - 1);
        strictEqual(await parser.evaluate('0x20000000000000'), Math.pow(2, 53));
      });

      it('should parse binary integers correctly', async function () {
        strictEqual(await parser.evaluate('0b0'), 0);
        strictEqual(await parser.evaluate('0b1'), 1);
        strictEqual(await parser.evaluate('0b01'), 1);
        strictEqual(await parser.evaluate('0b10'), 2);
        strictEqual(await parser.evaluate('0b100'), 4);
        strictEqual(await parser.evaluate('0b101'), 5);
        strictEqual(await parser.evaluate('0b10101'), 21);
        strictEqual(await parser.evaluate('0b10111'), 23);
        strictEqual(await parser.evaluate('0b11111'), 31);
        strictEqual(await parser.evaluate('0b11111111111111111111111111111111'), Math.pow(2, 32) - 1);
        strictEqual(await parser.evaluate('0b100000000000000000000000000000000'), Math.pow(2, 32));
        strictEqual(await parser.evaluate('0b11111111111111111111111111111111111111111111111111111'), Math.pow(2, 53) - 1);
        strictEqual(await parser.evaluate('0b100000000000000000000000000000000000000000000000000000'), Math.pow(2, 53));
      });

      it('should fail on invalid hexadecimal numbers', async function () {
        throws(function () { parser.parse('0x'); }, Error);
        throws(function () { parser.parse('0x + 1'); }, Error);
        throws(function () { parser.parse('0x1.23'); }, Error);
        throws(function () { parser.parse('0xG'); }, Error);
        throws(function () { parser.parse('0xx0'); }, Error);
        throws(function () { parser.parse('0x1g'); }, Error);
        throws(function () { parser.parse('1x0'); }, Error);
      });

      it('should fail on invalid binary numbers', async function () {
        throws(function () { parser.parse('0b'); }, Error);
        throws(function () { parser.parse('0b + 1'); }, Error);
        throws(function () { parser.parse('0b1.1'); }, Error);
        throws(function () { parser.parse('0b2'); }, Error);
        throws(function () { parser.parse('0bb0'); }, Error);
        throws(function () { parser.parse('0b1e+1'); }, Error);
        throws(function () { parser.parse('1b0'); }, Error);
      });

      it('should fail on unknown characters', async function () {
        throws(function () { parser.parse('1 + @'); }, Error);
      });

      it('should fail with partial operators', async function () {
        throws(function () { parser.parse('"a" | "b"'); }, Error);
        throws(function () { parser.parse('2 = 2'); }, Error);
        throws(function () { parser.parse('2 ! 3'); }, Error);
        throws(function () { parser.parse('1 o 0'); }, Error);
        throws(function () { parser.parse('1 an 2'); }, Error);
        throws(function () { parser.parse('1 a 2'); }, Error);
      });

      it('should parse strings', async function () {
        strictEqual(await parser.evaluate('\'asdf\''), 'asdf');
        strictEqual(await parser.evaluate('"asdf"'), 'asdf');
        strictEqual(await parser.evaluate('""'), '');
        strictEqual(await parser.evaluate('\'\''), '');
        strictEqual(await parser.evaluate('"  "'), '  ');
        strictEqual(await parser.evaluate('"a\nb\tc"'), 'a\nb\tc');
        strictEqual(await parser.evaluate('"Nested \'single quotes\'"'), 'Nested \'single quotes\'');
        strictEqual(await parser.evaluate('\'Nested "double quotes"\''), 'Nested "double quotes"');
        strictEqual(await parser.evaluate('\'Single quotes \\\'inside\\\' single quotes\''), 'Single quotes \'inside\' single quotes');
        strictEqual(await parser.evaluate('"Double quotes \\"inside\\" double quotes"'), 'Double quotes "inside" double quotes');
        strictEqual(await parser.evaluate('"\n"'), '\n');
        strictEqual(await parser.evaluate('"\\\'\\"\\\\\\/\\b\\f\\n\\r\\t\\u1234"'), '\'"\\/\b\f\n\r\t\u1234');
        strictEqual(await parser.evaluate('"\'\\"\\\\\\/\\b\\f\\n\\r\\t\\u1234"'), '\'"\\/\b\f\n\r\t\u1234');
        strictEqual(await parser.evaluate('\'\\\'\\"\\\\\\/\\b\\f\\n\\r\\t\\u1234\''), '\'"\\/\b\f\n\r\t\u1234');
        strictEqual(await parser.evaluate('\'\\\'"\\\\\\/\\b\\f\\n\\r\\t\\u1234\''), '\'"\\/\b\f\n\r\t\u1234');
        strictEqual(await parser.evaluate('"\\uFFFF"'), '\uFFFF');
        strictEqual(await parser.evaluate('"\\u0123"'), '\u0123');
        strictEqual(await parser.evaluate('"\\u4567"'), '\u4567');
        strictEqual(await parser.evaluate('"\\u89ab"'), '\u89ab');
        strictEqual(await parser.evaluate('"\\ucdef"'), '\ucdef');
        strictEqual(await parser.evaluate('"\\uABCD"'), '\uABCD');
        strictEqual(await parser.evaluate('"\\uEF01"'), '\uEF01');
        strictEqual(await parser.evaluate('"\\u11111"'), '\u11111');
      });

      it('should fail on bad strings', async function () {
        throws(function () { parser.parse('\'asdf"'); }, Error);
        throws(function () { parser.parse('"asdf\''); }, Error);
        throws(function () { parser.parse('"asdf'); }, Error);
        throws(function () { parser.parse('\'asdf'); }, Error);
        throws(function () { parser.parse('\'asdf\\'); }, Error);
        throws(function () { parser.parse('\''); }, Error);
        throws(function () { parser.parse('"'); }, Error);
        throws(function () { parser.parse('"\\x"'); }, Error);
        throws(function () { parser.parse('"\\u123"'); }, Error);
        throws(function () { parser.parse('"\\u12"'); }, Error);
        throws(function () { parser.parse('"\\u1"'); }, Error);
        throws(function () { parser.parse('"\\uGGGG"'); }, Error);
      });

      it('should parse arrays correctly', async function () {
        strictEqual(parser.parse('[1, 2, 3+4, 5*6, (7/8)]').toString(), '[1, 2, (3 + 4), (5 * 6), (7 / 8)]');
      });

      it('should parse empty arrays correctly', async function () {
        strictEqual(parser.parse('[]').toString(), '[]');
      });

      it('should fail with missing ]', async function () {
        throws(function () { parser.parse('[1, 2, 3+4, 5*6, (7/8)'); }, Error);
      });

      it('should parse operators that look like functions as function calls', async function () {
        strictEqual(parser.parse('sin 2^3').toString(), '(sin (2 ^ 3))');
        strictEqual(parser.parse('sin(2)^3').toString(), '((sin 2) ^ 3)');
        strictEqual(await parser.parse('sin 2^3').evaluate(), Math.sin(Math.pow(2, 3)));
        strictEqual(await parser.parse('sin(2)^3').evaluate(), Math.pow(Math.sin(2), 3));
      });

      it('should parse named prefix operators as function names at the end of expressions', async function () {
        strictEqual(parser.parse('sin;').toString(), '(sin)');
        strictEqual(parser.parse('(sin)').toString(), 'sin');
        strictEqual(parser.parse('sin; (2)^3').toString(), '(sin;(2 ^ 3))');
        deepStrictEqual(await parser.parse('f(sin, sqrt)').evaluate({ f: function (a, b) { return [a, b]; } }), [Math.sin, Math.sqrt]);
        strictEqual(await parser.parse('sin').evaluate(), Math.sin);
        strictEqual(await parser.parse('cos;').evaluate(), Math.cos);
        strictEqual(await parser.parse('cos;tan').evaluate(), Math.tan);
        strictEqual(await parser.parse('(floor)').evaluate(), Math.floor);
        strictEqual(await parser.parse('4; ceil').evaluate(), Math.ceil);
      });

      it('unary + and - should not be parsed as function calls', async function () {
        strictEqual(parser.parse('-2^3').toString(), '(-(2 ^ 3))');
        strictEqual(parser.parse('-(2)^3').toString(), '(-(2 ^ 3))');
      });

      it('should treat ∙ and • as * operators', async function () {
        strictEqual(parser.parse('2 ∙ 3').toString(), '(2 * 3)');
        strictEqual(parser.parse('4 • 5').toString(), '(4 * 5)');
      });

      it('should parse variables that start with operators', async function () {
        strictEqual(parser.parse('org > 5').toString(), '(org > 5)');
        strictEqual(parser.parse('android * 2').toString(), '(android * 2)');
        strictEqual(parser.parse('single == 1').toString(), '(single == 1)');
      });

      it('should parse valid variable names correctly', async function () {
        deepStrictEqual(parser.parse('a').variables(), ['a']);
        deepStrictEqual(parser.parse('abc').variables(), ['abc']);
        deepStrictEqual(parser.parse('a+b').variables(), ['a', 'b']);
        deepStrictEqual(parser.parse('ab+c').variables(), ['ab', 'c']);
        deepStrictEqual(parser.parse('a1').variables(), ['a1']);
        deepStrictEqual(parser.parse('a_1').variables(), ['a_1']);
        deepStrictEqual(parser.parse('a_').variables(), ['a_']);
        deepStrictEqual(parser.parse('a_c').variables(), ['a_c']);
        deepStrictEqual(parser.parse('A').variables(), ['A']);
        deepStrictEqual(parser.parse('ABC').variables(), ['ABC']);
        deepStrictEqual(parser.parse('A+B').variables(), ['A', 'B']);
        deepStrictEqual(parser.parse('AB+C').variables(), ['AB', 'C']);
        deepStrictEqual(parser.parse('A1').variables(), ['A1']);
        deepStrictEqual(parser.parse('A_1').variables(), ['A_1']);
        deepStrictEqual(parser.parse('A_C').variables(), ['A_C']);
        deepStrictEqual(parser.parse('abcdefg/hijklmnop+qrstuvwxyz').variables(), ['abcdefg', 'hijklmnop', 'qrstuvwxyz']);
        deepStrictEqual(parser.parse('ABCDEFG/HIJKLMNOP+QRSTUVWXYZ').variables(), ['ABCDEFG', 'HIJKLMNOP', 'QRSTUVWXYZ']);
        deepStrictEqual(parser.parse('abc123+def456*ghi789/jkl0').variables(), ['abc123', 'def456', 'ghi789', 'jkl0']);
        deepStrictEqual(parser.parse('_').variables(), ['_']);
        deepStrictEqual(parser.parse('_x').variables(), ['_x']);
        deepStrictEqual(parser.parse('$x').variables(), ['$x']);
        deepStrictEqual(parser.parse('$xyz').variables(), ['$xyz']);
        deepStrictEqual(parser.parse('$a_sdf').variables(), ['$a_sdf']);
        deepStrictEqual(parser.parse('$xyz_123').variables(), ['$xyz_123']);
        deepStrictEqual(parser.parse('_xyz_123').variables(), ['_xyz_123']);
      });

      it('should not parse invalid variables', async function () {
        throws(function () { parser.parse('a$x'); }, /parse error/);
        throws(function () { parser.parse('ab$'); }, /parse error/);
      });

      it('should not parse a single $ as a variable', async function () {
        throws(function () { parser.parse('$'); }, /parse error/);
      });

      it('should not allow leading digits in variable names', async function () {
        throws(function () { parser.parse('1a'); }, /parse error/);
        throws(function () { parser.parse('1_'); }, /parse error/);
        throws(function () { parser.parse('1_a'); }, /parse error/);
      });

      it('should not allow leading digits or _ after $ in variable names', async function () {
        throws(function () { parser.parse('$0'); }, /parse error/);
        throws(function () { parser.parse('$1a'); }, /parse error/);
        throws(function () { parser.parse('$_'); }, /parse error/);
        throws(function () { parser.parse('$_x'); }, /parse error/);
      });

      it('should track token positions correctly', async function () {
        throws(function () { parser.parse('@23'); }, /parse error \[1:1]/);
        throws(function () { parser.parse('\n@23'); }, /parse error \[2:1]/);
        throws(function () { parser.parse('1@3'); }, /parse error \[1:2]/);
        throws(function () { parser.parse('12@'); }, /parse error \[1:3]/);
        throws(function () { parser.parse('12@\n'); }, /parse error \[1:3]/);
        throws(function () { parser.parse('@23 +\n45 +\n6789'); }, /parse error \[1:1]/);
        throws(function () { parser.parse('1@3 +\n45 +\n6789'); }, /parse error \[1:2]/);
        throws(function () { parser.parse('12@ +\n45 +\n6789'); }, /parse error \[1:3]/);
        throws(function () { parser.parse('123 +\n@5 +\n6789'); }, /parse error \[2:1]/);
        throws(function () { parser.parse('123 +\n4@ +\n6789'); }, /parse error \[2:2]/);
        throws(function () { parser.parse('123 +\n45@+\n6789'); }, /parse error \[2:3]/);
        throws(function () { parser.parse('123 +\n45 +\n@789'); }, /parse error \[3:1]/);
        throws(function () { parser.parse('123 +\n45 +\n6@89'); }, /parse error \[3:2]/);
        throws(function () { parser.parse('123 +\n45 +\n67@9'); }, /parse error \[3:3]/);
        throws(function () { parser.parse('123 +\n45 +\n679@'); }, /parse error \[3:4]/);
        throws(function () { parser.parse('123 +\n\n679@'); }, /parse error \[3:4]/);
        throws(function () { parser.parse('123 +\n\n\n\n\n679@'); }, /parse error \[6:4]/);
      });

      it('should allow operators to be disabled', async function () {
        const parser = new Parser({
          operators: {
            add: false,
            sin: false,
            remainder: false,
            divide: false
          }
        });
        throws(function () { parser.parse('+1'); }, /\+/);
        throws(function () { parser.parse('1 + 2'); }, /\+/);
        strictEqual(parser.parse('sin(0)').toString(), 'sin(0)');
        rejects(function () { return parser.evaluate('sin(0)'); }, /sin/);
        throws(function () { parser.parse('4 % 5'); }, /%/);
        throws(function () { parser.parse('4 / 5'); }, /\//);
      });

      it('should allow operators to be explicitly enabled', async function () {
        const parser = new Parser({
          operators: {
            add: true,
            sqrt: true,
            divide: true,
            in: true,
            assignment: true
          }
        });
        strictEqual(await parser.evaluate('+(-1)'), -1);
        strictEqual(await parser.evaluate('sqrt(16)'), 4);
        strictEqual(await parser.evaluate('4 / 6'), 2 / 3);
        strictEqual(await parser.evaluate('3 in array', { array: [1, 2, 3] }), true);
        strictEqual(await parser.evaluate('x = 4', { x: 2 }), 4);
      });
    });

    it('should allow addition operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          add: false
        }
      });

      throws(function () { parser.parse('2 + 3'); }, /\+/);
    });

    it('should allow comparison operators to be disabled', async function () {
      const parser = new Parser({
        operators: {
          comparison: false
        }
      });

      throws(function () { parser.parse('1 == 1'); }, /=/);
      throws(function () { parser.parse('1 != 2'); }, /!/);
      throws(function () { parser.parse('1 > 0'); }, />/);
      throws(function () { parser.parse('1 >= 0'); }, />/);
      throws(function () { parser.parse('1 < 2'); }, /</);
      throws(function () { parser.parse('1 <= 2'); }, /</);
    });

    it('should allow concatenate operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          concatenate: false
        }
      });

      throws(function () { parser.parse('"as" || "df"'); }, /\|/);
    });

    it('should allow conditional operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          conditional: false
        }
      });

      throws(function () { parser.parse('true ? 1 : 0'); }, /\?/);
    });

    it('should allow division operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          divide: false
        }
      });

      throws(function () { parser.parse('2 / 3'); }, /\//);
    });

    it('should allow factorial operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          factorial: false
        }
      });

      throws(function () { parser.parse('5!'); }, /!/);
    });

    it('should allow in operator to be enabled', async function () {
      const parser = new Parser({
        operators: {
          in: true
        }
      });

      throws(function () { parser.parse('5 * in'); }, Error);
      strictEqual(await parser.evaluate('5 in a', { a: [2, 3, 5] }), true);
    });

    it('should allow in operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          in: false
        }
      });

      throws(function () { parser.parse('5 in a'); }, Error);
      strictEqual(await parser.evaluate('5 * in', { in: 3 }), 15);
    });

    it('should allow logical operators to be disabled', async function () {
      const parser = new Parser({
        operators: {
          logical: false
        }
      });

      throws(function () { parser.parse('true and true'); }, Error);
      throws(function () { parser.parse('true or false'); }, Error);
      throws(function () { parser.parse('not false'); }, Error);

      strictEqual(await parser.evaluate('and * or + not', { and: 3, or: 5, not: 2 }), 17);
    });

    it('should allow multiplication operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          multiply: false
        }
      });

      throws(function () { parser.parse('3 * 4'); }, /\*/);
    });

    it('should allow power operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          power: false
        }
      });

      throws(function () { parser.parse('3 ^ 4'); }, /\^/);
    });

    it('should allow remainder operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          remainder: false
        }
      });

      throws(function () { parser.parse('3 % 2'); }, /%/);
    });

    it('should allow subtraction operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          subtract: false
        }
      });

      throws(function () { parser.parse('5 - 3'); }, /-/);
    });

    it('should allow assignment operator to be enabled', async function () {
      const parser = new Parser({
        operators: {
          assignment: true
        }
      });

      throws(function () { parser.parse('a ='); }, Error);
      strictEqual(await parser.evaluate('a = 5', {}), 5);
    });

    it('should allow assignment operator to be disabled', async function () {
      const parser = new Parser({
        operators: {
          assignment: false
        }
      });

      throws(function () { parser.parse('a = 5'); }, Error);
    });

    it('should allow assignment operator by default', async function () {
      const parser = new Parser();

      strictEqual(await parser.evaluate('a = 5', {}), 5);
    });

    it('should allow arrays to be enabled', async function () {
      const parser = new Parser({
        operators: {
          array: true
        }
      });

      deepStrictEqual(await parser.evaluate('[1, 2, 3]'), [1, 2, 3]);
      strictEqual(await parser.evaluate('a[0]', { a: [4, 2] }), 4);
    });

    it('should allow arrays to be disabled', async function () {
      const parser = new Parser({
        operators: {
          array: false
        }
      });

      throws(function () { parser.parse('[1, 2, 3]'); }, /\[/);
      throws(function () { parser.parse('a[0]'); }, /\[/);
    });

    it('Should allow functions to be disabled', async function () {
      const parser = new Parser({
        operators: {
          fndef: false
        }
      });
      const obj = {};
      throws(function () { parser.parse('f(x) = x * x'); }, /function definition is not permitted/);
      strictEqual('f' in obj, false);
      strictEqual('x' in obj, false);
    });

    it('Should allow functions to be enabled', async function () {
      const parser = new Parser({
        operators: {
          fndef: true
        }
      });
      const obj: any = {};
      strictEqual(await parser.evaluate('f(x) = x * x', obj) instanceof Function, true);
      strictEqual(obj.f instanceof Function, true);
      strictEqual(await obj.f(3), 9);
    });

    it('Disabling assignment should disable function definition', async function () {
      const parser = new Parser({
        operators: {
          assignment: false
        }
      });
      const obj = {};
      throws(function () { parser.parse('f(x) = x * x'); }, Error);
      strictEqual('f' in obj, false);
      strictEqual('x' in obj, false);
    });
  });

  it('should disallow member access', async function () {
    const parser = new Parser({ allowMemberAccess: false });
    await rejects(async function () { return parser.evaluate('min.bind'); }, /member access is not permitted/);
    await rejects(async function () { return parser.evaluate('min.bind()'); }, /member access is not permitted/);
    await rejects(async function () { return parser.evaluate('32 + min.bind'); }, /member access is not permitted/);
    await rejects(async function () { return parser.evaluate('a.b', { a: { b: 2 } }); }, /member access is not permitted/);
  });
});
