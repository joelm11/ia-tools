import type { Mixer } from "./Mixer.svelte";
import {
  surroundNodeList,
  topNodeList,
  type MixerGraphNode,
} from "./MixerGraphNodes";
import Queue from "./Queue";
import { Matrix } from "mathjs";

export enum SurroundType {
  S7,
  S5,
  S3,
  S2,
  S1,
}

export enum TopType {
  T4,
  T2,
  TF2,
}

type SurroundFormat = {
  surround: SurroundType;
  top?: TopType;
};

export function constructGraph(
  inputFormat: SurroundFormat,
  outputFormat: SurroundFormat
) {
  const surroundNodes = queueNodes(
    inputFormat.surround,
    outputFormat.surround,
    surroundNodeList
  );

  // Add top nodes if the output format has top channels.
  let topNodes: Queue<MixerGraphNode> | undefined;
  if (outputFormat.top && inputFormat.top) {
    topNodes = queueNodes(inputFormat.top, outputFormat.top, topNodeList);
  }
}

function queueNodes(
  input: SurroundType | TopType,
  output: SurroundType | TopType,
  nodeList: MixerGraphNode[]
): Queue<MixerGraphNode> {
  let nodes = new Queue<MixerGraphNode>();

  const inputType = input;
  const outputType = output;
  let currType = inputType;
  while (currType !== outputType) {
    const node = nodeList[currType];
    nodes.enqueue(node);
    currType++;
  }

  return nodes;
}

function downmixMatFromNodes(
  numInputChannels: number,
  surroundNodes: Queue<MixerGraphNode>,
  topNodes?: Queue<MixerGraphNode>
) {
  while (!surroundNodes.isEmpty() || topNodes?.isEmpty()) {
    // Construct gain matrix for this step.
    const surroundNode = surroundNodes.dequeue();
    const topNode = topNodes?.dequeue();
    if (surroundNode && topNode) {
    } else if (surroundNode) {
    } else {
    }
  }
}

function gainMatFromNodes() {}
