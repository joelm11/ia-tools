// @ts-nocheck
/**
 * An AudioWorkletProcessor that applies a mixing matrix and a final gain value.
 */
class MatrixGainProcessor extends AudioWorkletProcessor {
  // Define the parameters the processor accepts.
  // 'gain' is a standard AudioParam.
  // The 'matrix' is not a standard AudioParam and will be passed via processorOptions
  // and potentially updated via the message port.
  static get parameterDescriptors() {
    return [
      {
        name: "gain",
        defaultValue: 1.0,
        minValue: 0.0,
        maxValue: 10.0, // Example max value, adjust as needed
      },
    ];
  }

  constructor(options) {
    super(options);
    this._matrix = options.processorOptions.matrix || [];

    // Listen for messages from the main thread to update parameters like the matrix.
    this.port.onmessage = (event) => {
      if (event.data.type === "updateMatrix") {
        this._matrix = event.data.matrix;
        console.log("Matrix updated in worklet:", this._matrix);
      }
    };
    console.log("MatrixGainProcessor initialized with matrix:", this._matrix);
  }

  /**
   * The core processing logic for the audio worklet.
   * @param {Float32Array[][]} inputs - Array of input audio buffers (channels).
   * @param {Float32Array[][]} outputs - Array of output audio buffers (channels).
   * @param {AudioParamMap} parameters - Map of AudioParam values.
   */
  process(inputs, outputs, parameters) {
    // An AudioWorklet can have multiple inputs and outputs, but typically
    // we'll work with the first input and first output for a simple processor.
    const input = inputs[0];
    const output = outputs[0];
    const gain = parameters.get("gain")[0]; // Get the gain value (it's an array per sample, but often constant)

    const inputChannels = input.length;
    const outputChannels = output.length;
    const matrix = this._matrix;
    const matrixOutputRows = matrix.length;
    const matrixInputCols = matrix.length > 0 ? matrix[0].length : 0;

    // Ensure we have a valid matrix and at least one input/output channel
    if (
      !matrix ||
      matrixOutputRows === 0 ||
      inputChannels === 0 ||
      outputChannels === 0
    ) {
      // If no matrix or channels, just output silence or pass through if needed
      // For this example, we'll output silence.
      for (let ch = 0; ch < outputChannels; ++ch) {
        output[ch].fill(0);
      }
      return true; // Keep the processor alive
    }

    // Ensure matrix dimensions are compatible (basic check)
    // The matrix should have outputChannels rows and inputChannels columns for a full mix.
    // We'll process based on the matrix dimensions and available channels.
    const actualOutputRows = Math.min(outputChannels, matrixOutputRows);
    const actualInputCols = Math.min(inputChannels, matrixInputCols);

    // Process audio frame by frame (128 samples per frame)
    for (let sample = 0; sample < 128; ++sample) {
      // Initialize output samples for this frame
      const outputSamples = new Array(actualOutputRows).fill(0);

      // Apply the matrix multiplication
      for (let outCh = 0; outCh < actualOutputRows; ++outCh) {
        for (let inCh = 0; inCh < actualInputCols; ++inCh) {
          // Check if the input channel exists before accessing
          if (input[inCh]) {
            outputSamples[outCh] += input[inCh][sample] * matrix[outCh][inCh];
          }
        }
      }

      // Apply the gain and write to the output buffer
      for (let outCh = 0; outCh < actualOutputRows; ++outCh) {
        // Check if the output channel exists before writing
        if (output[outCh]) {
          output[outCh][sample] = outputSamples[outCh] * gain;
        }
      }
    }

    // Return true to indicate that the processor should remain active.
    return true;
  }
}

// Register the processor with the AudioWorkletGlobalScope.
registerProcessor("matrix-gain-processor", MatrixGainProcessor);
