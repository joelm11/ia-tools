import { ChannelGrouping } from "src/@types/AudioFormats";

enum ChannelLabel {
  L = "L",
  R = "R",
  C = "C",
  LFE = "LFE",
  Ls = "Ls",
  Rs = "Rs",
  Lss = "Lss",
  Rss = "Rss",
  Lrs = "Lrs",
  Rrs = "Rrs",
  Ltf = "Ltf",
  Rtf = "Rtf",
  Ltb = "Ltb",
  Rtb = "Rtb",
}

type SrcToDestGain = {
  [src in ChannelLabel]?: { dest: ChannelLabel; gain: number }[];
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

interface Graph {
  nodes: Node[];
  edges: { [startNode in ChannelGrouping]?: EdgeGain[] };
}

export { ChannelLabel, type Node, type Graph, type SrcToDestGain };
