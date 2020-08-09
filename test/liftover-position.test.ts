import { Position, loadChainFile, LiftPosition, Strand } from '../src';
const fs = require('fs').promises;

test('test position liftover chain 1', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());

  expect(
    chainFile.chainList[0].liftOverPosition(new Position('chr22', 24363328))
  ).toStrictEqual(new LiftPosition('chr22', 23938300, Strand.Plus, false));

  expect(
    chainFile.chainList[0].liftOverPosition(
      new Position('chr22', 24363328 + 35)
    )
  ).toStrictEqual(new LiftPosition('chr22', 23938300 + 35, Strand.Plus, false));

  expect(
    chainFile.chainList[0].liftOverPosition(
      new Position('chr22', 24363328 + 36)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23938300 + 36 + 9, Strand.Plus, false)
  );

  expect(
    chainFile.chainList[0].liftOverPosition(
      new Position('chr22', 24363328 + 36 + 1361)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23938300 + 36 + 9 + 1361, Strand.Plus, false)
  );

  expect(
    chainFile.chainList[0].liftOverPosition(
      new Position('chr22', 24363328 + 36 + 1362)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23938300 + 36 + 9 + 1362, Strand.Plus, true)
  );

  expect(
    chainFile.chainList[0].liftOverPosition(
      new Position('chr22', 24363328 + 36 + 1363)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23938300 + 36 + 9 + 1362, Strand.Plus, false)
  );

  expect(
    chainFile.chainList[0].liftOverPosition(new Position('chr22', 24364950))
  ).toStrictEqual(new LiftPosition('chr22', 23939930, Strand.Plus, false));
});

test('test position liftover chain 2', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());

  expect(
    chainFile.chainList[1].liftOverPosition(new Position('chr22', 24387233))
  ).toStrictEqual(new LiftPosition('chr22', 23993103, Strand.Plus, false));

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 39)
    )
  ).toStrictEqual(new LiftPosition('chr22', 23993103 + 39, Strand.Plus, false));

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40)
    )
  ).toStrictEqual(new LiftPosition('chr22', 23993103 + 40, Strand.Plus, true));

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40 + 1)
    )
  ).toStrictEqual(new LiftPosition('chr22', 23993103 + 40, Strand.Plus, false));

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40 + 1 + 328)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23993103 + 40 + 328, Strand.Plus, false)
  );

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40 + 1 + 329)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23993103 + 40 + 329, Strand.Plus, true)
  );

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40 + 1 + 330)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23993103 + 40 + 329, Strand.Plus, true)
  );

  expect(
    chainFile.chainList[1].liftOverPosition(
      new Position('chr22', 24387233 + 40 + 1 + 331)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 23993103 + 40 + 329, Strand.Plus, false)
  );
});

test('test position liftover chain 3', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());

  expect(
    chainFile.chainList[2].liftOverPosition(new Position('chr22', 24387343))
  ).toStrictEqual(
    new LiftPosition('chr22', 50818468 - 26870339, Strand.Minus, false)
  );

  expect(
    chainFile.chainList[2].liftOverPosition(
      new Position('chr22', 24387343 + 262)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 50818468 - 26870339 - 262, Strand.Minus, false)
  );

  expect(
    chainFile.chainList[2].liftOverPosition(
      new Position('chr22', 24387343 + 263)
    )
  ).toStrictEqual(
    new LiftPosition('chr22', 50818468 - 26870339 - 263, Strand.Minus, true)
  );

  expect(
    chainFile.chainList[2].liftOverPosition(new Position('chr22', 24387819))
  ).toStrictEqual(
    new LiftPosition('chr22', 50818468 - 26870813, Strand.Minus, false)
  );
});
