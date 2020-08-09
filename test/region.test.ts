import { Region, Strand, parseStrand, Position } from '../src';

test('test region overlap', () => {
  expect(
    new Region('chr1', 10, 20).overlap(new Region('chr1', 10, 20))
  ).toBeTruthy();

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 10, 20))
  ).toBe(10);

  expect(
    new Region('chr1', 10, 20).overlap(new Region('chr1', 0, 11))
  ).toBeTruthy();

  expect(
    new Region('chr1', 10, 20).overlapPosition(new Position('chr1', 10))
  ).toBeTruthy();

  expect(
    new Region('chr1', 10, 20).overlapPosition(new Position('chr1', 19))
  ).toBeTruthy();

  expect(
    new Region('chr1', 10, 20).overlapPosition(new Position('chr1', 9))
  ).toBeFalsy();

  expect(
    new Region('chr1', 10, 20).overlapPosition(new Position('chr1', 20))
  ).toBeFalsy();

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 0, 11))
  ).toBe(1);

  expect(
    new Region('chr1', 10, 20).overlap(new Region('chr1', 19, 30))
  ).toBeTruthy();

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 19, 30))
  ).toBe(1);

  expect(
    new Region('chr1', 10, 20).overlap(new Region('chr1', 0, 10))
  ).toBeFalsy();

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 0, 10))
  ).toBe(0);

  expect(
    new Region('chr1', 10, 20).overlap(new Region('chr1', 20, 30))
  ).toBeFalsy();

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 20, 30))
  ).toBe(0);

  expect(
    new Region('chr1', 10, 20).overlappedLength(new Region('chr1', 30, 40))
  ).toBe(0);
});

test('parse strand test', () => {
  expect(parseStrand('+')).toBe(Strand.Plus);
  expect(parseStrand('-')).toBe(Strand.Minus);
  expect(() => parseStrand('x')).toThrowError(/Invalid strand.*/);
});
