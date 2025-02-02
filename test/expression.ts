/* global describe, it */

'use strict';

import { strictEqual, deepStrictEqual, rejects, ok } from 'assert';
import { Parser } from '../dist/index';

describe('Expression', async function () {
	describe('evaluate()', async function () {
		it('2 ^ x', async function () {
			strictEqual(await Parser.evaluate('2 ^ x', { x: 3 }), 8);
		});

		it('2 * x + 1', async function () {
			strictEqual(await Parser.evaluate('2 * x + 1', { x: 3 }), 7);
		});

		it('2 + 3 * x', async function () {
			strictEqual(await Parser.evaluate('2 + 3 * x', { x: 4 }), 14);
		});

		it('(2 + 3) * x', async function () {
			strictEqual(await Parser.evaluate('(2 + 3) * x', { x: 4 }), 20);
		});

		it('2-3^x', async function () {
			strictEqual(await Parser.evaluate('2-3^x', { x: 4 }), -79);
		});

		it('-2-3^x', async function () {
			strictEqual(await Parser.evaluate('-2-3^x', { x: 4 }), -83);
		});

		it('-3^x', async function () {
			strictEqual(await Parser.evaluate('-3^x', { x: 4 }), -81);
		});

		it('(-3)^x', async function () {
			strictEqual(await Parser.evaluate('(-3)^x', { x: 4 }), 81);
		});

		it('2 ^ x.y', async function () {
			strictEqual(await Parser.evaluate('2^x.y', { x: { y: 3 } }), 8);
		});

		it('2 + 3 * foo.bar.baz', async function () {
			strictEqual(await Parser.evaluate('2 + 3 * foo.bar.baz', { foo: { bar: { baz: 4 } } }), 14);
		});

		it('10/-1', async function () {
			strictEqual(await Parser.evaluate('10/-1'), -10);
		});

		it('10*-1', async function () {
			strictEqual(await Parser.evaluate('10*-1'), -10);
		});

		it('10*-x', async function () {
			strictEqual(await Parser.evaluate('10*-x', { x: 1 }), -10);
		});

		it('10+-1', async function () {
			strictEqual(await Parser.evaluate('10+-1'), 9);
		});

		it('10/+1', async function () {
			strictEqual(await Parser.evaluate('10/+1'), 10);
		});

		it('10*+1', async function () {
			strictEqual(await Parser.evaluate('10*+1'), 10);
		});

		it('10*+x', async function () {
			strictEqual(await Parser.evaluate('10*+x', { x: 1 }), 10);
		});

		it('10+ +1', async function () {
			strictEqual(await Parser.evaluate('10+ +1'), 11);
		});

		it('10/-2', async function () {
			strictEqual(await Parser.evaluate('10/-2'), -5);
		});

		it('2^-4', async function () {
			strictEqual(await Parser.evaluate('2^-4'), 1 / 16);
		});

		it('2^(-4)', async function () {
			strictEqual(await Parser.evaluate('2^(-4)'), 1 / 16);
		});

		it('should fail with undefined variables', async function () {
			rejects(function () { return Parser.evaluate('x + 1'); }, Error);
		});

		it('x = 3 * 2 + 1', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('x = 3 * 2 + 1'), 7);
		});

		it('x = x * 2 + 1', async function () {
			const parser = new Parser();
			const obj = {};
			await parser.evaluate('x = 3 * 2 + 1', obj);
			strictEqual(await parser.evaluate('x = x * 2 + 1', obj), 15);
		});

		it('y = x = x * 2 + 1', async function () {
			const parser = new Parser();
			const obj: any = {};
			await parser.evaluate('x = 3 * 2 + 1', obj);
			strictEqual(await parser.evaluate('y = x = x * 2 + 1', obj), 15);
			strictEqual(15, obj.x);
			strictEqual(15, obj.y);
		});

		it('y = y = 2*z', async function () {
			const parser = new Parser();
			const obj: any = { y: 5, z: 3 };
			strictEqual(await parser.evaluate('x = y = 2*z', obj), 6);
			strictEqual(6, obj.x);
			strictEqual(6, obj.y);
			strictEqual(3, obj.z);
		});

		it('f(x) = x * x', async function () {
			const parser = new Parser();
			const obj: any = { f: null };
			strictEqual(await parser.evaluate('f(x) = x * x', obj) instanceof Function, true);
			strictEqual(obj.f instanceof Function, true);
			strictEqual(await obj.f(3), 9);
		});

		it('(f(x) = x * x)(3)', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('(f(x) = x * x)(3)'), 9);
		});

		it('y = 5; f(x) = x * y', async function () {
			const parser = new Parser();
			const obj: any = { f: null };
			strictEqual(await parser.evaluate('y = 5; f(x) = x * y', obj) instanceof Function, true);
			strictEqual(obj.f instanceof Function, true);
			strictEqual(await obj.f(3), 15);
		});

		it('y = 5; (f(x) = x * y)(3)', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('y = 5; (f(x) = x * y)(3)'), 15);
		});

		it('(f(x) = x > 1 ? x*f(x-1) : 1)(5)', async function () {
			const parser = new Parser();

			const a = await parser.evaluate('(f(x) = x > 1 ? x*f(x-1) : 1)');
			a(5);
			strictEqual(await parser.evaluate('(f(x) = x > 1 ? x*f(x-1) : 1)(5)'), 120);
			strictEqual(await parser.evaluate('(f(x) = x > 1 ? x*f(x-1) : 1); f(6)'), 720);
		});

		it('f(x) = x > 1 ? x*f(x-1) : 1; f(6); f(5)', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('f(x) = x > 1 ? x*f(x-1) : 1; f(6)'), 720);
			strictEqual(await parser.evaluate('f(x) = x > 1 ? x*f(x-1) : 1; f(6); f(5)'), 120);
		});

		it('f(x) = x > 1 ? x*f(x-1) : 1', async function () {
			const parser = new Parser();
			const obj: any = { f: null };
			strictEqual(await parser.evaluate('f(x) = x > 1 ? x*f(x-1) : 1', obj) instanceof Function, true);
			strictEqual(obj.f instanceof Function, true);
			strictEqual(await obj.f(6), 720);
			strictEqual(await obj.f(5), 120);
			strictEqual(await obj.f(4), 24);
			strictEqual(await obj.f(3), 6);
		});

		it('3 ; 2 ; 1', async function () {
			strictEqual(await Parser.evaluate('3 ; 2 ; 1'), 1);
		});

		it('3 ; 2 ; 1 ;', async function () {
			strictEqual(await Parser.evaluate('3 ; 2 ; 1 ;'), 1);
		});

		it('x = 3 ; y = 4 ; z = x * y', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('x = 3 ; y = 4 ; z = x * y'), 12);
		});

		it('x=3;y=4;z=x*y;', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('x=3;y=4;z=x*y;'), 12);
		});

		it('1 + (( 3 ; 4 ) + 5)', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('1 + (( 3 ; 4 ) + 5)'), 10);
		});

		it('2+(x=3;y=4;z=x*y)+5', async function () {
			const parser = new Parser();
			strictEqual(await parser.evaluate('2+(x=3;y=4;z=x*y)+5'), 19);
		});

		it('[1, 2, 3]', async function () {
			deepStrictEqual(await Parser.evaluate('[1, 2, 3]'), [1, 2, 3]);
		});

		it('[1, 2, 3, [4, [5, 6]]]', async function () {
			deepStrictEqual(await Parser.evaluate('[1, 2, 3, [4, [5, 6]]]'), [1, 2, 3, [4, [5, 6]]]);
		});

		it('["a", ["b", ["c"]], true, 1 + 2 + 3]', async function () {
			deepStrictEqual(await Parser.evaluate('["a", ["b", ["c"]], true, 1 + 2 + 3]'), ['a', ['b', ['c']], true, 6]);
		});

		it('should fail trying to call a non-function', async function () {
			rejects(function () { return Parser.evaluate('f()', { f: 2 }); }, Error);
		});

		it('$x * $y_+$a1*$z - $b2', async function () {
			strictEqual(await Parser.evaluate('$x * $y_+$a1*$z - $b2', { $a1: 3, $b2: 5, $x: 7, $y_: 9, $z: 11 }), 91);
		});

		it('max(conf.limits.lower, conf.limits.upper)', async function () {
			strictEqual(await Parser.evaluate('max(conf.limits.lower, conf.limits.upper)', { conf: { limits: { lower: 4, upper: 9 } } }), 9);
		});

		it('fn.max(conf.limits.lower, conf.limits.upper)', async function () {
			strictEqual(await Parser.evaluate('fn.max(conf.limits.lower, conf.limits.upper)', { fn: { max: Math.max }, conf: { limits: { lower: 4, upper: 9 } } }), 9);
		});

		it('1 ? 1 : 0', async function () {
			strictEqual(await Parser.evaluate('1 ? 1 : 0'), 1);
		});

		it('0 ? 1 : 0', async function () {
			strictEqual(await Parser.evaluate('0 ? 1 : 0'), 0);
		});

		it('1==1 or 2==1 ? 39 : 0', async function () {
			strictEqual(await Parser.evaluate('1==1 or 2==1 ? 39 : 0'), 39);
		});

		it('1==1 or 1==2 ? -4 + 8 : 0', async function () {
			strictEqual(await Parser.evaluate('1==1 or 1==2 ? -4 + 8 : 0'), 4);
		});

		it('3 and 6 ? 45 > 5 * 11 ? 3 * 3 : 2.4 : 0', async function () {
			strictEqual(await Parser.evaluate('3 and 6 ? 45 > 5 * 11 ? 3 * 3 : 2.4 : 0'), 2.4);
		});

		it('should call custom functions', async function () {
			const parser = new Parser();
			parser.consts.customFunction = (a: number, b: number) => a+b;
			strictEqual(await parser.evaluate('customFunction(3,4)'), 7);
		});

		it('should call custom async functions', async function () {
			const parser = new Parser();
			parser.consts.customFunction = async (a: number, b: number) => a+b;
			strictEqual(await parser.evaluate('customFunction(3,4)'), 7);
		});
	});

	describe('substitute()', async function () {
		const parser = new Parser();

		const expr = parser.parse('2 * x + 1');
		const expr2 = expr.substitute('x', '4 * x');
		it('((2*(4*x))+1)', async function () {
			strictEqual(await expr2.evaluate({ x: 3 }), 25);
		});

		const expr3 = expr.substitute('x', '4 * x.y.z');
		it('((2*(4*x.y.z))+1)', async function () {
			strictEqual(await expr3.evaluate({ x: { y: { z: 3 } } }), 25);
		});

		const expr4 = parser.parse('-x').substitute('x', '-4 + y');
		it('-(-4 + y)', async function () {
			strictEqual(expr4.toString(), '(-((-4) + y))');
			strictEqual(await expr4.evaluate({ y: 2 }), 2);
		});

		const expr5 = parser.parse('x + y').substitute('y', 'x ? 1 : 2');
		it('x + (x ? 1 : 2)', async function () {
			strictEqual(expr5.toString(), '(x + (x ? (1) : (2)))');
			strictEqual(await expr5.evaluate({ x: 3 }), 4);
			strictEqual(await expr5.evaluate({ x: 0 }), 2);
		});

		const expr6 = parser.parse('x ? y : z').substitute('y', 'x');
		it('x ? x : z', async function () {
			strictEqual(expr6.toString(), '(x ? (x) : (z))');
			strictEqual(await expr6.evaluate({ x: 1, z: 2 }), 1);
			strictEqual(await expr6.evaluate({ x: 0, z: 2 }), 2);
		});

		const expr7 = expr.substitute('x', parser.parse('4 * x'));
		it('should substitute expressions', async function () {
			strictEqual(expr7.toString(), '((2 * (4 * x)) + 1)');
			strictEqual(await expr7.evaluate({ x: 3 }), 25);
		});

		const expr8 = parser.parse('x = x + 1').substitute('x', '7');
		it('should not replace assigned variables', async function () {
			strictEqual(expr8.toString(), '(x = ((7 + 1)))');
			const vars = { x: 42 };
			strictEqual(await expr8.evaluate(vars), 8);
			strictEqual(vars.x, 8);
		});
	});

	describe('simplify()', async function () {
		it('(x/2) ? y : z', async function () {
			strictEqual(Parser.parse('(x/2) ? y : z').simplify({ x: 4 }).toString(), '(2 ? (y) : (z))');
		});

		it('x ? (y + 1) : z', async function () {
			strictEqual(Parser.parse('x ? (y + 1) : z').simplify({ y: 2 }).toString(), '(x ? (3) : (z))');
		});

		it('x ? y : (z * 4)', async function () {
			strictEqual(Parser.parse('x ? y : (z * 4)').simplify({ z: 3 }).toString(), '(x ? (y) : (12))');
		});

		it('x = 2*x', async function () {
			strictEqual(new Parser().parse('x = 2*x').simplify({ x: 3 }).toString(), '(x = (6))');
		});

		it('(f(x) = x * y)(3)', async function () {
			strictEqual(new Parser().parse('(f(x) = x * y)(3)').simplify({ y: 5 }).toString(), '(f(x) = ((x * 5)))(3)');
		});

		it('a[2] + b[3]', async function () {
			strictEqual(Parser.parse('a[2] + b[3]').simplify({ a: [0, 0, 5, 0], b: [0, 0, 0, 4, 0] }).toString(), '9');
			strictEqual(Parser.parse('a[2] + b[3]').simplify({ a: [0, 0, 5, 0] }).toString(), '(5 + b[3])');
			strictEqual(Parser.parse('a[2] + b[5 - 2]').simplify({ b: [0, 0, 0, 4, 0] }).toString(), '(a[2] + 4)');
			strictEqual(Parser.parse('a[two] + b[3]').simplify({ a: [0, 0, 5, 0], b: [0, 0, 0, 4, 0] }).toString(), '([0, 0, 5, 0][two] + 4)');
			strictEqual(Parser.parse('a[two] + b[3]').simplify({ a: [0, 'New\nLine', 5, 0], b: [0, 0, 0, 4, 0] }).toString(), '([0, "New\\nLine", 5, 0][two] + 4)');
		});
	});

	describe('variables()', async function () {
		it('a or b ? c + d : e * f', async function () {
			deepStrictEqual(Parser.parse('a or b ? c + d : e * f').variables(), ['a', 'b', 'c', 'd', 'e', 'f']);
		});

		it('$x * $y_+$a1*$z - $b2', async function () {
			deepStrictEqual(Parser.parse('$x * $y_+$a1*$z - $b2').variables(), ['$x', '$y_', '$a1', '$z', '$b2']);
		});

		it('user.age + 2', async function () {
			deepStrictEqual(Parser.parse('user.age + 2').variables(), ['user']);
		});

		it('user.age + 2 with { withMembers: false } option', async function () {
			deepStrictEqual(Parser.parse('user.age + 2').variables({ withMembers: false }), ['user']);
		});

		it('user.age + 2 with { withMembers: true } option', async function () {
			const expr = Parser.parse('user.age + 2');
			deepStrictEqual(expr.variables({ withMembers: true }), ['user.age']);
		});

		it('x.y ? x.y.z : default.z with { withMembers: true } option', async function () {
			const expr = Parser.parse('x.y ? x.y.z : default.z');
			deepStrictEqual(expr.variables({ withMembers: true }), ['x.y.z', 'default.z', 'x.y']);
		});

		it('x + x.y + x.z with { withMembers: true } option', async function () {
			const expr = Parser.parse('x + x.y + x.z');
			deepStrictEqual(expr.variables({ withMembers: true }), ['x', 'x.y', 'x.z']);
		});

		it('x.y < 3 ? 2 * x.y.z : default.z + 1 with { withMembers: true } option', async function () {
			const expr = Parser.parse('x.y < 3 ? 2 * x.y.z : default.z + 1');
			deepStrictEqual(expr.variables({ withMembers: true }), ['x.y', 'x.y.z', 'default.z']);
		});

		it('user.age with { withMembers: true } option', async function () {
			const expr = Parser.parse('user.age');
			deepStrictEqual(expr.variables({ withMembers: true }), ['user.age']);
		});

		it('x with { withMembers: true } option', async function () {
			const expr = Parser.parse('x');
			deepStrictEqual(expr.variables({ withMembers: true }), ['x']);
		});

		it('x with { withMembers: false } option', async function () {
			const expr = Parser.parse('x');
			deepStrictEqual(expr.variables({ withMembers: false }), ['x']);
		});

		it('max(conf.limits.lower, conf.limits.upper) with { withMembers: false } option', async function () {
			const expr = Parser.parse('max(conf.limits.lower, conf.limits.upper)');
			deepStrictEqual(expr.variables({ withMembers: false }), ['conf']);
		});

		it('max(conf.limits.lower, conf.limits.upper) with { withMembers: true } option', async function () {
			const expr = Parser.parse('max(conf.limits.lower, conf.limits.upper)');
			deepStrictEqual(expr.variables({ withMembers: true }), ['conf.limits.lower', 'conf.limits.upper']);
		});

		it('fn.max(conf.limits.lower, conf.limits.upper) with { withMembers: false } option', async function () {
			const expr = Parser.parse('fn.max(conf.limits.lower, conf.limits.upper)');
			deepStrictEqual(expr.variables({ withMembers: false }), ['fn', 'conf']);
		});

		it('fn.max(conf.limits.lower, conf.limits.upper) with { withMembers: true } option', async function () {
			const expr = Parser.parse('fn.max(conf.limits.lower, conf.limits.upper)');
			deepStrictEqual(expr.variables({ withMembers: true }), ['fn.max', 'conf.limits.lower', 'conf.limits.upper']);
		});

		it('x = y + z', async function () {
			deepStrictEqual(new Parser().parse('x = y + z').variables(), ['x', 'y', 'z']);
		});

		it('f(x, y, z) = x + y + z', async function () {
			const parser = new Parser();
			deepStrictEqual(parser.parse('f(x, y, z) = x + y + z').variables(), ['f', 'x', 'y', 'z']);
		});
	});

	describe('symbols()', async function () {
		const expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
		it('["x", "y", "z.y.x"]', async function () {
			deepStrictEqual(expr.symbols(), ['x', 'y', 'atan2', 'z']);
		});

		it('["x", "z.y.x"]', async function () {
			deepStrictEqual(expr.simplify({ y: 4 }).symbols(), ['x', 'atan2', 'z']);
		});

		it('["x"]', async function () {
			deepStrictEqual(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols(), ['x', 'atan2']);
		});

		it('a or b ? c + d : e * f', async function () {
			deepStrictEqual(Parser.parse('a or b ? c + d : e * f').symbols(), ['a', 'b', 'c', 'd', 'e', 'f']);
		});

		it('user.age + 2', async function () {
			deepStrictEqual(Parser.parse('user.age + 2').symbols(), ['user']);
		});

		it('user.age + 2 with { withMembers: false } option', async function () {
			deepStrictEqual(Parser.parse('user.age + 2').symbols({ withMembers: false }), ['user']);
		});

		it('user.age + 2 with { withMembers: true } option', async function () {
			const expr = Parser.parse('user.age + 2');
			deepStrictEqual(expr.symbols({ withMembers: true }), ['user.age']);
		});

		it('x.y ? x.y.z : default.z with { withMembers: true } option', async function () {
			const expr = Parser.parse('x.y ? x.y.z : default.z');
			deepStrictEqual(expr.symbols({ withMembers: true }), ['x.y.z', 'default.z', 'x.y']);
		});

		it('x.y < 3 ? 2 * x.y.z : default.z + 1 with { withMembers: true } option', async function () {
			const expr = Parser.parse('x.y < 3 ? 2 * x.y.z : default.z + 1');
			deepStrictEqual(expr.symbols({ withMembers: true }), ['x.y', 'x.y.z', 'default.z']);
		});

		it('user.age with { withMembers: true } option', async function () {
			const expr = Parser.parse('user.age');
			deepStrictEqual(expr.symbols({ withMembers: true }), ['user.age']);
		});

		it('x with { withMembers: true } option', async function () {
			const expr = Parser.parse('x');
			deepStrictEqual(expr.symbols({ withMembers: true }), ['x']);
		});

		it('x with { withMembers: false } option', async function () {
			const expr = Parser.parse('x');
			deepStrictEqual(expr.symbols({ withMembers: false }), ['x']);
		});

		it('x = y + z', async function () {
			deepStrictEqual(new Parser().parse('x = y + z').symbols(), ['x', 'y', 'z']);
		});
	});

	describe('toString()', async function () {
		const parser = new Parser();

		it('2 ^ x', async function () {
			strictEqual(parser.parse('2 ^ x').toString(), '(2 ^ x)');
		});

		it('2 * x + 1', async function () {
			strictEqual(parser.parse('2 * x + 1').toString(), '((2 * x) + 1)');
		});

		it('2 + 3 * x', async function () {
			strictEqual(parser.parse('2 + 3 * x').toString(), '(2 + (3 * x))');
		});

		it('(2 + 3) * x', async function () {
			strictEqual(parser.parse('(2 + 3) * x').toString(), '((2 + 3) * x)');
		});

		it('2-3^x', async function () {
			strictEqual(parser.parse('2-3^x').toString(), '(2 - (3 ^ x))');
		});

		it('-2-3^x', async function () {
			strictEqual(parser.parse('-2-3^x').toString(), '((-2) - (3 ^ x))');
		});

		it('-3^x', async function () {
			strictEqual(parser.parse('-3^x').toString(), '(-(3 ^ x))');
		});

		it('(-3)^x', async function () {
			strictEqual(parser.parse('(-3)^x').toString(), '((-3) ^ x)');
		});

		it('2 ^ x.y', async function () {
			strictEqual(parser.parse('2^x.y').toString(), '(2 ^ x.y)');
		});

		it('2 + 3 * foo.bar.baz', async function () {
			strictEqual(parser.parse('2 + 3 * foo.bar.baz').toString(), '(2 + (3 * foo.bar.baz))');
		});

		it('10*-1', async function () {
			strictEqual(parser.parse('10*-1').toString(), '(10 * (-1))');
		});

		it('10+-1', async function () {
			strictEqual(parser.parse('10+-1').toString(), '(10 + (-1))');
		});

		it('10+ +1', async function () {
			strictEqual(parser.parse('10+ +1').toString(), '(10 + (+1))');
		});

		it('a ? b : c', async function () {
			strictEqual(parser.parse('a ? b : c').toString(), '(a ? (b) : (c))');
		});

		it('a ? b : c ? d : e', async function () {
			strictEqual(parser.parse('a ? b : c ? d : e').toString(), '(a ? (b) : ((c ? (d) : (e))))');
		});

		it('a ? b ? c : d : e', async function () {
			strictEqual(parser.parse('a ? b ? c : d : e').toString(), '(a ? ((b ? (c) : (d))) : (e))');
		});

		it('a == 2 ? b + 1 : c * 2', async function () {
			strictEqual(parser.parse('a == 2 ? b + 1 : c * 2').toString(), '((a == 2) ? ((b + 1)) : ((c * 2)))');
		});

		it('floor(random() * 10)', async function () {
			strictEqual(parser.parse('floor(random() * 10)').toString(), '(floor (random() * 10))');
		});

		it('not 0 or 1 and 2', async function () {
			strictEqual(parser.parse('not 0 or 1 and 2').toString(), '((not 0) or ((1 and (2))))');
		});

		it('a < b or c > d and e <= f or g >= h and i == j or k != l', async function () {
			strictEqual(parser.parse('a < b or c > d and e <= f or g >= h and i == j or k != l').toString(),
				'((((a < b) or (((c > d) and ((e <= f))))) or (((g >= h) and ((i == j))))) or ((k != l)))');
		});

		it('x = x + 1', async function () {
			strictEqual(parser.parse('x = x + 1').toString(), '(x = ((x + 1)))');
		});

		it('x = y = x + 1', async function () {
			strictEqual(parser.parse('x = y = x + 1').toString(), '(x = ((y = ((x + 1)))))');
		});

		it('3 ; 2 ; 1', async function () {
			strictEqual(parser.parse('3 ; 2 ; 1').toString(), '(3;(2;1))');
		});

		it('3 ; 2 ; 1 ;', async function () {
			strictEqual(parser.parse('3 ; 2 ; 1 ;').toString(), '(3;(2;(1)))');
		});

		it('x = 3 ; y = 4 ; z = x * y', async function () {
			const parser = new Parser();
			strictEqual(parser.parse('x = 3 ; y = 4 ; z = x * y').toString(), '((x = (3));((y = (4));(z = ((x * y)))))');
		});

		it('2+(x=3;y=4;z=x*y)+5', async function () {
			const parser = new Parser();
			strictEqual(parser.parse('2+(x=3;y=4;z=x*y)+5').toString(), '((2 + ((x = (3));((y = (4));(z = ((x * y)))))) + 5)');
		});

		it('[1, 2, 3]', async function () {
			strictEqual(Parser.parse('[1, 2, 3]').toString(), '[1, 2, 3]');
		});

		it('[1, 2, 3, [4, [5, 6]]]', async function () {
			strictEqual(Parser.parse('[1, 2, 3, [4, [5, 6]]]').toString(), '[1, 2, 3, [4, [5, 6]]]');
		});

		it('["a", ["b", ["c"]], true, 1 + 2 + 3]', async function () {
			strictEqual(Parser.parse('["a", ["b", ["c"]], true, 1 + 2 + 3]').toString(), '["a", ["b", ["c"]], true, ((1 + 2) + 3)]');
		});

		it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', async function () {
			strictEqual(parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toString(), '"A\\bB\\tC\\nD\\fE\\r\'F\\\\G"');
		});

		it('negative numbers are parenthesized', async function () {
			strictEqual(parser.parse('x + y').simplify({ y: -2 }).toString(), '(x + (-2))');
			strictEqual(parser.parse('x + (2 - 3)').simplify().toString(), '(x + (-1))');
		});

		it('a[0]', async function () {
			strictEqual(parser.parse('a[0]').toString(), 'a[0]');
		});

		it('a[2 + 3]', async function () {
			strictEqual(parser.parse('a[2 + 3]').toString(), 'a[(2 + 3)]');
		});

		it('[1, 2+3, a, "5"]', async function () {
			strictEqual(parser.parse('[1, 2+3, a, "5"]').toString(), '[1, (2 + 3), a, "5"]');
		});
	});

	describe('toJSFunction()', async function () {
		const parser = new Parser();

		it('2 ^ x', async function () {
			const expr = parser.parse('2 ^ x');
			const f = expr.toJSFunction('x');
			strictEqual(await f(2), 4);
			strictEqual(await f(3), 8);
			strictEqual(await f(-1), 0.5);
		});

		it('x = x + 1', async function () {
			const expr = parser.parse('x = x + 1');
			const f = expr.toJSFunction('x');
			strictEqual(await f(4), 5);
		});

		it('y = 4 ; z = x < 5 ? x * y : x / y', async function () {
			const expr = parser.parse('y = 4 ; z = x < 5 ? x * y : x / y');
			const f = expr.toJSFunction('x');
			strictEqual(await f(3), 12);
		});

		it('2 * x + 1', async function () {
			strictEqual(await parser.parse('2 * x + 1').toJSFunction('x')(4), 9);
		});

		it('2 + 3 * x', async function () {
			strictEqual(await parser.parse('2 + 3 * x').toJSFunction('x')(5), 17);
		});

		it('2-3^x', async function () {
			strictEqual(await parser.parse('2-3^x').toJSFunction('x')(2), -7);
		});

		it('-2-3^x', async function () {
			strictEqual(await parser.parse('-2-3^x').toJSFunction('x')(2), -11);
		});

		it('-3^x', async function () {
			strictEqual(await parser.parse('-3^x').toJSFunction('x')(4), -81);
		});

		it('(-3)^x', async function () {
			strictEqual(await parser.parse('(-3)^x').toJSFunction('x')(4), 81);
		});

		it('2 ^ x.y', async function () {
			strictEqual(await parser.parse('2^x.y').toJSFunction('x')({ y: 5 }), 32);
		});

		it('2 + 3 * foo.bar.baz', async function () {
			strictEqual(await parser.parse('2 + 3 * foo.bar.baz').toJSFunction('foo')({ bar: { baz: 5 } }), 17);
		});

		it('10*-1', async function () {
			strictEqual(await parser.parse('10*-1').toJSFunction()(), -10);
		});

		it('10+-1', async function () {
			strictEqual(await parser.parse('10+-1').toJSFunction()(), 9);
		});

		it('10+ +1', async function () {
			strictEqual(await parser.parse('10+ +1').toJSFunction()(), 11);
		});

		it('a ? b : c', async function () {
			strictEqual(await parser.parse('a ? b : c').toJSFunction('a,b,c')(1, 2, 3), 2);
			strictEqual(await parser.parse('a ? b : c').toJSFunction('a,b,c')(0, 2, 3), 3);
		});

		it('a ? b : c ? d : e', async function () {
			strictEqual(await parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(1, 2, 3, 4, 5), 2);
			strictEqual(await parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(0, 2, 3, 4, 5), 4);
			strictEqual(await parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(0, 2, 0, 4, 5), 5);
			strictEqual(await parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(1, 2, 0, 4, 5), 2);
		});

		it('a ? b ? c : d : e', async function () {
			strictEqual(await parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(1, 2, 3, 4, 5), 3);
			strictEqual(await parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(0, 2, 3, 4, 5), 5);
			strictEqual(await parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(1, 0, 3, 4, 5), 4);
			strictEqual(await parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(0, 0, 3, 4, 5), 5);
		});

		it('a == 2 ? b + 1 : c * 2', async function () {
			strictEqual(await parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')(2, 4, 8), 5);
			strictEqual(await parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')(1, 4, 8), 16);
			strictEqual(await parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')('2', 4, 8), 16);
		});

		it('floor(random() * 10)', async function () {
			it('should return different numbers', async function () {
				const fn = Parser.parse('floor(random() * 10)').toJSFunction();
				const counts = {};
				for (let i = 0; i < 1000; i++) {
					const x = await fn();
					counts[x] = (counts[x] || 0) + 1;
				}
				for (let i = 0; i < 10; i++) {
					ok(counts[i] >= 85 && counts[i] <= 115);
				}
				deepStrictEqual(Object.keys(counts).sort(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
			});
		});

		it('not x or y and z', async function () {
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 0, 0), true);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 0, 1), true);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 1, 0), true);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 1, 1), true);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 0, 0), false);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 0, 1), false);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 1, 0), false);
			strictEqual(await parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 1, 1), true);
		});

		it('a < b or c > d', async function () {
			strictEqual(await parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(1, 2, 3, 4), true);
			strictEqual(await parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(2, 2, 3, 4), false);
			strictEqual(await parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(2, 2, 5, 4), true);
		});

		it('e <= f or g >= h', async function () {
			strictEqual(await parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(1, 2, 3, 4), true);
			strictEqual(await parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(2, 2, 3, 4), true);
			strictEqual(await parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 5, 4), true);
			strictEqual(await parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 4, 4), true);
			strictEqual(await parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 3, 4), false);
		});

		it('i == j or k != l', async function () {
			strictEqual(await parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(1, 2, 3, 4), true);
			strictEqual(await parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(2, 2, 3, 4), true);
			strictEqual(await parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(1, 2, 4, 4), false);
			strictEqual(await parser.parse('i == j or k != l').toJSFunction('i,j,k,l')('2', 2, 4, 4), false);
			strictEqual(await parser.parse('i == j or k != l').toJSFunction('i,j,k,l')('2', 2, '4', 4), true);
		});

		it('short-circuits and', async function () {
			strictEqual(await parser.parse('a and fail()').toJSFunction('a')(false), false);
		});

		it('short-circuits or', async function () {
			strictEqual(await parser.parse('a or fail()').toJSFunction('a')(true), true);
		});

		it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', async function () {
			strictEqual(await parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toJSFunction()(), 'A\bB\tC\nD\fE\r\'F\\G');
		});

		it('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"', async function () {
			strictEqual(await parser.parse('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"').toJSFunction()(), 'A\bB\tC\nD\fE\r\'F\\G');
		});

		it('"\\u2028 and \\u2029"', async function () {
			strictEqual(await parser.parse('"\\u2028 and \\u2029 \\u2028\\u2029"').toJSFunction()(), '\u2028 and \u2029 \u2028\u2029');
		});

		it('(f(x) = g(y) = x * y)(a)(b)', async function () {
			const f = parser.parse('(f(x) = g(y) = x * y)(a)(b)').toJSFunction('a,b');
			strictEqual(await f(3, 4), 12);
			strictEqual(await f(4, 5), 20);
		});

		it('[x, y, z]', async function () {
			deepStrictEqual(await parser.parse('[x, y, z]').toJSFunction('x,y,z')(1, 2, 3), [1, 2, 3]);
		});

		it('[x, [y, [z]]]', async function () {
			deepStrictEqual(await parser.parse('[x, [y, [z]]]').toJSFunction('x,y,z')('abc', true, 3), ['abc', [true, [3]]]);
		});

		it('a[2]', async function () {
			strictEqual(await parser.parse('a[2]').toJSFunction('a')([1, 2, 3]), 3);
		});

		it('a[2.9]', async function () {
			strictEqual(await parser.parse('a[2.9]').toJSFunction('a')([1, 2, 3, 4, 5]), 3);
		});

		it('a[n]', async function () {
			strictEqual(await parser.parse('a[n]').toJSFunction('a,n')([1, 2, 3], 0), 1);
			strictEqual(await parser.parse('a[n]').toJSFunction('a,n')([1, 2, 3], 1), 2);
			strictEqual(await parser.parse('a[n]').toJSFunction('a,n')([1, 2, 3], 2), 3);
		});

		it('a["foo"]', async function () {
			strictEqual(await parser.parse('a["foo"]').toJSFunction('a')({ foo: 42 }), undefined);
		});

		it('should work with custom functions', async function () {
			const parser = new Parser();
			parser.consts.customFunction = (a: number, b: number) => a+b;
			strictEqual(await parser.parse('customFunction(a,b)').toJSFunction('a,b')(2,3), 5);
		});

		it('should work with custom async functions', async function () {
			const parser = new Parser();
			parser.consts.customFunction = async (a: number, b: number) => a+b;
			strictEqual(await parser.parse('customFunction(a,b)').toJSFunction('a,b')(2,3), 5);
		});

	});
});
