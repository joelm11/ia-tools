import { SurroundType, TopType } from "./MixerGraph";

type ChannelMapItem = {
  gain: number;
  destCh: number | number[];
};
// Type that maps an input channel idx to an object with
// a gain and a dest channel idx
export type ChannelMap = {
  [key: number]: ChannelMapItem;
};

export type MixerGraphNode = {
  label: SurroundType | TopType;
  conversions: ChannelMap;
};
const alpha = 0.5,
  beta = 0.5,
  delta = 0.5,
  gamma = 0.5;

// Note that for all channel orderings in this file the following applies:
// L, R, C, LFE, {Surrounds}, {Tops}

const S7Node: MixerGraphNode = {
  label: SurroundType.S7,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
    2: { gain: 1, destCh: 2 },
    3: { gain: 1, destCh: 3 },
    4: { gain: alpha, destCh: 4 },
    5: { gain: alpha, destCh: 5 },
    6: { gain: beta, destCh: 4 },
    7: { gain: beta, destCh: 5 },
  },
};

const S5Node: MixerGraphNode = {
  label: SurroundType.S5,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
    2: { gain: 1, destCh: 2 },
    3: { gain: 1, destCh: 3 },
    4: { gain: delta, destCh: [0, 4] },
    5: { gain: delta, destCh: [1, 5] },
  },
};

const S3Node: MixerGraphNode = {
  label: SurroundType.S3,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
    2: { gain: 0.71, destCh: [2, 3] },
    3: { gain: 0, destCh: 0 },
  },
};

const S2Node: MixerGraphNode = {
  label: SurroundType.S2,
  conversions: {
    0: { gain: 0.35, destCh: 0 },
    1: { gain: 0.35, destCh: 1 },
  },
};

const T4Node: MixerGraphNode = {
  label: TopType.T4,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
    2: { gain: gamma, destCh: 0 },
    3: { gain: gamma, destCh: 1 },
  },
};

const T2Node: MixerGraphNode = {
  label: TopType.T2,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
  },
};

const TF2Node: MixerGraphNode = {
  label: TopType.TF2,
  conversions: {
    0: { gain: 1, destCh: 0 },
    1: { gain: 1, destCh: 1 },
  },
};

export const surroundNodes: MixerGraphNode[] = [S7Node, S5Node, S3Node, S2Node];
export const topNodes: MixerGraphNode[] = [T4Node, T2Node, TF2Node];
