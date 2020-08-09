import { Region, loadChainFile, LiftRegion, Strand } from '../src';
const fs = require('fs').promises;

test('test position liftover chain 1', async () => {
  const buff: Buffer = await fs.readFile('testfiles/testchain1.chain');
  const chainFile = loadChainFile(buff.toString());

  expect(
    chainFile.chainList[0].liftOverRegion(
      new Region('chr22', 24363328, 24364950)
    )
  ).toStrictEqual(
    new LiftRegion('chr22', 23938300, 23939930, Strand.Plus, 0, 0)
  );

  expect(
    chainFile.chainList[0].liftOverRegion(
      new Region('chr22', 24363325, 24364960)
    )
  ).toStrictEqual(
    new LiftRegion('chr22', 23938300, 23939931, Strand.Plus, 3, 9)
  );
});
