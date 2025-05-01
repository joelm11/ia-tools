import { SurroundType, TopType } from "./MixerGraph";

type ChannelMapItem = {
  srcCh: number;
  gain: number;
};

// Type that maps a destination channel idx to an array of ChannelMapItems
export type ChannelMap = {
  [key: number]: ChannelMapItem[];
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
    0: [{ srcCh: 0, gain: 1 }],
    1: [{ srcCh: 1, gain: 1 }],
    2: [{ srcCh: 2, gain: 1 }],
    3: [{ srcCh: 3, gain: 1 }],
    4: [
      { srcCh: 4, gain: alpha },
      { srcCh: 6, gain: beta },
    ],
    5: [
      { srcCh: 5, gain: alpha },
      { srcCh: 7, gain: beta },
    ],
  },
};

const S5Node: MixerGraphNode = {
  label: SurroundType.S5,
  conversions: {
    0: [
      { srcCh: 0, gain: 1 },
      { srcCh: 4, gain: delta },
    ],
    1: [
      { srcCh: 1, gain: 1 },
      { srcCh: 5, gain: delta },
    ],
    2: [{ srcCh: 2, gain: 1 }],
    3: [{ srcCh: 3, gain: 1 }],
    4: [{ srcCh: 4, gain: delta }],
    5: [{ srcCh: 5, gain: delta }],
  },
};

const S3Node: MixerGraphNode = {
  label: SurroundType.S3,
  conversions: {
    0: [{ srcCh: 0, gain: 1 }],
    1: [{ srcCh: 1, gain: 1 }],
    2: [{ srcCh: 2, gain: 0.71 }],
    3: [{ srcCh: 2, gain: 0.71 }],
  },
};

const S2Node: MixerGraphNode = {
  label: SurroundType.S2,
  conversions: {
    0: [{ srcCh: 0, gain: 0.35 }],
    1: [{ srcCh: 1, gain: 0.35 }],
  },
};

const T4Node: MixerGraphNode = {
  label: TopType.T4,
  conversions: {
    0: [
      { srcCh: 0, gain: 1 },
      { srcCh: 2, gain: gamma },
    ],
    1: [
      { srcCh: 1, gain: 1 },
      { srcCh: 3, gain: gamma },
    ],
  },
};

const T2Node: MixerGraphNode = {
  label: TopType.T2,
  conversions: {
    0: [{ srcCh: 0, gain: 1 }],
    1: [{ srcCh: 1, gain: 1 }],
  },
};

const TF2Node: MixerGraphNode = {
  label: TopType.TF2,
  conversions: {
    0: [{ srcCh: 0, gain: 1 }],
    1: [{ srcCh: 1, gain: 1 }],
  },
};

export const surroundNodeList: MixerGraphNode[] = [
  S7Node,
  S5Node,
  S3Node,
  S2Node,
];
export const topNodeList: MixerGraphNode[] = [T4Node, T2Node, TF2Node];
