import {
  AudioChFormat,
  ChannelLabel,
  type ChannelLayout,
} from "src/@types/AudioFormats";
import { channelLayouts } from "src/@types/AudioFormats";

interface Node {
  layout: AudioChFormat;
}

type Edge = {
  [inCh in ChannelLabel]: { outCh: ChannelLabel; gain: number };
} & {
  src: Node;
  dest: Node;
};

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

const graph: Graph = {
  nodes: [
    { layout: AudioChFormat.MONO },
    { layout: AudioChFormat.STEREO },
    { layout: AudioChFormat.K3P1P2 },
    { layout: AudioChFormat.K5P1 },
    { layout: AudioChFormat.K5P1P2 },
    { layout: AudioChFormat.K5P1P4 },
    { layout: AudioChFormat.K7P1 },
    { layout: AudioChFormat.K7P1P2 },
    { layout: AudioChFormat.K7P1P4 },
  ],
  edges: [],
};

export function getDownmixMatrix(input: ChannelLayout, output: ChannelLayout) {}
