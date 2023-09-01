/* global describe, it */

'use strict';

import { strictEqual, ok, deepStrictEqual, rejects } from 'assert';
import { Parser } from '../src/index';

describe('Functions', async function () {
  describe('roundTo()', async function () {
    // Simple cases
    it('should handle roundTo(663)', async function () {
      strictEqual(await Parser.evaluate('roundTo(663)'), 663);
    });
    it('should handle roundTo(663, 0)', async function () {
      strictEqual(await Parser.evaluate('roundTo(663, 0)'), 663);
    });
    it('should handle roundTo(662.79)', async function () {
      strictEqual(await Parser.evaluate('roundTo(662.79)'), 663);
    });
    it('should handle roundTo(662.79, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(662.79, 1)'), 662.8);
    });
    it('should handle roundTo(662.5, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(662.5, 1)'), 662.5);
    });

    // Negative values and exponents
    it('should handle roundTo(54.1, -1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(54.1, -1)'), 50);
    });
    it('should handle roundTo(-23.67, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(-23.67, 1)'), -23.7);
    });
    it('should handle roundTo(-23.67, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(-23.67, 3)'), -23.670);
    });

    // Big numbers
    it('should handle roundTo(3000000000000000000000000.1233, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(3000000000000000000000000.1233, 1)'), 3000000000000000000000000.1);// eslint-disable-line no-loss-of-precision
    });
    it('should handle roundTo(-3000000000000000000000000.1233, 1)', async function () {
      strictEqual(await Parser.evaluate('roundTo(-3000000000000000000000000.1233, 1)'), -3000000000000000000000000.1);// eslint-disable-line no-loss-of-precision
    });
    it('should handle roundTo(3.12345e14, -13)', async function () {
      strictEqual(await Parser.evaluate('roundTo(3.12345e14, -13)'), 3.1e14);
    });

    // Known problems in other parsers
    // https://stackoverflow.com/a/12830454
    it('should handle roundTo(1.005, 2)', async function () {
      strictEqual(await Parser.evaluate('roundTo(1.005, 2)'), 1.01);
    });

    // Failure to parse (NaN)
    it('should make roundTo(-23, 1.2) NaN', async function () {
      ok(isNaN(await Parser.evaluate('roundTo(-23, 1.2)')));
    });
    it('should make roundTo(-23, "blah") NaN', async function () {
      ok(isNaN(await Parser.evaluate('roundTo(-23, "blah")')));
    });
  });

  describe('random()', async function () {
    it('should return a number from zero to 1', async function () {
      const expr = Parser.parse('random()');
      for (let i = 0; i < 1000; i++) {
        const x = await expr.evaluate();
        ok(x >= 0 && x < 1);
      }
    });

    it('should return different numbers', async function () {
      const expr = Parser.parse('random()');
      const distinct = {};
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        const x = await expr.evaluate();
        sum += x;
        distinct[x] = true;
      }
      // Technically, these could fail but that should be extremely rare
      strictEqual(Object.keys(distinct).length, 1000);
      ok((sum / 1000 >= 0.4) && (sum / 1000 <= 0.6));
    });
  });

  describe('fac(n)', async function () {
    it('should return n!', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('fac(0)'), 1);
      strictEqual(await parser.evaluate('fac(1)'), 1);
      strictEqual(await parser.evaluate('fac(2)'), 2);
      ok(Math.abs(await parser.evaluate('fac(2.5)') - 3.323350970447843) <= 1e-14);
      strictEqual(await parser.evaluate('fac(3)'), 6);
      strictEqual(await parser.evaluate('fac(4)'), 24);
      ok(Math.abs(await parser.evaluate('fac(4.9)') - 101.27019121310335) <= 1e-12);
      strictEqual(await parser.evaluate('fac(5)'), 120);
      strictEqual(await parser.evaluate('fac(6)'), 720);
      strictEqual(await parser.evaluate('fac(7)'), 5040);
      strictEqual(await parser.evaluate('fac(21)'), 51090942171709440000);
    });
  });

  describe('min(a, b, ...)', async function () {
    it('should return the smallest value', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('min()'), Infinity);
      strictEqual(await parser.evaluate('min([])'), Infinity);
      strictEqual(await parser.evaluate('min(1)'), 1);
      strictEqual(await parser.evaluate('min(1,2)'), 1);
      strictEqual(await parser.evaluate('min(2,1)'), 1);
      strictEqual(await parser.evaluate('min(2,1,0)'), 0);
      strictEqual(await parser.evaluate('min(4,3,2,1,0,1,2,3,4,-5,6)'), -5);
      strictEqual(await parser.evaluate('min([1,0,2,-4,8,-16,3.2])'), -16);
    });
  });

  describe('max(a, b, ...)', async function () {
    it('should return the largest value', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('max()'), -Infinity);
      strictEqual(await parser.evaluate('max([])'), -Infinity);
      strictEqual(await parser.evaluate('max(1)'), 1);
      strictEqual(await parser.evaluate('max(1,2)'), 2);
      strictEqual(await parser.evaluate('max(2,1)'), 2);
      strictEqual(await parser.evaluate('max(2,1,0)'), 2);
      strictEqual(await parser.evaluate('max(4,3,2,1,0,1,2,3,4,-5,6)'), 6);
      strictEqual(await parser.evaluate('max([1,0,2,-4,8,-16,3.2])'), 8);
    });
  });

  describe('hypot(a, b, ...)', async function () {
    const parser = new Parser();

    it('should return the hypotenuse', async function () {
      strictEqual(await parser.evaluate('hypot()'), 0);
      strictEqual(await parser.evaluate('hypot(3)'), 3);
      strictEqual(await parser.evaluate('hypot(3,4)'), 5);
      strictEqual(await parser.evaluate('hypot(4,3)'), 5);
      strictEqual(await parser.evaluate('hypot(2,3,4)'), 5.385164807134504);
      strictEqual(await parser.evaluate('hypot(1 / 0)'), Infinity);
      strictEqual(await parser.evaluate('hypot(-1 / 0)'), Infinity);
      strictEqual(await parser.evaluate('hypot(1, 2, 1 / 0)'), Infinity);
    });

    it('should avoid overflowing', async function () {
      ok(Math.abs(await parser.evaluate('hypot(10^200, 10^200)') - 1.4142135623730959e+200) <= 1e186);
      ok(Math.abs(await parser.evaluate('hypot(10^-200, 10^-200)') - 1.4142135623730944e-200) <= 1e186);
      ok(Math.abs(await parser.evaluate('hypot(10^100, 11^100, 12^100, 13^100)') - 2.4793352492856554e+111) <= 1e97);
      strictEqual(await parser.evaluate('hypot(x)', { x: Number.MAX_VALUE }), Number.MAX_VALUE);
      strictEqual(await parser.evaluate('hypot(x, 0)', { x: Number.MAX_VALUE }), Number.MAX_VALUE);
    });
  });

  describe('pow(x, y)', async function () {
    it('should return x^y', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('pow(3,2)'), 9);
      strictEqual(await parser.evaluate('pow(E,1)'), Math.exp(1));
    });
  });

  describe('atan2(y, x)', async function () {
    it('should return atan(y / x)', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('atan2(90, 15)'), 1.4056476493802699);
      strictEqual(await parser.evaluate('atan2(15, 90)'), 0.16514867741462683);
      strictEqual(await parser.evaluate('atan2(0, 0)'), 0);
      strictEqual(await parser.evaluate('atan2(0, 1)'), 0);
      strictEqual(await parser.evaluate('atan2(1, 0)'), Math.PI / 2);
      strictEqual(await parser.evaluate('atan2(0, 1/-inf)', { inf: Infinity }), Math.PI);
      strictEqual(await parser.evaluate('atan2(1/-inf, 1/-inf)', { inf: Infinity }), -Math.PI);
    });
  });

  describe('if(p, t, f)', async function () {
    it('if(1, 1, 0)', async function () {
      strictEqual(await Parser.evaluate('if(1, 1, 0)'), 1);
    });

    it('if(0, 1, 0)', async function () {
      strictEqual(await Parser.evaluate('if(0, 1, 0)'), 0);
    });

    it('if(1==1 or 2==1, 39, 0)', async function () {
      strictEqual(await Parser.evaluate('if(1==1 or 2==1, 39, 0)'), 39);
    });

    it('if(1==1 or 1==2, -4 + 8, 0)', async function () {
      strictEqual(await Parser.evaluate('if(1==1 or 1==2, -4 + 8, 0)'), 4);
    });

    it('if(3 && 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)', async function () {
      strictEqual(await Parser.evaluate('if(3 and 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)'), 2.4);
    });
  });

  describe('gamma(x)', async function () {
    const parser = new Parser();

    it('returns exact answer for integers', async function () {
      strictEqual(await parser.evaluate('gamma(0)'), Infinity);
      strictEqual(await parser.evaluate('gamma(1)'), 1);
      strictEqual(await parser.evaluate('gamma(2)'), 1);
      strictEqual(await parser.evaluate('gamma(3)'), 2);
      strictEqual(await parser.evaluate('gamma(4)'), 6);
      strictEqual(await parser.evaluate('gamma(5)'), 24);
      strictEqual(await parser.evaluate('gamma(6)'), 120);
      strictEqual(await parser.evaluate('gamma(7)'), 720);
      strictEqual(await parser.evaluate('gamma(8)'), 5040);
      strictEqual(await parser.evaluate('gamma(9)'), 40320);
      strictEqual(await parser.evaluate('gamma(10)'), 362880);
      strictEqual(await parser.evaluate('gamma(25)'), 6.204484017332394e+23);
      strictEqual(await parser.evaluate('gamma(50)'), 6.082818640342679e+62);
      strictEqual(await parser.evaluate('gamma(100)'), 9.332621544394415e+155);
      strictEqual(await parser.evaluate('gamma(170)'), 4.2690680090047056e+304);
      strictEqual(await parser.evaluate('gamma(171)'), 7.257415615308004e+306);
      strictEqual(await parser.evaluate('gamma(172)'), Infinity);
    });

    it('returns approximation for fractions', async function () {
      const delta = 1e-14;
      strictEqual(await parser.evaluate('gamma(-10)'), Infinity);
      ok(Math.abs(await parser.evaluate('gamma(-2.5)') - -0.9453087204829419) <= delta);
      strictEqual(await parser.evaluate('gamma(-2)'), Infinity);
      ok(Math.abs(await parser.evaluate('gamma(-1.5)') - 2.36327180120735) <= delta);
      strictEqual(await parser.evaluate('gamma(-1)'), Infinity);
      ok(Math.abs(await parser.evaluate('gamma(-0.75)') - -4.834146544295878) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(-0.5)') - -3.54490770181103) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(-0.25)') - -4.901666809860711) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(0.25)') - 3.62560990822191) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(0.5)') - 1.77245385090552) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(0.75)') - 1.22541670246518) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(1.5)') - 0.886226925452758) <= delta);
      ok(Math.abs(await parser.evaluate('gamma(84.9)') - 2.12678581783475e126) <= 1e113);
      ok(Math.abs(await parser.evaluate('gamma(85.1)') - 5.16530039995559e126) <= 1e114);
      ok(Math.abs(await parser.evaluate('gamma(98.6)') - 1.5043414559976e153) <= 1e140);
      strictEqual(await parser.evaluate('gamma(171.35)'), Infinity);
      strictEqual(await parser.evaluate('gamma(172)'), Infinity);
      strictEqual(await parser.evaluate('gamma(172.5)'), Infinity);
    });

    it('handles NaN and infinity correctly', async function () {
      ok(isNaN(await parser.evaluate('gamma(0/0)')));
      ok(isNaN(await parser.evaluate('gamma()')));
      strictEqual(await parser.evaluate('gamma(1/0)'), Infinity);
      ok(isNaN(await parser.evaluate('gamma(-1/0)')));
    });
  });

  describe('map(f, a)', async function () {
    it('should work on empty arrays', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('map(random, [])'), []);
    });

    it('should fail if first argument is not a function', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('map(4, [])'); }, /not a function/);
    });

    it('should fail if second argument is not an array', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('map(random, 0)'); }, /not an array/);
    });

    it('should call built-in functions', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('map(sqrt, [0, 1, 16, 81])'), [0, 1, 4, 9]);
      deepStrictEqual(await parser.evaluate('map(max, [2, 2, 2, 2, 2, 2])'), [2, 2, 2, 3, 4, 5]);
    });

    it('should call self-defined functions', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('f(a) = a*a; map(f, [0, 1, 2, 3, 4])'), [0, 1, 4, 9, 16]);
    });

    it('should call self-defined functions with index', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('f(a, i) = a+i; map(f, [1,3,5,7,9])'), [1, 4, 7, 10, 13]);
      deepStrictEqual(await parser.evaluate('map(anon(a, i) = a+i, [1,3,5,7,9])'), [1, 4, 7, 10, 13]);
      deepStrictEqual(await parser.evaluate('f(a, i) = i; map(f, [1,3,5,7,9])'), [0, 1, 2, 3, 4]);
    });
  });

  describe('fold(f, init, array)', async function () {
    it('should return the initial value on an empty array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('fold(atan2, 15, [])'), 15);
    });

    it('should fail if first argument is not a function', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('fold(4, 0, [])'); }, /not a function/);
    });

    it('should fail if third argument is not an array', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('fold(random, 0, 5)'); }, /not an array/);
    });

    it('should call built-in functions', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('fold(max, -1, [1, 3, 5, 4, 2, 0])'), 5);
      strictEqual(await parser.evaluate('fold(min, 10, [1, 3, 5, 4, 2, 0, -2, -1])'), -2);
    });

    it('should call self-defined functions', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('f(a, b) = a*b; fold(f, 1, [1, 2, 3, 4, 5])'), 120);
    });

    it('should call self-defined functions with index', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('f(a, b, i) = a*i + b; fold(f, 100, [1,3,5,7,9])'), 193);
    });

    it('should start with the accumulator', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('f(a, b) = a*b; fold(f, 0, [1, 2, 3, 4, 5])'), 0);
      strictEqual(await parser.evaluate('f(a, b) = a*b; fold(f, 1, [1, 2, 3, 4, 5])'), 120);
      strictEqual(await parser.evaluate('f(a, b) = a*b; fold(f, 2, [1, 2, 3, 4, 5])'), 240);
      strictEqual(await parser.evaluate('f(a, b) = a*b; fold(f, 3, [1, 2, 3, 4, 5])'), 360);
    });
  });

  describe('filter(f, array)', async function () {
    it('should work on an empty array', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('filter(random, [])'), []);
    });

    it('should fail if first argument is not a function', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('filter(4, [])'); }, /not a function/);
    });

    it('should fail if second argument is not an array', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('filter(random, 5)'); }, /not an array/);
    });

    it('should call built-in functions', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('filter(not, [1, 0, false, true, 2, ""])'), [0, false, '']);
    });

    it('should call self-defined functions', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('f(x) = x > 2; filter(f, [1, 2, 0, 3, -1, 4])'), [3, 4]);
      deepStrictEqual(await parser.evaluate('f(x) = x > 2; filter(f, [1, 2, 0, 1.9, -1, -4])'), []);
    });

    it('should call self-defined functions with index', async function () {
      const parser = new Parser();
      deepStrictEqual(await parser.evaluate('f(a, i) = a <= i; filter(f, [1,0,5,3,2])'), [0, 3, 2]);
      deepStrictEqual(await parser.evaluate('f(a, i) = i > 3; filter(f, [9,0,5,6,1,2,3,4])'), [1, 2, 3, 4]);
    });
  });

  describe('indexOf(target, array)', async function () {
    it('should return -1 an empty array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf(1, [])'), -1);
    });

    it('should fail if second argument is not an array or string', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('indexOf(5, 5)'); }, /not a string or array/);
    });

    it('should find values in the array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf(1, [1,0,5,3,2])'), 0);
      strictEqual(await parser.evaluate('indexOf(0, [1,0,5,3,2])'), 1);
      strictEqual(await parser.evaluate('indexOf(5, [1,0,5,3,2])'), 2);
      strictEqual(await parser.evaluate('indexOf(3, [1,0,5,3,2])'), 3);
      strictEqual(await parser.evaluate('indexOf(2, [1,0,5,3,2])'), 4);
    });

    it('should find the first matching value in the array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf(5, [5,0,5,3,2])'), 0);
    });

    it('should return -1 for no match', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf(2.5, [1,0,5,3,2])'), -1);
      strictEqual(await parser.evaluate('indexOf("5", [1,0,5,3,2])'), -1);
    });
  });

  describe('indexOf(target, string)', async function () {
    it('return -1 for indexOf("x", "")', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("a", "")'), -1);
    });

    it('return 0 for indexOf("", *)', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("", "")'), 0);
      strictEqual(await parser.evaluate('indexOf("", "a")'), 0);
      strictEqual(await parser.evaluate('indexOf("", "foobar")'), 0);
    });

    it('should find substrings in the string', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("b", "bafdc")'), 0);
      strictEqual(await parser.evaluate('indexOf("a", "bafdc")'), 1);
      strictEqual(await parser.evaluate('indexOf("f", "bafdc")'), 2);
      strictEqual(await parser.evaluate('indexOf("d", "bafdc")'), 3);
      strictEqual(await parser.evaluate('indexOf("c", "bafdc")'), 4);

      strictEqual(await parser.evaluate('indexOf("ba", "bafdc")'), 0);
      strictEqual(await parser.evaluate('indexOf("afd", "bafdc")'), 1);
      strictEqual(await parser.evaluate('indexOf("fdc", "bafdc")'), 2);
      strictEqual(await parser.evaluate('indexOf("dc", "bafdc")'), 3);
      strictEqual(await parser.evaluate('indexOf("c", "bafdc")'), 4);

      strictEqual(await parser.evaluate('indexOf("dc", "dbafdc")'), 4);
    });

    it('should find the first matching substring in the string', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("c", "abcabcabc")'), 2);
      strictEqual(await parser.evaluate('indexOf("ca", "abcabcabc")'), 2);
    });

    it('should find the entire string', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("abcabcabc", "abcabcabc")'), 0);
    });

    it('should return -1 for no match', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('indexOf("x", "abcdefg")'), -1);
      strictEqual(await parser.evaluate('indexOf("abd", "abcdefg")'), -1);
    });
  });

  describe('join(sep, array)', async function () {
    it('should fail if second argument is not an array', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('join("x", "y")'); }, /not an array/);
    });

    it('should return an empty string on an empty array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('join("x", [])'), '');
    });

    it('should work on a single-element array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('join("x", ["a"])'), 'a');
      strictEqual(await parser.evaluate('join("x", [5])'), '5');
    });

    it('should work on a multi-element arrays', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('join("x", ["a", "b", "c", 4])'), 'axbxcx4');
      strictEqual(await parser.evaluate('join(", ", [1, 2])'), '1, 2');
      strictEqual(await parser.evaluate('join("", [1, 2, 3])'), '123');
    });
  });

  describe('sum(array)', async function () {
    it('should fail if the argument is not an array', async function () {
      const parser = new Parser();
      rejects(function () { return parser.evaluate('sum(1)'); }, /not an array/);
    });

    it('should return zero with an empty array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('sum([])'), 0);
    });

    it('should work on a single-element array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('sum([1])'), 1);
    });

    it('should work on a multi-element array', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('sum([1, 2])'), 3);
    });
  });
});
