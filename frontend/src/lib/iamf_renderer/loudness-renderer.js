// @ts-nocheck

class LoudnessProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const numChannels = input.length;
    const loudnessValues = [];

    // Iterate through each input channel
    for (let channel = 0; channel < numChannels; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      let sum = 0;

      // Calculate RMS loudness for the current channel
      for (let i = 0; i < inputChannel.length; ++i) {
        const sample = inputChannel[i];
        sum += sample * sample;
        outputChannel[i] = sample; // Pass the audio through
      }

      const rms = Math.sqrt(sum / inputChannel.length);
      loudnessValues.push(rms);
    }

    // Send the loudness values to the host node
    this.port.postMessage({ loudness: loudnessValues });

    return true; // Keep the processor running
  }
}

registerProcessor("loudness-processor", LoudnessProcessor);
