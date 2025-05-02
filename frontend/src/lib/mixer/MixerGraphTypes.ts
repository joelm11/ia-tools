enum ChannelGrouping {
  S7,
  S5,
  S3,
  S2,
  S1,
  T4,
  T2,
  TF2,
}

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
  destNode: Node;
  // Map every source channel for a given source label to dest label.
  srcToDestGain: SrcToDestGain;
}

interface Node {
  id: ChannelGrouping;
  channels: ChannelLabel[];
}

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

interface Graph {
  nodes: Node[];
  edges: { [startNode in ChannelGrouping]?: EdgeGain[] };
}

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

export { downMixGraph, ChannelGrouping, ChannelLabel };

/**
 * We are looking to construct a (Out. x In.) size matrix.
 * We want to see if we can construct Out[i] from in[j].
 * We can construct if in[j] has a path to out[i].
 * Each row represents an output channel and each col. an input channel.
 * For each row:
 *  For each col:
 *      gain[row][col] = findGain(inputNode, outputNode, inCh, outCh);
 *
 * findGain(inputNode, outputNode, inCh, outCh):
 *  const gain = 1;
 *  if inputNode == outputNode: return gain;
 *  // Traverse graph
 *  if no outgoing edges: return 0;
 *  // It's possible multiple edges have an edgeGain for a channel.
 *  // But there's only one path to an output node (invalid paths return 0).
 *  // So take the max of returned gains.
 *  possibleGains[];
 *  for outgoing edges:
 *       if outgoing edge has an edgeGain for inCh:
 *           possibleGains.push(edgeGain.val * findGain(nextNode, outputNode, inCh));
 *  return max(possibleGains);
 *
 *
 *
 * Traverse graph has 2 outcomes:
 * - We find the output node and return an accumulated gain
 * - We don't find the output node and return 0.
 */

export function findGain(
  inputNode: Node,
  inputCh: ChannelLabel,
  outputNode: Node,
  outputCh: ChannelLabel
): number {
  // If we've hit the final node and the final node contains the channel we were searching for.
  if (inputNode === outputNode && nodeContainsChannel(outputNode, outputCh))
    return 1;

  // If we hit a node with no leaving edges, we know the output channel
  // cannot be constructed from the input channel.
  const edge = downMixGraph.edges[inputNode.id];
  if (!edge) return 0;

  let maxGain = 0;
  for (const edgeGains of edge) {
    const destGainMap = edgeGains.srcToDestGain[inputCh];
    if (destGainMap) {
      for (const destGain of destGainMap) {
        const gain =
          destGain.gain *
          findGain(edgeGains.destNode, destGain.dest, outputNode, outputCh);
        maxGain = Math.max(maxGain, gain);
      }
    }
  }
  return maxGain;
}

function nodeContainsChannel(node: Node, ch: ChannelLabel): boolean {
  for (const channel of node.channels) {
    if (channel === ch) return true;
  }
  return false;
}
