import {
  ChannelGrouping,
  ChannelLabel,
  type Node,
  type Graph,
  type SrcToDestGain,
} from "./MixerGraphTypes";

const alpha = 0.707;
const beta = 0.707;
const delta = 0.707;
const gamma = 0.707;

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
  [ChannelLabel.C]: [
    { dest: ChannelLabel.L, gain: 0.71 },
    { dest: ChannelLabel.R, gain: 0.71 },
  ],
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

const S7Node: Node = {
  id: ChannelGrouping.S7,
  channels: [
    ChannelLabel.L,
    ChannelLabel.R,
    ChannelLabel.C,
    ChannelLabel.LFE,
    ChannelLabel.Lss,
    ChannelLabel.Rss,
    ChannelLabel.Lrs,
    ChannelLabel.Rrs,
  ],
};

const S5Node: Node = {
  id: ChannelGrouping.S5,
  channels: [
    ChannelLabel.L,
    ChannelLabel.R,
    ChannelLabel.C,
    ChannelLabel.LFE,
    ChannelLabel.Ls,
    ChannelLabel.Rs,
  ],
};

const S3Node: Node = {
  id: ChannelGrouping.S3,
  channels: [ChannelLabel.L, ChannelLabel.R, ChannelLabel.C, ChannelLabel.LFE],
};

const S2Node: Node = {
  id: ChannelGrouping.S2,
  channels: [ChannelLabel.L, ChannelLabel.R],
};

const S1Node: Node = {
  id: ChannelGrouping.S1,
  channels: [ChannelLabel.C],
};

const T4Node: Node = {
  id: ChannelGrouping.T4,
  channels: [
    ChannelLabel.Ltf,
    ChannelLabel.Rtf,
    ChannelLabel.Ltb,
    ChannelLabel.Rtb,
  ],
};

const T2Node: Node = {
  id: ChannelGrouping.T2,
  channels: [ChannelLabel.Ltf, ChannelLabel.Rtf],
};

const TF2Node: Node = {
  id: ChannelGrouping.TF2,
  channels: [ChannelLabel.Ltf, ChannelLabel.Rtf],
};

const downMixGraph: Graph = {
  nodes: [S7Node, S5Node, S3Node, S2Node, S2Node, T4Node, T2Node, TF2Node],
  edges: {
    [ChannelGrouping.S7]: [{ destNode: S5Node, srcToDestGain: S7toS5 }],
    [ChannelGrouping.S5]: [
      { destNode: S3Node, srcToDestGain: S5toS3 },
      { destNode: TF2Node, srcToDestGain: S5toTF2 },
    ],
    [ChannelGrouping.S3]: [{ destNode: S2Node, srcToDestGain: S3toS2 }],
    [ChannelGrouping.S2]: [{ destNode: S1Node, srcToDestGain: S2toS1 }],
    [ChannelGrouping.T4]: [{ destNode: T2Node, srcToDestGain: T4toT2 }],
    [ChannelGrouping.T2]: [{ destNode: TF2Node, srcToDestGain: T2toTF2 }],
  },
};

function findGain(
  inputNode: Node,
  inputCh: ChannelLabel,
  outputNode: Node,
  outputCh: ChannelLabel
): number {
  // If we've hit the final node and the final node contains the channel we were searching for.
  if (inputNode === outputNode && inputCh === outputCh) return 1;

  // If we hit a node with no leaving edges, we know the output channel
  // cannot be constructed from the input channel.
  const edges = downMixGraph.edges[inputNode.id];
  if (!edges) return 0;

  let maxGain = 0;
  for (const edge of edges) {
    // If the edge map has an entry for the input channel
    const destGainMap = edge.srcToDestGain[inputCh];
    if (destGainMap) {
      for (const destGain of destGainMap) {
        const gain =
          destGain.gain *
          findGain(edge.destNode, destGain.dest, outputNode, outputCh);
        maxGain = Math.max(maxGain, gain);
      }
    }
  }
  return maxGain;
}

function nodeFromChannelGrouping(chGroup: ChannelGrouping): Node {
  switch (chGroup) {
    case ChannelGrouping.S7:
      return S7Node;
    case ChannelGrouping.S5:
      return S5Node;
    case ChannelGrouping.S3:
      return S3Node;
    case ChannelGrouping.S2:
      return S2Node;
    case ChannelGrouping.S1:
      return S1Node;
    case ChannelGrouping.T4:
      return T4Node;
    case ChannelGrouping.T2:
      return T2Node;
    case ChannelGrouping.TF2:
      return TF2Node;
  }
}

export { type Node, findGain, nodeFromChannelGrouping };
