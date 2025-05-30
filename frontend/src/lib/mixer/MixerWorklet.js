// @ts-nocheck

import { printMatrixDynamicPadding } from "./GetMixMatrix";

/**
 * An AudioWorkletProcessor that applies a mixing matrix and a final gain value.
 */
class MatrixGainProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._matrix = options.processorOptions.matrix || [];

    // Listen for messages from the main thread to update parameters like the matrix.
    this.port.onmessage = (event) => {
      if (event.data.type === "updateMatrix") {
        this._matrix = event.data.matrix;
        console.log("Matrix updated in worklet:");
      }
    };
  }

  /**
   * The core processing logic for the audio worklet.
   * @param {Float32Array[][]} inputs - Array of input audio buffers (channels).
   * @param {Float32Array[][]} outputs - Array of output audio buffers (channels).
   * @param {AudioParamMap} parameters - Map of AudioParam values.
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const inputChannels = input.length;
    const outputChannels = output.length;
    const matrix = this._matrix;
    const matrixOutputRows = matrix.length;
    const matrixInputCols = matrix.length > 0 ? matrix[0].length : 0;

    // Ensure we have a valid matrix and that matrix dimensions match I/O.
    if (!matrix || matrixInputCols.length === 0) {
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

    return true;
  }
}

// Register the processor with the AudioWorkletGlobalScope.
registerProcessor("matrix-gain-processor", MatrixGainProcessor);
