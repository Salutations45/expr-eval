/* global describe, it */

'use strict';

import assert from 'assert';
import { Parser } from '../dist/index';
import spy from './lib/spy';

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
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

			assert.strictEqual(await parser.parse('sign x').toJSFunction('x')(0), 0);
			assert.strictEqual(await parser.parse('sign x').toJSFunction('x')(2), 1);
			assert.strictEqual(await parser.parse('sign x').toJSFunction('x')(-2), -1);
		});
	});
});
