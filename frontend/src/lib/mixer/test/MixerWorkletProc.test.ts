import { test, expect } from "vitest";
import { createMatrix } from "../DownMixer";
import { AudioChFormat } from "src/@types/AudioFormats";
import { getChannelCountRaw } from "src/@common/AudioFormatsTools";
import { getMixMatrix, printMatrixDynamicPadding } from "../GetMixMatrix";

function process(
  inputs: number[][],
  outputs: number[][],
  parameters: any,
  matrix: number[][]
): number[][] {
  const input = inputs;
  const output = outputs;
  // const elementGain = parameters.get("gain")[0];
  const elementGain = 1;

  const inputChannels = input.length;
  const outputChannels = output.length;
  // const matrix = this._matrix;
  const matrixOutputRows = matrix.length;
  const matrixInputCols = matrix.length > 0 ? matrix[0].length : 0;

  // Ensure we have a valid matrix and that matrix dimensions match I/O.
  if (!matrix || matrixInputCols === 0) {
    throw "MixerWorklet: No valid matrix";
  }
  if (matrix.length != output.length || matrix[0].length != input.length) {
    throw `MixerWorklet: Mismatched matrix and I/O dimensions ${matrix.length} ${output.length}`;
  }

  // Perform matrix multiplication into the output buffer.
  for (let outputCh = 0; outputCh < output.length; ++outputCh) {
    for (let inputCh = 0; inputCh < input.length; ++inputCh) {
      const gain = matrix[outputCh][inputCh];
      for (let sample = 0; sample < input[inputCh].length; ++sample) {
        output[outputCh][sample] += input[inputCh][sample] * gain;
      }
    }
  }

  // Apply a final gain to all channels in the output buffer.
  for (let outputCh = 0; outputCh < output.length; ++outputCh) {
    for (let sample = 0; sample < output[outputCh].length; ++sample) {
      output[outputCh][sample] *= elementGain;
    }
  }

  return output;
}

test("Test worklet process function", () => {
  const inputFormat = AudioChFormat.K3P1P2;
  const outputFormat = AudioChFormat.STEREO;
  const numSamples = 3;

  // Make an input matrix for input samples.
  const input = createMatrix(getChannelCountRaw(inputFormat), numSamples, 1);
  console.log("Input");
  printMatrixDynamicPadding(input);
  // Make an output matrix for output samples.
  const output = createMatrix(getChannelCountRaw(outputFormat), numSamples, 0);
  const mixMatrix = getMixMatrix(inputFormat, outputFormat);
  console.log("Mix Matrix:");
  printMatrixDynamicPadding(mixMatrix);

  // Run process and examine output.
  const res = process(input, output, {}, mixMatrix);
  console.log("Res Matrix:");
  printMatrixDynamicPadding(res);
});
