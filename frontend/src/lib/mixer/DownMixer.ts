import { getChannelCountRaw } from "src/@common/AudioFormatsTools";
import { channelGroupings, type AudioChFormat } from "src/@types/AudioFormats";
import { nodeFromChannelGrouping, findGain } from "./DownMixerGraphData";
import { type Node } from "./MixerGraphTypes";

function getDownmixGainMatrix(
  input: AudioChFormat,
  output: AudioChFormat
): number[][] {
  const inputChCount = getChannelCountRaw(input);
  const outputChCount = getChannelCountRaw(output);

  let gainMat = createMatrix(outputChCount, inputChCount, 0);

  // Populate matrix from downmixing surround channels
  const ssStartNode = nodeFromChannelGrouping(channelGroupings[input].surr);
  const ssEndNode = nodeFromChannelGrouping(channelGroupings[output].surr);
  populateMatrix(ssStartNode, 0, ssEndNode, 0, gainMat);

  // Populate matrix from downmixing top channels
  // As the initial matrix is zero'd, only need to process tops if present in output
  if (channelGroupings[input].tops && channelGroupings[output].tops) {
    const topStartNode = nodeFromChannelGrouping(channelGroupings[input].tops);
    const topEndNode = nodeFromChannelGrouping(channelGroupings[output].tops);
    const inputOffs = ssStartNode.channels.length;
    const outputOffs = ssEndNode.channels.length;
    populateMatrix(topStartNode, inputOffs, topEndNode, outputOffs, gainMat);
  }
  return gainMat;
}

function createMatrix<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => initialValue)
  );
}

function populateMatrix(
  startNode: Node,
  startChOffs: number,
  finishNode: Node,
  finishChOffs: number,
  matrix: number[][]
) {
  const numChannels = startNode.channels.length;
  for (let outputCh = 0; outputCh < finishNode.channels.length; ++outputCh) {
    const finishCh = finishNode.channels[outputCh];
    for (let inputCh = 0; inputCh < numChannels; ++inputCh) {
      const startCh = startNode.channels[inputCh];
      matrix[outputCh + finishChOffs][inputCh + startChOffs] = findGain(
        startNode,
        startCh,
        finishNode,
        finishCh
      );
    }
  }
}

export { getDownmixGainMatrix };
