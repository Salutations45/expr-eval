/* global describe, it */

'use strict';

const assert = require('assert');
const Parser = require('../dist/bundle').Parser;
const spy = require('./lib/spy');

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function assertCloseTo(expected, actual, delta) {
  return assert.ok(Math.abs(expected - actual) <= delta);
}

describe('Operators', async function () {
  const parser = new Parser();

  describe('== operator', async function () {
    it('2 == 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 == 3'), false);
    });

    it('3 * 1 == 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 == 2'), false);
    });

    it('3 == 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 == 3'), true);
    });

    it('\'3\' == 3', async function () {
      assert.strictEqual(await Parser.evaluate('\'3\' == 3'), false);
    });

    it('\'string 1\' == \'string 2\'', async function () {
      assert.strictEqual(await Parser.evaluate('\'string 1\' == \'string 2\''), false);
    });

    it('\'string 1\' == "string 1"', async function () {
      assert.strictEqual(await Parser.evaluate('\'string 1\' == \'string 1\''), true);
    });

    it('\'3\' == \'3\'', async function () {
      assert.strictEqual(await Parser.evaluate('\'3\' == \'3\''), true);
    });
  });

  describe('!= operator', async function () {
    it('2 != 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 != 3'), true);
    });

    it('3 != 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 != 2'), true);
    });

    it('3 != 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 != 3'), false);
    });

    it('\'3\' != 3', async function () {
      assert.strictEqual(await Parser.evaluate('\'3\' != 3'), true);
    });

    it('\'3\' != \'3\'', async function () {
      assert.strictEqual(await Parser.evaluate('\'3\' != \'3\''), false);
    });

    it('\'string 1\' != \'string 1\'', async function () {
      assert.strictEqual(await Parser.evaluate('\'string 1\' != \'string 1\''), false);
    });

    it('\'string 1\' != \'string 2\'', async function () {
      assert.strictEqual(await Parser.evaluate('\'string 1\' != \'string 2\''), true);
    });
  });

  describe('> operator', async function () {
    it('2 > 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 > 3'), false);
    });

    it('3 > 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 > 2'), true);
    });

    it('3 > 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 > 3'), false);
    });
  });

  describe('>= operator', async function () {
    it('2 >= 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 >= 3'), false);
    });

    it('3 >= 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 >= 2'), true);
    });

    it('3 >= 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 >= 3'), true);
    });
  });

  describe('< operator', async function () {
    it('2 < 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 < 3'), true);
    });

    it('3 < 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 < 2'), false);
    });

    it('3 < 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 < 3'), false);
    });
  });

  describe('<= operator', async function () {
    it('2 <= 3', async function () {
      assert.strictEqual(await Parser.evaluate('2 <= 3'), true);
    });

    it('3 <= 2', async function () {
      assert.strictEqual(await Parser.evaluate('3 <= 2'), false);
    });

    it('3 <= 3', async function () {
      assert.strictEqual(await Parser.evaluate('3 <= 3'), true);
    });
  });

  describe('and operator', async function () {
    it('1 and 0', async function () {
      assert.strictEqual(await Parser.evaluate('1 and 0'), false);
    });

    it('1 and 1', async function () {
      assert.strictEqual(await Parser.evaluate('1 and 1'), true);
    });

    it('0 and 0', async function () {
      assert.strictEqual(await Parser.evaluate('0 and 0'), false);
    });

    it('0 and 1', async function () {
      assert.strictEqual(await Parser.evaluate('0 and 1'), false);
    });

    it('0 and 1 and 0', async function () {
      assert.strictEqual(await Parser.evaluate('0 and 1 and 0'), false);
    });

    it('1 and 1 and 0', async function () {
      assert.strictEqual(await Parser.evaluate('1 and 1 and 0'), false);
    });

    it('skips rhs when lhs is false', async function () {
      const notCalled = spy(returnFalse);

      assert.strictEqual(await Parser.evaluate('false and notCalled()', { notCalled }), false);
      assert.strictEqual(notCalled.called, false);
    });

    it('evaluates rhs when lhs is true', async function () {
      const called = spy(returnFalse);

      assert.strictEqual(await Parser.evaluate('true and called()', { called }), false);
      assert.strictEqual(called.called, true);
    });
  });

  describe('or operator', async function () {
    it('1 or 0', async function () {
      assert.strictEqual(await Parser.evaluate('1 or 0'), true);
    });

    it('1 or 1', async function () {
      assert.strictEqual(await Parser.evaluate('1 or 1'), true);
    });

    it('0 or 0', async function () {
      assert.strictEqual(await Parser.evaluate('0 or 0'), false);
    });

    it('0 or 1', async function () {
      assert.strictEqual(await Parser.evaluate('0 or 1'), true);
    });

    it('0 or 1 or 0', async function () {
      assert.strictEqual(await Parser.evaluate('0 or 1 or 0'), true);
    });

    it('1 or 1 or 0', async function () {
      assert.strictEqual(await Parser.evaluate('1 or 1 or 0'), true);
    });

    it('skips rhs when lhs is true', async function () {
      const notCalled = spy(returnFalse);

      assert.strictEqual(await Parser.evaluate('true or notCalled()', { notCalled }), true);
      assert.strictEqual(notCalled.called, false);
    });

    it('evaluates rhs when lhs is false', async function () {
      const called = spy(returnTrue);

      assert.strictEqual(await Parser.evaluate('false or called()', { called }), true);
      assert.strictEqual(called.called, true);
    });
  });

  describe('in operator', async function () {
    const parser = new Parser();

    it('"a" in ["a", "b"]', async function () {
      assert.strictEqual(await parser.evaluate('"a" in toto', { toto: ['a', 'b'] }), true);
    });

    it('"a" in ["b", "a"]', async function () {
      assert.strictEqual(await parser.evaluate('"a" in toto', { toto: ['b', 'a'] }), true);
    });

    it('3 in [4, 3]', async function () {
      assert.strictEqual(await parser.evaluate('3 in toto', { toto: [4, 3] }), true);
    });

    it('"c" in ["a", "b"]', async function () {
      assert.strictEqual(await parser.evaluate('"c" in toto', { toto: ['a', 'b'] }), false);
    });

    it('"c" in ["b", "a"]', async function () {
      assert.strictEqual(await parser.evaluate('"c" in toto', { toto: ['b', 'a'] }), false);
    });

    it('3 in [1, 2]', async function () {
      assert.strictEqual(await parser.evaluate('3 in toto', { toto: [1, 2] }), false);
    });
  });

  describe('not operator', async function () {
    it('not 1', async function () {
      assert.strictEqual(await Parser.evaluate('not 1'), false);
    });

    it('not true', async function () {
      assert.strictEqual(await Parser.evaluate('not true'), false);
    });

    it('not 0', async function () {
      assert.strictEqual(await Parser.evaluate('not 0'), true);
    });

    it('not false', async function () {
      assert.strictEqual(await Parser.evaluate('not false'), true);
    });

    it('not 4', async function () {
      assert.strictEqual(await Parser.evaluate('not 4'), false);
    });

    it('1 and not 0', async function () {
      assert.strictEqual(await Parser.evaluate('1 and not 0'), true);
    });

    it('not \'0\'', async function () {
      assert.strictEqual(await Parser.evaluate('not \'0\''), false);
    });

    it('not \'\'', async function () {
      assert.strictEqual(await Parser.evaluate('not \'\''), true);
    });
  });

  describe('conditional operator', async function () {
    const parser = new Parser();

    it('1 ? 2 : 0 ? 3 : 4', async function () {
      assert.strictEqual(await parser.evaluate('1 ? 2 : 0 ? 3 : 4'), 2);
    });

    it('(1 ? 2 : 0) ? 3 : 4', async function () {
      assert.strictEqual(await parser.evaluate('(1 ? 2 : 0) ? 3 : 4'), 3);
    });

    it('0 ? 2 : 0 ? 3 : 4', async function () {
      assert.strictEqual(await parser.evaluate('0 ? 2 : 0 ? 3 : 4'), 4);
    });

    it('(0 ? 2 : 0) ? 3 : 4', async function () {
      assert.strictEqual(await parser.evaluate('0 ? 2 : 0 ? 3 : 4'), 4);
    });

    it('(0 ? 0 : 2) ? 3 : 4', async function () {
      assert.strictEqual(await parser.evaluate('(1 ? 2 : 0) ? 3 : 4'), 3);
    });

    it('min(1 ? 3 : 10, 0 ? 11 : 2)', async function () {
      assert.strictEqual(await parser.evaluate('min(1 ? 3 : 10, 0 ? 11 : 2)'), 2);
    });

    it('a == 1 ? b == 2 ? 3 : 4 : 5', async function () {
      assert.strictEqual(await parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 1, b: 2 }), 3);
      assert.strictEqual(await parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 1, b: 9 }), 4);
      assert.strictEqual(await parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 9, b: 2 }), 5);
      assert.strictEqual(await parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 9, b: 9 }), 5);
    });

    it('should only evaluate one branch', async function () {
      assert.strictEqual(await parser.evaluate('1 ? 42 : fail'), 42);
      assert.strictEqual(await parser.evaluate('0 ? fail : 99'), 99);
    });
  });

  describe('length operator', async function () {
    const parser = new Parser();

    it('should return 0 for empty strings', async function () {
      assert.strictEqual(await parser.evaluate('length ""'), 0);
    });

    it('should return the length of a string', async function () {
      assert.strictEqual(await parser.evaluate('length "a"'), 1);
      assert.strictEqual(await parser.evaluate('length "as"'), 2);
      assert.strictEqual(await parser.evaluate('length "asd"'), 3);
      assert.strictEqual(await parser.evaluate('length "asdf"'), 4);
    });

    it('should convert numbers to strings', async function () {
      assert.strictEqual(await parser.evaluate('length 0'), 1);
      assert.strictEqual(await parser.evaluate('length 12'), 2);
      assert.strictEqual(await parser.evaluate('length 999'), 3);
      assert.strictEqual(await parser.evaluate('length 1000'), 4);
      assert.strictEqual(await parser.evaluate('length -1'), 2);
      assert.strictEqual(await parser.evaluate('length -999'), 4);
    });

    it('should return 0 for empty arrays', async function () {
      assert.strictEqual(await parser.evaluate('length []'), 0);
    });

    it('should return the length of an array', async function () {
      assert.strictEqual(await parser.evaluate('length [123]'), 1);
      assert.strictEqual(await parser.evaluate('length [123, 456]'), 2);
      assert.strictEqual(await parser.evaluate('length [12, 34, 56]'), 3);
      assert.strictEqual(await parser.evaluate('length [1, 2, 3, 4]'), 4);
    });
  });

  describe('% operator', async function () {
    it('has the correct precedence', async function () {
      assert.strictEqual(parser.parse('a + b % c ^ d').toString(), '(a + (b % (c ^ d)))');
      assert.strictEqual(parser.parse('a + b * c % d').toString(), '(a + ((b * c) % d))');
      assert.strictEqual(parser.parse('a + b % c * d').toString(), '(a + ((b % c) * d))');
      assert.strictEqual(parser.parse('a + b % c % d').toString(), '(a + ((b % c) % d))');
    });

    it('returns the correct value', async function () {
      assert.strictEqual(await parser.evaluate('0 % 5'), 0);
      assert.strictEqual(await parser.evaluate('1 % 5'), 1);
      assert.strictEqual(await parser.evaluate('2 % 5'), 2);
      assert.strictEqual(await parser.evaluate('3 % 5'), 3);
      assert.strictEqual(await parser.evaluate('4 % 5'), 4);
      assert.strictEqual(await parser.evaluate('5 % 5'), 0);
      assert.strictEqual(await parser.evaluate('6 % 5'), 1);
      assert.strictEqual(await parser.evaluate('-2 % 5'), -2);
      assert.strictEqual(await parser.evaluate('-6 % 5'), -1);
    });

    it('returns NaN for 0 divisor', async function () {
      assert.ok(isNaN(await parser.evaluate('0 % 0')));
      assert.ok(isNaN(await parser.evaluate('1 % 0')));
      assert.ok(isNaN(await parser.evaluate('-1 % 0')));
    });
  });

  describe('sin(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('sin 0'), 0);
      assertCloseTo(await parser.evaluate('sin 0.5'), 0.479425538604203, delta);
      assertCloseTo(await parser.evaluate('sin 1'), 0.8414709848078965, delta);
      assertCloseTo(await parser.evaluate('sin -1'), -0.8414709848078965, delta);
      assertCloseTo(await parser.evaluate('sin(PI/4)'), 0.7071067811865475, delta);
      assertCloseTo(await parser.evaluate('sin(PI/2)'), 1, delta);
      assertCloseTo(await parser.evaluate('sin(3*PI/4)'), 0.7071067811865475, delta);
      assertCloseTo(await parser.evaluate('sin PI'), 0, delta);
      assertCloseTo(await parser.evaluate('sin(2*PI)'), 0, delta);
      assertCloseTo(await parser.evaluate('sin(-PI)'), 0, delta);
      assertCloseTo(await parser.evaluate('sin(3*PI/2)'), -1, delta);
      assertCloseTo(await parser.evaluate('sin 15'), 0.6502878401571168, delta);
    });
  });

  describe('cos(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('cos 0'), 1);
      assertCloseTo(await parser.evaluate('cos 0.5'), 0.8775825618903728, delta);
      assertCloseTo(await parser.evaluate('cos 1'), 0.5403023058681398, delta);
      assertCloseTo(await parser.evaluate('cos -1'), 0.5403023058681398, delta);
      assertCloseTo(await parser.evaluate('cos(PI/4)'), 0.7071067811865475, delta);
      assertCloseTo(await parser.evaluate('cos(PI/2)'), 0, delta);
      assertCloseTo(await parser.evaluate('cos(3*PI/4)'), -0.7071067811865475, delta);
      assertCloseTo(await parser.evaluate('cos PI'), -1, delta);
      assertCloseTo(await parser.evaluate('cos(2*PI)'), 1, delta);
      assertCloseTo(await parser.evaluate('cos -PI'), -1, delta);
      assertCloseTo(await parser.evaluate('cos(3*PI/2)'), 0, delta);
      assertCloseTo(await parser.evaluate('cos 15'), -0.7596879128588213, delta);
    });
  });

  describe('tan(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('tan 0'), 0);
      assertCloseTo(await parser.evaluate('tan 0.5'), 0.5463024898437905, delta);
      assertCloseTo(await parser.evaluate('tan 1'), 1.5574077246549023, delta);
      assertCloseTo(await parser.evaluate('tan -1'), -1.5574077246549023, delta);
      assertCloseTo(await parser.evaluate('tan(PI/4)'), 1, delta);
      assert.ok(await parser.evaluate('tan(PI/2)') > 1e16);
      assertCloseTo(await parser.evaluate('tan(3*PI/4)'), -1, delta);
      assertCloseTo(await parser.evaluate('tan PI'), 0, delta);
      assertCloseTo(await parser.evaluate('tan(2*PI)'), 0, delta);
      assertCloseTo(await parser.evaluate('tan -PI'), 0, delta);
      assert.ok(await parser.evaluate('tan(3*PI/2)') > 1e15);
      assertCloseTo(await parser.evaluate('tan 15'), -0.8559934009085188, delta);
    });
  });

  describe('asin(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('asin 0'), 0);
      assertCloseTo(await parser.evaluate('asin 0.5'), 0.5235987755982989, delta);
      assertCloseTo(await parser.evaluate('asin -0.5'), -0.5235987755982989, delta);
      assertCloseTo(await parser.evaluate('asin 1'), Math.PI / 2, delta);
      assertCloseTo(await parser.evaluate('asin -1'), -Math.PI / 2, delta);
      assertCloseTo(await parser.evaluate('asin(PI/4)'), 0.9033391107665127, delta);
      assert.ok(isNaN(await parser.evaluate('asin 1.1')));
      assert.ok(isNaN(await parser.evaluate('asin -1.1')));
    });
  });

  describe('acos(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('acos 0'), Math.PI / 2);
      assertCloseTo(await parser.evaluate('acos 0.5'), 1.0471975511965979, delta);
      assertCloseTo(await parser.evaluate('acos -0.5'), 2.0943951023931957, delta);
      assertCloseTo(await parser.evaluate('acos 1'), 0, delta);
      assertCloseTo(await parser.evaluate('acos -1'), Math.PI, delta);
      assertCloseTo(await parser.evaluate('acos(PI/4)'), 0.6674572160283838, delta);
      assert.ok(isNaN(await parser.evaluate('acos 1.1')));
      assert.ok(isNaN(await parser.evaluate('acos -1.1')));
    });
  });

  describe('atan(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('atan 0'), 0);
      assertCloseTo(await parser.evaluate('atan 0.5'), 0.4636476090008061, delta);
      assertCloseTo(await parser.evaluate('atan -0.5'), -0.4636476090008061, delta);
      assertCloseTo(await parser.evaluate('atan 1'), Math.PI / 4, delta);
      assertCloseTo(await parser.evaluate('atan -1'), -Math.PI / 4, delta);
      assertCloseTo(await parser.evaluate('atan(PI/4)'), 0.6657737500283538, delta);
      assertCloseTo(await parser.evaluate('atan PI'), 1.2626272556789118, delta);
      assertCloseTo(await parser.evaluate('atan -PI'), -1.2626272556789118, delta);
      assert.strictEqual(await parser.evaluate('atan(1/0)'), Math.PI / 2);
      assert.strictEqual(await parser.evaluate('atan(-1/0)'), -Math.PI / 2);
      assertCloseTo(await parser.evaluate('atan 10'), 1.4711276743037347, delta);
      assertCloseTo(await parser.evaluate('atan 100'), 1.5607966601082315, delta);
      assertCloseTo(await parser.evaluate('atan 1000'), 1.5697963271282298, delta);
      assertCloseTo(await parser.evaluate('atan 2000'), 1.5702963268365633, delta);
    });
  });

  describe('sinh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('sinh 0'), 0);
      assertCloseTo(await parser.evaluate('sinh 0.5'), 0.5210953054937474, delta);
      assertCloseTo(await parser.evaluate('sinh -0.5'), -0.5210953054937474, delta);
      assertCloseTo(await parser.evaluate('sinh 1'), 1.1752011936438014, delta);
      assertCloseTo(await parser.evaluate('sinh -1'), -1.1752011936438014, delta);
      assertCloseTo(await parser.evaluate('sinh(PI/4)'), 0.8686709614860095, delta);
      assertCloseTo(await parser.evaluate('sinh(PI/2)'), 2.3012989023072947, delta);
      assertCloseTo(await parser.evaluate('sinh(3*PI/4)'), 5.227971924677803, delta);
      assertCloseTo(await parser.evaluate('sinh PI'), 11.548739357257748, delta * 10);
      assertCloseTo(await parser.evaluate('sinh(2*PI)'), 267.74489404101644, delta * 1000);
      assertCloseTo(await parser.evaluate('sinh -PI'), -11.548739357257748, delta * 10);
      assertCloseTo(await parser.evaluate('sinh(3*PI/2)'), 55.65439759941754, delta * 100);
      assertCloseTo(await parser.evaluate('sinh 15'), 1634508.6862359024, delta * 1000000);
      assert.strictEqual(await parser.evaluate('sinh(1 / 0)'), Infinity);
      assert.strictEqual(await parser.evaluate('sinh(-1 / 0)'), -Infinity);
    });
  });

  describe('cosh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('cosh 0'), 1);
      assertCloseTo(await parser.evaluate('cosh 0.5'), 1.1276259652063807, delta);
      assertCloseTo(await parser.evaluate('cosh -0.5'), 1.1276259652063807, delta);
      assertCloseTo(await parser.evaluate('cosh 1'), 1.5430806348152437, delta);
      assertCloseTo(await parser.evaluate('cosh -1'), 1.5430806348152437, delta);
      assertCloseTo(await parser.evaluate('cosh(PI/4)'), 1.324609089252006, delta);
      assertCloseTo(await parser.evaluate('cosh(PI/2)'), 2.509178478658057, delta);
      assertCloseTo(await parser.evaluate('cosh(3*PI/4)'), 5.3227521495199595, delta);
      assertCloseTo(await parser.evaluate('cosh PI'), 11.591953275521522, delta * 10);
      assertCloseTo(await parser.evaluate('cosh(2*PI)'), 267.7467614837483, delta * 1000);
      assertCloseTo(await parser.evaluate('cosh -PI'), 11.591953275521522, delta * 10);
      assertCloseTo(await parser.evaluate('cosh(3*PI/2)'), 55.663380890438695, delta * 100);
      assertCloseTo(await parser.evaluate('cosh 15'), 1634508.6862362078, delta * 1e7);
      assert.strictEqual(await parser.evaluate('cosh(1 / 0)'), Infinity);
      assert.strictEqual(await parser.evaluate('cosh(-1 / 0)'), Infinity);
    });
  });

  describe('tanh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('tanh 0'), 0);
      assertCloseTo(await parser.evaluate('tanh 0.00001'), 0.000009999999999621023, delta);
      assertCloseTo(await parser.evaluate('tanh 0.25'), 0.24491866240370924, delta);
      assertCloseTo(await parser.evaluate('tanh -0.25'), -0.24491866240370924, delta);
      assertCloseTo(await parser.evaluate('tanh 0.5'), 0.4621171572600098, delta);
      assertCloseTo(await parser.evaluate('tanh -0.5'), -0.4621171572600098, delta);
      assertCloseTo(await parser.evaluate('tanh 1'), 0.7615941559557649, delta);
      assertCloseTo(await parser.evaluate('tanh -1'), -0.7615941559557649, delta);
      assertCloseTo(await parser.evaluate('tanh(PI/4)'), 0.6557942026326725, delta);
      assertCloseTo(await parser.evaluate('tanh(PI/2)'), 0.9171523356672744, delta);
      assertCloseTo(await parser.evaluate('tanh PI'), 0.9962720762207501, delta);
      assertCloseTo(await parser.evaluate('tanh -PI'), -0.9962720762207501, delta);
      assertCloseTo(await parser.evaluate('tanh(2*PI)'), 0.9999930253396105, delta);
      assertCloseTo(await parser.evaluate('tanh 15'), 0.9999999999998128, delta);
      assertCloseTo(await parser.evaluate('tanh -15'), -0.9999999999998128, delta);
      assertCloseTo(await parser.evaluate('tanh 16'), 0.9999999999999748, delta);
      assertCloseTo(await parser.evaluate('tanh 17'), 0.9999999999999966, delta);
      assert.strictEqual(await parser.evaluate('tanh 20'), 1);
      assert.strictEqual(await parser.evaluate('tanh -20'), -1);
      assert.strictEqual(await parser.evaluate('tanh 100'), 1);
      assert.strictEqual(await parser.evaluate('tanh -100'), -1);
      assert.strictEqual(await parser.evaluate('tanh(1 / 0)'), 1);
      assert.strictEqual(await parser.evaluate('tanh(-1 / 0)'), -1);
    });
  });

  describe('asinh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('asinh 0'), 0);
      assertCloseTo(await parser.evaluate('asinh 0.5'), 0.48121182505960347, delta);
      assertCloseTo(await parser.evaluate('asinh -0.5'), -0.48121182505960347, delta);
      assertCloseTo(await parser.evaluate('asinh 1'), 0.881373587019543, delta);
      assertCloseTo(await parser.evaluate('asinh -1'), -0.881373587019543, delta);
      assertCloseTo(await parser.evaluate('asinh(PI/4)'), 0.7212254887267799, delta);
      assertCloseTo(await parser.evaluate('asinh(PI/2)'), 1.233403117511217, delta);
      assertCloseTo(await parser.evaluate('asinh(3*PI/4)'), 1.5924573728585427, delta);
      assertCloseTo(await parser.evaluate('asinh PI'), 1.8622957433108482, delta);
      assertCloseTo(await parser.evaluate('asinh(2*PI)'), 2.537297501373361, delta);
      assertCloseTo(await parser.evaluate('asinh -PI'), -1.8622957433108482, delta);
      assertCloseTo(await parser.evaluate('asinh(3*PI/2)'), 2.2544145929927146, delta);
      assertCloseTo(await parser.evaluate('asinh 15'), 3.4023066454805946, delta);
      assertCloseTo(await parser.evaluate('asinh 100'), 5.298342365610589, delta);
      assertCloseTo(await parser.evaluate('asinh 1000'), 7.600902709541988, delta);
      assert.strictEqual(await parser.evaluate('asinh(1 / 0)'), Infinity);
      assert.strictEqual(await parser.evaluate('asinh(-1 / 0)'), -Infinity);
    });
  });

  describe('acosh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.ok(isNaN(await parser.evaluate('acosh 0')));
      assert.ok(isNaN(await parser.evaluate('acosh 0.5')));
      assert.ok(isNaN(await parser.evaluate('acosh -0.5')));
      assert.ok(isNaN(await parser.evaluate('acosh -1')));
      assert.strictEqual(await parser.evaluate('acosh 1'), 0);
      assertCloseTo(await parser.evaluate('acosh(PI/2)'), 1.0232274785475506, delta);
      assertCloseTo(await parser.evaluate('acosh(3*PI/4)'), 1.5017757950235857, delta);
      assertCloseTo(await parser.evaluate('acosh PI'), 1.8115262724608532, delta);
      assertCloseTo(await parser.evaluate('acosh(2*PI)'), 2.524630659933467, delta);
      assertCloseTo(await parser.evaluate('acosh(3*PI/2)'), 2.2318892530580827, delta);
      assertCloseTo(await parser.evaluate('acosh 15'), 3.4000844141133393, delta);
      assertCloseTo(await parser.evaluate('acosh 100'), 5.298292365610485, delta);
      assertCloseTo(await parser.evaluate('acosh 1000'), 7.600902209541989, delta);
      assert.strictEqual(await parser.evaluate('acosh(1 / 0)'), Infinity);
      assert.ok(isNaN(await parser.evaluate('acosh(-1 / 0)')));
    });
  });

  describe('atanh(x)', async function () {
    it('returns the correct value', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('atanh 0'), 0);
      assertCloseTo(await parser.evaluate('atanh 0.25'), 0.25541281188299536, delta);
      assertCloseTo(await parser.evaluate('atanh -0.25'), -0.25541281188299536, delta);
      assertCloseTo(await parser.evaluate('atanh 0.5'), 0.5493061443340549, delta);
      assertCloseTo(await parser.evaluate('atanh -0.5'), -0.5493061443340549, delta);
      assert.strictEqual(await parser.evaluate('atanh 1'), Infinity);
      assert.strictEqual(await parser.evaluate('atanh -1'), -Infinity);
      assert.ok(isNaN(await parser.evaluate('atanh 1.001')));
      assert.ok(isNaN(await parser.evaluate('atanh -1.001')));
      assert.ok(isNaN(await parser.evaluate('atanh(1 / 0)')));
      assert.ok(isNaN(await parser.evaluate('atanh(-1 / 0)')));
    });
  });

  describe('sqrt(x)', async function () {
    it('returns the square root of its argument', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('sqrt 0'), 0);
      assertCloseTo(await parser.evaluate('sqrt 0.5'), 0.7071067811865476, delta);
      assert.strictEqual(await parser.evaluate('sqrt 1'), 1);
      assertCloseTo(await parser.evaluate('sqrt 2'), 1.4142135623730951, delta);
      assert.strictEqual(await parser.evaluate('sqrt 4'), 2);
      assertCloseTo(await parser.evaluate('sqrt 8'), 2.8284271247461903, 0);
      assert.strictEqual(await parser.evaluate('sqrt 16'), 4);
      assert.strictEqual(await parser.evaluate('sqrt 81'), 9);
      assert.strictEqual(await parser.evaluate('sqrt 100'), 10);
      assert.strictEqual(await parser.evaluate('sqrt 1000'), 31.622776601683793);
      assert.ok(isNaN(await parser.evaluate('sqrt -1')));
    });
  });

  describe('ln/log operator', async function () {
    it('returns the natural logarithm of its argument', async function () {
      const delta = 1e-15;
      assert.strictEqual(await Parser.evaluate('ln 0'), -Infinity);
      assert.strictEqual(await Parser.evaluate('log 0'), -Infinity);
      assertCloseTo(await Parser.evaluate('ln 0.5'), -0.6931471805599453, delta);
      assertCloseTo(await Parser.evaluate('log 0.5'), -0.6931471805599453, delta);
      assert.strictEqual(await Parser.evaluate('ln 1'), 0);
      assert.strictEqual(await Parser.evaluate('log 1'), 0);
      assertCloseTo(await Parser.evaluate('ln 2'), 0.6931471805599453, delta);
      assertCloseTo(await Parser.evaluate('log 2'), 0.6931471805599453, delta);
      assert.strictEqual(await Parser.evaluate('ln E'), 1);
      assert.strictEqual(await Parser.evaluate('log E'), 1);
      assertCloseTo(await Parser.evaluate('ln PI'), 1.1447298858494002, delta);
      assertCloseTo(await Parser.evaluate('log PI'), 1.1447298858494002, delta);
      assertCloseTo(await Parser.evaluate('ln 10'), 2.302585092994046, delta);
      assertCloseTo(await Parser.evaluate('log 10'), 2.302585092994046, delta);
      assertCloseTo(await Parser.evaluate('ln 100'), 4.605170185988092, delta);
      assert.ok(isNaN(await Parser.evaluate('ln -1')));
      assert.ok(isNaN(await Parser.evaluate('log -1')));
    });
  });

  describe('log10 operator', async function () {
    it('returns the base-10 logarithm of its argument', async function () {
      const delta = 1e-15;
      assert.strictEqual(await Parser.evaluate('log10 0'), -Infinity);
      assert.strictEqual(await Parser.evaluate('lg 0'), -Infinity);
      assertCloseTo(await Parser.evaluate('log10 0.5'), -0.3010299956639812, delta);
      assertCloseTo(await Parser.evaluate('lg 0.5'), -0.3010299956639812, delta);
      assert.strictEqual(await Parser.evaluate('log10 1'), 0);
      assert.strictEqual(await Parser.evaluate('lg 1'), 0);
      assertCloseTo(await Parser.evaluate('log10 2'), 0.3010299956639812, delta);
      assertCloseTo(await Parser.evaluate('lg 2'), 0.3010299956639812, delta);
      assertCloseTo(await Parser.evaluate('log10 E'), 0.4342944819032518, delta);
      assertCloseTo(await Parser.evaluate('lg E'), 0.4342944819032518, delta);
      assertCloseTo(await Parser.evaluate('log10 PI'), 0.49714987269413385, delta);
      assertCloseTo(await Parser.evaluate('lg PI'), 0.49714987269413385, delta);
      assert.strictEqual(await Parser.evaluate('log10 10'), 1);
      assert.strictEqual(await Parser.evaluate('lg 10'), 1);
      assert.strictEqual(await Parser.evaluate('log10 100'), 2);
      assert.strictEqual(await Parser.evaluate('lg 100'), 2);
      assert.strictEqual(await Parser.evaluate('log10 1000'), 3);
      assert.strictEqual(await Parser.evaluate('lg 1000'), 3);
      assert.strictEqual(await Parser.evaluate('log10 10000000000'), 10);
      assert.strictEqual(await Parser.evaluate('lg 10000000000'), 10);
      assert.ok(isNaN(await Parser.evaluate('log10 -1')));
      assert.ok(isNaN(await Parser.evaluate('lg -1')));
    });
  });

  describe('abs(x)', async function () {
    it('returns the correct value', async function () {
      assert.strictEqual(await parser.evaluate('abs 0'), 0);
      assert.strictEqual(await parser.evaluate('abs 0.5'), 0.5);
      assert.strictEqual(await parser.evaluate('abs -0.5'), 0.5);
      assert.strictEqual(await parser.evaluate('abs 1'), 1);
      assert.strictEqual(await parser.evaluate('abs -1'), 1);
      assert.strictEqual(await parser.evaluate('abs 2'), 2);
      assert.strictEqual(await parser.evaluate('abs -2'), 2);
      assert.strictEqual(await parser.evaluate('abs(-1/0)'), Infinity);
    });
  });

  describe('ceil(x)', async function () {
    it('rounds up to the nearest integer', async function () {
      assert.strictEqual(await parser.evaluate('ceil 0'), 0);
      assert.strictEqual(await parser.evaluate('ceil 0.5'), 1);
      assert.strictEqual(await parser.evaluate('ceil -0.5'), 0);
      assert.strictEqual(await parser.evaluate('ceil 1'), 1);
      assert.strictEqual(await parser.evaluate('ceil -1'), -1);
      assert.strictEqual(await parser.evaluate('ceil 1.000001'), 2);
      assert.strictEqual(await parser.evaluate('ceil -1.000001'), -1);
      assert.strictEqual(await parser.evaluate('ceil 2.999'), 3);
      assert.strictEqual(await parser.evaluate('ceil -2.999'), -2);
      assert.strictEqual(await parser.evaluate('ceil 123.5'), 124);
      assert.strictEqual(await parser.evaluate('ceil -123.5'), -123);
      assert.strictEqual(await parser.evaluate('ceil(1/0)'), Infinity);
      assert.strictEqual(await parser.evaluate('ceil(-1/0)'), -Infinity);
    });
  });

  describe('floor(x)', async function () {
    it('rounds down to the nearest integer', async function () {
      assert.strictEqual(await parser.evaluate('floor 0'), 0);
      assert.strictEqual(await parser.evaluate('floor 0.5'), 0);
      assert.strictEqual(await parser.evaluate('floor -0.5'), -1);
      assert.strictEqual(await parser.evaluate('floor 1'), 1);
      assert.strictEqual(await parser.evaluate('floor -1'), -1);
      assert.strictEqual(await parser.evaluate('floor 1.000001'), 1);
      assert.strictEqual(await parser.evaluate('floor -1.000001'), -2);
      assert.strictEqual(await parser.evaluate('floor 2.999'), 2);
      assert.strictEqual(await parser.evaluate('floor -2.999'), -3);
      assert.strictEqual(await parser.evaluate('floor 123.5'), 123);
      assert.strictEqual(await parser.evaluate('floor -123.5'), -124);
      assert.strictEqual(await parser.evaluate('floor(1/0)'), Infinity);
      assert.strictEqual(await parser.evaluate('floor(-1/0)'), -Infinity);
    });
  });

  describe('round(x)', async function () {
    it('rounds to the nearest integer', async function () {
      assert.strictEqual(await parser.evaluate('round 0'), 0);
      assert.strictEqual(await parser.evaluate('round 0.4999'), 0);
      assert.strictEqual(await parser.evaluate('round -0.4999'), 0);
      assert.strictEqual(await parser.evaluate('round 0.5'), 1);
      assert.strictEqual(await parser.evaluate('round -0.5'), 0);
      assert.strictEqual(await parser.evaluate('round 0.5001'), 1);
      assert.strictEqual(await parser.evaluate('round -0.5001'), -1);
      assert.strictEqual(await parser.evaluate('round 1'), 1);
      assert.strictEqual(await parser.evaluate('round -1'), -1);
      assert.strictEqual(await parser.evaluate('round 1.000001'), 1);
      assert.strictEqual(await parser.evaluate('round -1.000001'), -1);
      assert.strictEqual(await parser.evaluate('round 1.5'), 2);
      assert.strictEqual(await parser.evaluate('round -1.5'), -1);
      assert.strictEqual(await parser.evaluate('round 2.999'), 3);
      assert.strictEqual(await parser.evaluate('round -2.999'), -3);
      assert.strictEqual(await parser.evaluate('round 2.5'), 3);
      assert.strictEqual(await parser.evaluate('round -2.5'), -2);
      assert.strictEqual(await parser.evaluate('round 123.5'), 124);
      assert.strictEqual(await parser.evaluate('round -123.5'), -123);
      assert.strictEqual(await parser.evaluate('round(1/0)'), Infinity);
      assert.strictEqual(await parser.evaluate('round(-1/0)'), -Infinity);
    });
  });

  describe('trunc(x)', async function () {
    it('rounds toward zero', async function () {
      assert.strictEqual(await parser.evaluate('trunc 0'), 0);
      assert.strictEqual(await parser.evaluate('trunc 0.4999'), 0);
      assert.strictEqual(await parser.evaluate('trunc -0.4999'), 0);
      assert.strictEqual(await parser.evaluate('trunc 0.5'), 0);
      assert.strictEqual(await parser.evaluate('trunc -0.5'), 0);
      assert.strictEqual(await parser.evaluate('trunc 0.5001'), 0);
      assert.strictEqual(await parser.evaluate('trunc -0.5001'), 0);
      assert.strictEqual(await parser.evaluate('trunc 1'), 1);
      assert.strictEqual(await parser.evaluate('trunc -1'), -1);
      assert.strictEqual(await parser.evaluate('trunc 1.000001'), 1);
      assert.strictEqual(await parser.evaluate('trunc -1.000001'), -1);
      assert.strictEqual(await parser.evaluate('trunc 1.5'), 1);
      assert.strictEqual(await parser.evaluate('trunc -1.5'), -1);
      assert.strictEqual(await parser.evaluate('trunc 2.999'), 2);
      assert.strictEqual(await parser.evaluate('trunc -2.999'), -2);
      assert.strictEqual(await parser.evaluate('trunc 2.5'), 2);
      assert.strictEqual(await parser.evaluate('trunc -2.5'), -2);
      assert.strictEqual(await parser.evaluate('trunc 123.5'), 123);
      assert.strictEqual(await parser.evaluate('trunc -123.5'), -123);
      assert.strictEqual(await parser.evaluate('trunc(1/0)'), Infinity);
      assert.strictEqual(await parser.evaluate('trunc(-1/0)'), -Infinity);
    });
  });

  describe('exp(x)', async function () {
    it('rounds to the nearest integer', async function () {
      const delta = 1e-15;
      assert.strictEqual(await parser.evaluate('exp 0'), 1);
      assertCloseTo(await parser.evaluate('exp 0.5'), 1.6487212707001282, delta);
      assertCloseTo(await parser.evaluate('exp -0.5'), 0.6065306597126334, delta);
      assertCloseTo(await parser.evaluate('exp 1'), 2.718281828459045, delta);
      assertCloseTo(await parser.evaluate('exp -1'), 0.36787944117144233, delta);
      assertCloseTo(await parser.evaluate('exp 1.5'), 4.4816890703380645, delta);
      assertCloseTo(await parser.evaluate('exp -1.5'), 0.22313016014842982, delta);
      assertCloseTo(await parser.evaluate('exp 2'), 7.3890560989306495, delta);
      assertCloseTo(await parser.evaluate('exp -2'), 0.1353352832366127, delta);
      assertCloseTo(await parser.evaluate('exp 2.5'), 12.182493960703471, delta * 10);
      assertCloseTo(await parser.evaluate('exp -2.5'), 0.0820849986238988, delta);
      assertCloseTo(await parser.evaluate('exp 3'), 20.085536923187668, delta);
      assertCloseTo(await parser.evaluate('exp 4'), 54.59815003314423, delta * 10);
      assertCloseTo(await parser.evaluate('exp 10'), 22026.46579480671, delta * 10000);
      assertCloseTo(await parser.evaluate('exp -10'), 0.00004539992976248486, delta);
      assert.strictEqual(await parser.evaluate('exp(1/0)'), Infinity);
      assert.strictEqual(await parser.evaluate('exp(-1/0)'), 0);
    });
  });

  describe('-x', async function () {
    it('has the correct precedence', async function () {
      assert.strictEqual(parser.parse('-2^3').toString(), '(-(2 ^ 3))');
      assert.strictEqual(parser.parse('-(2)^3').toString(), '(-(2 ^ 3))');
      assert.strictEqual(parser.parse('-2 * 3').toString(), '((-2) * 3)');
      assert.strictEqual(parser.parse('-2 + 3').toString(), '((-2) + 3)');
      assert.strictEqual(parser.parse('- - 1').toString(), '(-(-1))');
    });

    it('negates its argument', async function () {
      assert.strictEqual(await parser.evaluate('-0'), 0);
      assert.strictEqual(await parser.evaluate('-0.5'), -0.5);
      assert.strictEqual(await parser.evaluate('-1'), -1);
      assert.strictEqual(await parser.evaluate('-123'), -123);
      assert.strictEqual(await parser.evaluate('-(-1)'), 1);
    });

    it('converts its argument to a number', async function () {
      assert.strictEqual(await parser.evaluate('-"123"'), -123);
    });
  });

  describe('+x', async function () {
    it('has the correct precedence', async function () {
      assert.strictEqual(parser.parse('+2^3').toString(), '(+(2 ^ 3))');
      assert.strictEqual(parser.parse('+(2)^3').toString(), '(+(2 ^ 3))');
      assert.strictEqual(parser.parse('+2 * 3').toString(), '((+2) * 3)');
      assert.strictEqual(parser.parse('+2 + 3').toString(), '((+2) + 3)');
      assert.strictEqual(parser.parse('+ + 1').toString(), '(+(+1))');
    });

    it('returns its argument', async function () {
      assert.strictEqual(await parser.evaluate('+0'), 0);
      assert.strictEqual(await parser.evaluate('+0.5'), 0.5);
      assert.strictEqual(await parser.evaluate('+1'), 1);
      assert.strictEqual(await parser.evaluate('+123'), 123);
      assert.strictEqual(await parser.evaluate('+(+1)'), 1);
    });

    it('converts its argument to a number', async function () {
      assert.strictEqual(await parser.evaluate('+"123"'), 123);
    });
  });

  describe('x!', async function () {
    it('has the correct precedence', async function () {
      assert.strictEqual(parser.parse('2^3!').toString(), '(2 ^ (3!))');
      assert.strictEqual(parser.parse('-5!').toString(), '(-(5!))');
      assert.strictEqual(parser.parse('4!^3').toString(), '((4!) ^ 3)');
      assert.strictEqual(parser.parse('sqrt(4)!').toString(), '((sqrt 4)!)');
      assert.strictEqual(parser.parse('sqrt 4!').toString(), '(sqrt (4!))');
      assert.strictEqual(parser.parse('x!!').toString(), '((x!)!)');
    });

    it('returns exact answer for integers', async function () {
      assert.strictEqual(await parser.evaluate('(-10)!'), Infinity);
      assert.strictEqual(await parser.evaluate('(-2)!'), Infinity);
      assert.strictEqual(await parser.evaluate('(-1)!'), Infinity);
      assert.strictEqual(await parser.evaluate('0!'), 1);
      assert.strictEqual(await parser.evaluate('1!'), 1);
      assert.strictEqual(await parser.evaluate('2!'), 2);
      assert.strictEqual(await parser.evaluate('3!'), 6);
      assert.strictEqual(await parser.evaluate('4!'), 24);
      assert.strictEqual(await parser.evaluate('5!'), 120);
      assert.strictEqual(await parser.evaluate('6!'), 720);
      assert.strictEqual(await parser.evaluate('7!'), 5040);
      assert.strictEqual(await parser.evaluate('8!'), 40320);
      assert.strictEqual(await parser.evaluate('9!'), 362880);
      assert.strictEqual(await parser.evaluate('10!'), 3628800);
      assert.strictEqual(await parser.evaluate('25!'), 1.5511210043330984e+25);
      assert.strictEqual(await parser.evaluate('50!'), 3.0414093201713376e+64);
      assert.strictEqual(await parser.evaluate('100!'), 9.332621544394418e+157);
      assert.strictEqual(await parser.evaluate('170!'), 7.257415615308004e+306);
      assert.strictEqual(await parser.evaluate('171!'), Infinity);
    });

    it('returns approximation for fractions', async function () {
      const delta = 1e-14;
      assertCloseTo(await parser.evaluate('(-2.5)!'), 2.36327180120735, delta);
      assertCloseTo(await parser.evaluate('(-1.5)!'), -3.54490770181103, delta);
      assertCloseTo(await parser.evaluate('(-0.75)!'), 3.625609908221908, delta);
      assertCloseTo(await parser.evaluate('(-0.5)!'), 1.772453850905516, delta);
      assertCloseTo(await parser.evaluate('(-0.25)!'), 1.225416702465177, delta);
      assertCloseTo(await parser.evaluate('0.25!'), 0.906402477055477, delta);
      assertCloseTo(await parser.evaluate('0.5!'), 0.886226925452758, delta);
      assertCloseTo(await parser.evaluate('0.75!'), 0.9190625268488832, delta);
      assertCloseTo(await parser.evaluate('1.5!'), 1.329340388179137, delta);
      assertCloseTo(await parser.evaluate('84.9!'), 1.8056411593417e128, 1e115);
      assertCloseTo(await parser.evaluate('85.1!'), 4.395670640362208e128, 1e115);
      assertCloseTo(await parser.evaluate('98.6!'), 1.483280675613632e155, 1e142);
      assert.strictEqual(await parser.evaluate('171.35!'), Infinity);
      assert.strictEqual(await parser.evaluate('172.5!'), Infinity);
    });

    it('handles NaN and infinity correctly', async function () {
      assert.ok(isNaN(await parser.evaluate('(0/0)!')));
      assert.strictEqual(await parser.evaluate('(1/0)!'), Infinity);
      assert.ok(isNaN(await parser.evaluate('(-1/0)!')));
    });
  });

  describe('[] operator', async function () {
    it('a[0]', async function () {
      assert.strictEqual(await Parser.evaluate('a[0]', { a: [4, 3, 2, 1] }), 4);
    });

    it('a[0.1]', async function () {
      assert.strictEqual(await Parser.evaluate('a[0.1]', { a: [4, 3, 2, 1] }), 4);
    });

    it('a[3]', async function () {
      assert.strictEqual(await Parser.evaluate('a[3]', { a: [4, 3, 2, 1] }), 1);
    });

    it('a[3 - 2]', async function () {
      assert.strictEqual(await Parser.evaluate('a[3 - 2]', { a: [4, 3, 2, 1] }), 3);
    });

    it('a["foo"]', async function () {
      assert.strictEqual(await Parser.evaluate('a["foo"]', { a: { foo: 'bar' } }), undefined);
    });

    it('a[2]^3', async function () {
      assert.strictEqual(await Parser.evaluate('a[2]^3', { a: [1, 2, 3, 4] }), 27);
    });
  });

  describe('sign(x)', async function () {
    it('returns the sign of x', async function () {
      assert.strictEqual(await parser.evaluate('sign 0'), 0);
      assert.strictEqual(await parser.evaluate('sign 1'), 1);
      assert.strictEqual(await parser.evaluate('sign -1'), -1);
      assert.strictEqual(await parser.evaluate('sign 2'), 1);
      assert.strictEqual(await parser.evaluate('sign -2'), -1);
      assert.strictEqual(await parser.evaluate('sign 0.001'), 1);
      assert.strictEqual(await parser.evaluate('sign -0.001'), -1);

      assert.strictEqual(parser.parse('sign -0.001').simplify().toString(), '(-1)');

      assert.strictEqual(parser.parse('sign x').toJSFunction('x')(0), 0);
      assert.strictEqual(parser.parse('sign x').toJSFunction('x')(2), 1);
      assert.strictEqual(parser.parse('sign x').toJSFunction('x')(-2), -1);
    });
  });

  describe('cbrt(x)', async function () {
    it('returns the cube root of x', async function () {
      const delta = 1e-15;

      assert.ok(isNaN(await parser.evaluate('cbrt(0/0)')));
      assert.strictEqual(await parser.evaluate('cbrt -1'), -1);
      assert.strictEqual(await parser.evaluate('cbrt 0'), 0);
      assert.strictEqual(await parser.evaluate('cbrt(-1/0)'), -1 / 0);
      assert.strictEqual(await parser.evaluate('cbrt 1'), 1);
      assert.strictEqual(await parser.evaluate('cbrt(1/0)'), 1 / 0);
      assertCloseTo(await parser.evaluate('cbrt 2'), 1.2599210498948732, delta);
      assertCloseTo(await parser.evaluate('cbrt -2'), -1.2599210498948732, delta);
      assert.strictEqual(await parser.evaluate('cbrt 8'), 2);
      assert.strictEqual(await parser.evaluate('cbrt 27'), 3);
      assert.strictEqual(await parser.evaluate('cbrt -8'), -2);
      assert.strictEqual(await parser.evaluate('cbrt -27'), -3);

      assert.strictEqual(parser.parse('cbrt 8').simplify().toString(), '2');

      assert.strictEqual(parser.parse('cbrt x').toJSFunction('x')(27), 3);
    });
  });

  describe('expm1(x)', async function () {
    it('returns e^x - 1', async function () {
      const delta = 1e-15;

      assert.ok(isNaN(await parser.evaluate('expm1(0/0)')));
      assertCloseTo(await parser.evaluate('expm1 -1'), -0.6321205588285577, delta);
      assert.strictEqual(await parser.evaluate('expm1 0'), 0);
      assertCloseTo(await parser.evaluate('expm1 1'), 1.718281828459045, delta);
      assertCloseTo(await parser.evaluate('expm1 2'), 6.38905609893065, delta);

      assert.ok(/^1.718281828459\d*$/.test(parser.parse('expm1 1').simplify().toString()));

      assertCloseTo(parser.parse('expm1 x').toJSFunction('x')(1), 1.718281828459045, delta);
      assertCloseTo(parser.parse('expm1 x').toJSFunction('x')(2), 6.38905609893065, delta);
    });
  });

  describe('log1p(x)', async function () {
    it('returns e^x - 1', async function () {
      const delta = 1e-15;

      assert.ok(isNaN(await parser.evaluate('log1p(0/0)')));
      assert.strictEqual(await parser.evaluate('log1p -1'), -1 / 0);
      assert.strictEqual(await parser.evaluate('log1p 0'), 0);
      assertCloseTo(await parser.evaluate('log1p 1'), 0.6931471805599453, delta);
      assert.ok(isNaN(await parser.evaluate('log1p -2')));
      assertCloseTo(await Parser.evaluate('log1p 9'), 2.302585092994046, delta);

      assertCloseTo(parser.parse('log1p x').toJSFunction('x')(1), 0.6931471805599453, delta);
      assertCloseTo(parser.parse('log1p x').toJSFunction('x')(9), 2.302585092994046, delta);
    });
  });

  describe('log2(x)', async function () {
    it('returns the base 2 log of x', async function () {
      const delta = 1e-15;

      assert.ok(isNaN(await parser.evaluate('log2(0/0)')));
      assert.ok(isNaN(await parser.evaluate('log2 -1')));
      assert.strictEqual(await parser.evaluate('log2 0'), -1 / 0);
      assert.strictEqual(await Parser.evaluate('log2 1'), 0);
      assert.strictEqual(await Parser.evaluate('log2 2'), 1);
      assert.strictEqual(await Parser.evaluate('log2 3'), 1.584962500721156);
      assert.strictEqual(await Parser.evaluate('log2 4'), 2);
      assert.strictEqual(await Parser.evaluate('log2 8'), 3);
      assert.strictEqual(await Parser.evaluate('log2 1024'), 10);

      assert.strictEqual(parser.parse('log2 x').toJSFunction('x')(4), 2);
      assertCloseTo(parser.parse('log2 x').toJSFunction('x')(3), 1.584962500721156, delta);
    });
  });
});
