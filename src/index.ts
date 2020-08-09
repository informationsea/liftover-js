/**
 * Genomic position
 */
export class Position {
  /**
   * Create genomic position
   *
   * @param chromosome a name of chromosme
   * @param position genomic position
   */
  constructor(public chromosome: string, public position: number) {}
}

/**
 * LiftOver processed genomic position
 * @param chromosome a mapped chromosome name
 * @param position a mapped genomic position
 * @param strand a new strand
 * @param inGap a original position was mapped in a gap
 */
export class LiftPosition extends Position {
  /**
   * LiftOver processed genomic position
   *
   * @param chromosome a mapped chromosome name
   * @param position a mapped genomic position
   * @param strand a new strand
   * @param inGap a original position was mapped in a gap
   */
  constructor(
    chromosome: string,
    position: number,
    public strand: Strand,
    public inGap: boolean
  ) {
    super(chromosome, position);
  }
}

/**
 * Genomic Region
 */
export class Region {
  /**
   * Create genomic region.
   *
   * @param chromosome a name of chromosome
   * @param start a start position of a region. This position is included.
   * @param stop a stop position of a region. This position is excluded.
   */
  constructor(
    public chromosome: string,
    public start: number,
    public stop: number
  ) {}

  /**
   * Get start position as a `Position` class
   */
  startPosition() {
    return new Position(this.chromosome, this.start);
  }

  /**
   * Get stop position as a `Position` class.
   */
  stopPosition() {
    return new Position(this.chromosome, this.stop - 1);
  }

  /**
   * Check this region is overlapped with another region
   * @param other a region
   */
  overlap(other: Region) {
    if (this.chromosome === other.chromosome) {
      return this.start < other.stop && other.start < this.stop;
    } else {
      return false;
    }
  }

  /**
   * Check this region is overlapped with a position
   * @param position a positon
   */
  overlapPosition(position: Position) {
    if (this.chromosome === position.chromosome) {
      return this.start <= position.position && position.position < this.stop;
    } else {
      return false;
    }
  }

  /**
   * A overlapped length with another region.
   * @param region another region
   */
  overlappedLength(region: Region) {
    if (this.chromosome === region.chromosome) {
      return Math.max(
        0,
        Math.min(this.stop, region.stop) - Math.max(this.start, region.start)
      );
    }
    return 0;
  }
}

/**
 * Mapped genomic Region
 */
export class LiftRegion extends Region {
  /**
   * Create mapped genomic region.
   *
   * @param chromosome a mapped chromosome
   * @param start a start position of a mapped region. This position is included.
   * @param stop a stop position of a mapped region. This position is excluded.
   * @param strand a mapped strand
   * @param startGap a overflowed length from a start of chain
   * @param stopGap a overflowed length from a end of chain
   */
  constructor(
    chromosome: string,
    start: number,
    stop: number,
    public strand: Strand,
    public startGap: number,
    public stopGap: number
  ) {
    super(chromosome, start, stop);
  }
}

/**
 * A strand
 */
export enum Strand {
  Plus,
  Minus,
}

/**
 * Parse strand text
 * @param val strand text
 */
export const parseStrand = (val: string) => {
  if (val === '-') {
    return Strand.Minus;
  } else if (val === '+') {
    return Strand.Plus;
  }
  throw new Error('Invalid strand: ' + val);
};

/**
 * a chain interval
 * This class must be created with `loadChainFile`
 */
export class ChainInterval {
  constructor(
    public intervalSize: number,
    public differenceReference?: number,
    public differenceQuery?: number
  ) {}

  referenceLength() {
    return this.intervalSize + (this.differenceReference ?? 0);
  }

  queryLength() {
    return this.intervalSize + (this.differenceQuery ?? 0);
  }
}

/**
 * A chain.
 * This class must be created with `loadChainFile`
 */
export class Chain {
  constructor(
    public chainInterval: ChainInterval[],
    public score: number,
    public referenceChromosome: string,
    public referenceChromosomeLength: number,
    public referenceStrand: Strand,
    public referenceStart: number,
    public referenceEnd: number,
    public queryChromosome: string,
    public queryChromosomeLength: number,
    public queryStrand: Strand,
    public queryStart: number,
    public queryEnd: number,
    public chainId: string
  ) {}

  isReferenceOverlap(region: Region) {
    if (this.referenceChromosome === region.chromosome) {
      if (
        this.referenceStart < region.stop &&
        region.start < this.referenceEnd
      ) {
        return true;
      }
    }
    return false;
  }

  isReferenceOverlapPosition(position: Position) {
    if (this.referenceChromosome === position.chromosome) {
      if (
        this.referenceStart <= position.position &&
        position.position < this.referenceEnd
      ) {
        return true;
      }
    }
    return false;
  }

  overlappedLength(region: Region) {
    if (this.referenceChromosome === region.chromosome) {
      return Math.max(
        0,
        Math.min(this.referenceEnd, region.stop) -
          Math.max(this.referenceStart, region.start)
      );
    }
    return 0;
  }

  referenceLength() {
    return this.referenceEnd - this.referenceStart;
  }

  queryLength() {
    return this.queryEnd - this.queryStart;
  }

  liftOverRegion(region: Region) {
    if (!this.isReferenceOverlap(region)) {
      return null;
    }

    const startGap = Math.max(0, this.referenceStart - region.start);
    const start =
      this.liftOverPosition(new Position(region.chromosome, region.start))
        ?.position ?? this.queryStart;

    const stopGap = Math.max(0, region.stop - this.referenceEnd);
    const stop =
      this.liftOverPosition(new Position(region.chromosome, region.stop - 1))
        ?.position ?? this.queryEnd - 1;

    if (this.queryStrand === Strand.Plus) {
      return new LiftRegion(
        this.queryChromosome,
        start,
        stop + 1,
        this.queryStrand,
        startGap,
        stopGap
      );
    } else {
      return new LiftRegion(
        this.queryChromosome,
        stop,
        start + 1,
        this.queryStrand,
        stopGap,
        startGap
      );
    }
  }

  liftOverPosition(position: Position) {
    if (!this.isReferenceOverlapPosition(position)) {
      return null;
    }

    let currentReferencePosition = this.referenceStart;
    let currentQueryPosition = this.queryStart;
    for (const one of this.chainInterval) {
      const nextReferencePosition =
        currentReferencePosition + one.referenceLength();
      if (position.position < nextReferencePosition) {
        // run liftOver
        let inGap = false;
        let queryPosition =
          currentQueryPosition + (position.position - currentReferencePosition);
        if (currentReferencePosition + one.intervalSize <= position.position) {
          queryPosition = currentQueryPosition + one.intervalSize;
          inGap = true;
        }
        if (this.queryStrand === Strand.Minus) {
          queryPosition = this.queryChromosomeLength - queryPosition;
        }
        return new LiftPosition(
          this.queryChromosome,
          queryPosition,
          this.queryStrand,
          inGap
        );
      }

      currentReferencePosition = nextReferencePosition;
      currentQueryPosition = currentQueryPosition + one.queryLength();
    }

    throw new Error('Unreachable code');
  }
}

/**
 * A chain file.
 * This class must be created with `loadChainFile`.
 */
export class ChainFile {
  public chromosomeToChain: Map<string, Array<Chain>>;

  /**
   * This constructor must be called with `loadChainFile`
   * @param chainList a list of chains
   */
  constructor(public chainList: Array<Chain>) {
    this.chromosomeToChain = new Map();
    chainList.forEach(one => {
      if (!this.chromosomeToChain.has(one.referenceChromosome)) {
        this.chromosomeToChain.set(one.referenceChromosome, []);
      }

      this.chromosomeToChain.get(one.referenceChromosome)?.push(one);
    });
  }

  /**
   * Search overlapped chain with a position
   * @param position a position
   */
  overlappedChainsWithPosition(position: Position) {
    return (
      this.chromosomeToChain
        .get(position.chromosome)
        ?.filter(x => x.isReferenceOverlapPosition(position)) ?? []
    );
  }

  /**
   * Search overlapped chains with a region
   * @param region a region
   */
  overlappedChains(region: Region) {
    return (
      this.chromosomeToChain
        .get(region.chromosome)
        ?.filter(x => x.isReferenceOverlap(region)) ?? []
    );
  }

  /**
   * Map a position to new reference genome coordinate
   * @param position a original position
   */
  liftOverPosition(position: Position): Array<LiftPosition> {
    return this.overlappedChainsWithPosition(position).flatMap(x => {
      const d = x.liftOverPosition(position);
      if (d === null) {
        return [];
      } else {
        return [d];
      }
    });
  }

  /**
   * Map a region to new reference genome coordinate
   * @param region a original region
   */
  liftOverRegion(region: Region): Array<LiftRegion> {
    return this.overlappedChains(region).flatMap(x => {
      const d = x.liftOverRegion(region);
      if (d === null) {
        return [];
      } else {
        return [d];
      }
    });
  }
}

const enum ChainLoadStatus {
  Outside = 0,
  InChain = 1,
}

const SpaceRegex = new RegExp(/\s/);

/**
 * load chain file from text chain file
 * @param fileData chain file text
 */
export const loadChainFile = (fileData: string) => {
  const lines = fileData.split('\n');
  let status: ChainLoadStatus = 0;
  let currentChain: Chain | null = null;
  const chainList = Array<Chain>();

  for (const line of lines) {
    const trimLine = line.trim();
    if (trimLine.startsWith('#')) {
      continue;
    }

    switch (status) {
      case ChainLoadStatus.Outside: {
        if (trimLine === '') {
          continue;
        }
        const elements = trimLine.split(SpaceRegex);
        if (elements.length !== 13) {
          throw new Error('Invalid number of header elements');
        }
        if (elements[0] !== 'chain') {
          throw new Error('no chain header found');
        }
        if (elements[4] !== '+') {
          throw new Error('invalid strand');
        }
        status = ChainLoadStatus.InChain;
        currentChain = new Chain(
          [],
          parseFloat(elements[1]),
          elements[2],
          parseInt(elements[3]),
          parseStrand(elements[4]),
          parseInt(elements[5]),
          parseInt(elements[6]),
          elements[7],
          parseInt(elements[8]),
          parseStrand(elements[9]),
          parseInt(elements[10]),
          parseInt(elements[11]),
          elements[12]
        );
        break;
      }
      case ChainLoadStatus.InChain: {
        const elements = trimLine.split(SpaceRegex);
        if (elements.length === 3) {
          currentChain?.chainInterval.push(
            new ChainInterval(
              parseInt(elements[0]),
              parseInt(elements[1]),
              parseInt(elements[2])
            )
          );
        } else if (elements.length === 1) {
          currentChain?.chainInterval.push(
            new ChainInterval(parseInt(elements[0]))
          );
          status = ChainLoadStatus.Outside;
          chainList.push(currentChain!!);
        } else {
          throw new Error('Invalid number of columns');
        }
        break;
      }
    }
  }

  return new ChainFile(chainList);
};
