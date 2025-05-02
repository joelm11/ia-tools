enum NodeLabel {
  S7,
  S5,
  S3,
  S2,
  S1,
  T4,
  T2,
  TF2,
}

// type ChannelLayout = {
//   [label in NodeLabel]: ChannelLabel[];
// };

// const channelLayouts: ChannelLayout = {
//   [NodeLabel.S7]: [
//     ChannelLabel.L,
//     ChannelLabel.R,
//     ChannelLabel.C,
//     ChannelLabel.LFE,
//     ChannelLabel.Lss,
//     ChannelLabel.Rss,
//     ChannelLabel.Lrs,
//     ChannelLabel.Rrs,
//   ],
//   [NodeLabel.S5]: [
//     ChannelLabel.L,
//     ChannelLabel.R,
//     ChannelLabel.C,
//     ChannelLabel.LFE,
//     ChannelLabel.Ls,
//     ChannelLabel.Rs,
//   ],
//   [NodeLabel.S3]: [
//     ChannelLabel.L,
//     ChannelLabel.R,
//     ChannelLabel.C,
//     ChannelLabel.LFE,
//   ],
//   [NodeLabel.S2]: [ChannelLabel.L, ChannelLabel.R],
//   [NodeLabel.S1]: [ChannelLabel.C],
//   [NodeLabel.T4]: [
//     ChannelLabel.Ltf,
//     ChannelLabel.Rtf,
//     ChannelLabel.Ltb,
//     ChannelLabel.Rtb,
//   ],
//   [NodeLabel.T2]: [ChannelLabel.Ltf, ChannelLabel.Rtf],
//   [NodeLabel.TF2]: [ChannelLabel.Ltf, ChannelLabel.Rtf],
// };

enum ChannelLabel {
  L,
  R,
  C,
  LFE,
  Ls,
  Rs,
  Lss,
  Rss,
  Lrs,
  Rrs,
  Ltf,
  Rtf,
  Ltb,
  Rtb,
}

type SrcToDestGain = {
  [src in ChannelLabel]?: { dest: ChannelLabel; gain: number }[];
};

const alpha = 0.5;
const beta = 0.5;
const delta = 0.5;
const gamma = 0.5;

const S7toS5: SrcToDestGain = {
  [ChannelLabel.L]: [{ dest: ChannelLabel.L, gain: 1 }],
  [ChannelLabel.R]: [{ dest: ChannelLabel.R, gain: 1 }],
  [ChannelLabel.C]: [{ dest: ChannelLabel.C, gain: 1 }],
  [ChannelLabel.LFE]: [{ dest: ChannelLabel.LFE, gain: 1 }],
  [ChannelLabel.Lss]: [{ dest: ChannelLabel.Ls, gain: alpha }],
  [ChannelLabel.Rss]: [{ dest: ChannelLabel.Rs, gain: alpha }],
  [ChannelLabel.Lrs]: [{ dest: ChannelLabel.Ls, gain: beta }],
  [ChannelLabel.Rrs]: [{ dest: ChannelLabel.Rs, gain: beta }],
};

const S5toS3: SrcToDestGain = {
  [ChannelLabel.L]: [{ dest: ChannelLabel.L, gain: 1 }],
  [ChannelLabel.R]: [{ dest: ChannelLabel.R, gain: 1 }],
  [ChannelLabel.C]: [{ dest: ChannelLabel.C, gain: 1 }],
  [ChannelLabel.LFE]: [{ dest: ChannelLabel.LFE, gain: 1 }],
  [ChannelLabel.Ls]: [{ dest: ChannelLabel.L, gain: delta }],
  [ChannelLabel.Rs]: [{ dest: ChannelLabel.R, gain: delta }],
};

const S5toTF2: SrcToDestGain = {
  [ChannelLabel.Ls]: [{ dest: ChannelLabel.Ltf, gain: delta }],
  [ChannelLabel.Rs]: [{ dest: ChannelLabel.Rtf, gain: delta }],
};

const S3toS2: SrcToDestGain = {
  [ChannelLabel.L]: [{ dest: ChannelLabel.L, gain: 1 }],
  [ChannelLabel.R]: [{ dest: ChannelLabel.R, gain: 1 }],
  [ChannelLabel.C]: [{ dest: ChannelLabel.C, gain: 0.71 }],
};

const S2toS1: SrcToDestGain = {
  [ChannelLabel.L]: [{ dest: ChannelLabel.C, gain: 0.5 }],
  [ChannelLabel.R]: [{ dest: ChannelLabel.C, gain: 0.5 }],
};

const T4toT2: SrcToDestGain = {
  [ChannelLabel.Ltf]: [{ dest: ChannelLabel.Ltf, gain: 1 }],
  [ChannelLabel.Rtf]: [{ dest: ChannelLabel.Rtf, gain: 1 }],
  [ChannelLabel.Ltb]: [{ dest: ChannelLabel.Ltf, gain: gamma }],
  [ChannelLabel.Rtb]: [{ dest: ChannelLabel.Rtf, gain: gamma }],
};

const T2toTF2: SrcToDestGain = {
  [ChannelLabel.Ltf]: [{ dest: ChannelLabel.Ltf, gain: 1 }],
  [ChannelLabel.Rtf]: [{ dest: ChannelLabel.Rtf, gain: 1 }],
};

interface EdgeGain {
  destNode: NodeLabel;
  // Map every source channel for a given source label to dest label.
  srcToDestGain: SrcToDestGain;
}

interface Graph {
  // List of all surround and top channel layouts (S7,S5... T4,T2...)
  nodes: NodeLabel[];
  edges: { [startNode in NodeLabel]: EdgeGain[] };
}

const graph: Graph = {
  nodes: [
    NodeLabel.S7,
    NodeLabel.S5,
    NodeLabel.S3,
    NodeLabel.S2,
    NodeLabel.S2,
    NodeLabel.T4,
    NodeLabel.T2,
    NodeLabel.TF2,
  ],
  edges: {
    [NodeLabel.S7]: [{ destNode: NodeLabel.S5, srcToDestGain: S7toS5 }],
    [NodeLabel.S5]: [
      { destNode: NodeLabel.S3, srcToDestGain: S5toS3 },
      { destNode: NodeLabel.TF2, srcToDestGain: S5toTF2 },
    ],
    [NodeLabel.S3]: [{ destNode: NodeLabel.S2, srcToDestGain: S3toS2 }],
    [NodeLabel.S2]: [{ destNode: NodeLabel.S1, srcToDestGain: S2toS1 }],
    [NodeLabel.T4]: [{ destNode: NodeLabel.T2, srcToDestGain: T4toT2 }],
    [NodeLabel.T2]: [{ destNode: NodeLabel.TF2, srcToDestGain: T2toTF2 }],
  },
};
