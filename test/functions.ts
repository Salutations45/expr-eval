/* global describe, it */

'use strict';

import { strictEqual, ok, rejects } from 'assert';
import { Parser } from '../src/index';

describe('Functions', async function () {
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

  describe('pow(x, y)', async function () {
    it('should return x^y', async function () {
      const parser = new Parser();
      strictEqual(await parser.evaluate('pow(3,2)'), 9);
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
