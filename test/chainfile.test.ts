import {
  loadChainFile,
  Chain,
  ChainInterval,
  Strand,
  Region,
  Position,
} from '../src';
const fs = require('fs').promises;

test('test chain file overlap', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());

  const overlapped = chainFile.overlappedChains(
    new Region('chr22', 24387233, 24388570)
  );
  expect(overlapped.length).toBe(2);
  expect(overlapped[0].referenceStart).toBe(24387233);
  expect(overlapped[1].referenceStart).toBe(24387343);

  const overlapped2 = chainFile.overlappedChains(
    new Region('chr22', 24364950, 24387234)
  );
  expect(overlapped2.length).toBe(2);
  expect(overlapped2[0].referenceStart).toBe(24363328);
  expect(overlapped2[1].referenceStart).toBe(24387233);
});

test('test chain overlap', async () => {
  const testChain = new Chain(
    [
      new ChainInterval(36, 0, 9),
      new ChainInterval(1362, 1, 0),
      new ChainInterval(224),
    ],
    4900,
    'chr22',
    51304566,
    Strand.Plus,
    24363328,
    24364951,
    'chr22',
    50818468,
    Strand.Plus,
    23938300,
    23939931,
    '20'
  );

  expect(
    testChain.isReferenceOverlapPosition(new Position('chr22', 24363327))
  ).toBeFalsy();

  expect(
    testChain.isReferenceOverlapPosition(new Position('chr22', 24363328))
  ).toBeTruthy();

  expect(
    testChain.isReferenceOverlapPosition(new Position('chr22', 24364950))
  ).toBeTruthy();

  expect(
    testChain.isReferenceOverlapPosition(new Position('chr22', 24364951))
  ).toBeFalsy();

  expect(
    testChain.isReferenceOverlapPosition(new Position('chr22', 24363327))
  ).toBeFalsy();

  expect(
    testChain.isReferenceOverlap(new Region('chr22', 24363327, 24363328))
  ).toBeFalsy();

  expect(
    testChain.overlappedLength(new Region('chr22', 24363327, 24363328))
  ).toBe(0);

  expect(
    testChain.isReferenceOverlap(new Region('chr22', 24363328, 24363330))
  ).toBeTruthy();

  expect(
    testChain.overlappedLength(new Region('chr22', 24363328, 24363330))
  ).toBe(2);
});

test('test chain file loader', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());
  expect(chainFile.chainList.length).toBe(3);

  expect(chainFile.chainList[0]).toStrictEqual(
    new Chain(
      [
        new ChainInterval(36, 0, 9),
        new ChainInterval(1362, 1, 0),
        new ChainInterval(224),
      ],
      4900,
      'chr22',
      51304566,
      Strand.Plus,
      24363328,
      24364951,
      'chr22',
      50818468,
      Strand.Plus,
      23938300,
      23939931,
      '20'
    )
  );

  expect(chainFile.chainList[1]).toStrictEqual(
    new Chain(
      [
        new ChainInterval(40, 1, 0),
        new ChainInterval(329, 2, 0),
        new ChainInterval(211, 308, 0),
        new ChainInterval(186, 18, 0),
        new ChainInterval(242),
      ],
      4900,
      'chr22',
      51304566,
      Strand.Plus,
      24387233,
      24388570,
      'chr22',
      50818468,
      Strand.Plus,
      23993103,
      23994111,
      '23'
    )
  );

  expect(chainFile.chainList[2]).toStrictEqual(
    new Chain(
      [new ChainInterval(263, 2, 0), new ChainInterval(212)],
      4900,
      'chr22',
      51304566,
      Strand.Plus,
      24387343,
      24387820,
      'chr22',
      50818468,
      Strand.Minus,
      26870339,
      26870814,
      '24'
    )
  );
});
