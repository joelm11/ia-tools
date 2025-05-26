import { getChannelCountRaw } from "src/@common/AudioFormatsTools";
import { AudioChFormat } from "src/@types/AudioFormats";

export class LoudnessRenderer extends AudioWorkletNode {
  numChannels: number;
  currentLoudnessValues: number[] = [];
  constructor(context: AudioContext, layout: AudioChFormat) {
    super(context, "loudness-processor", {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCountMode: "explicit",
      channelCount: getChannelCountRaw(layout) || 1,
      outputChannelCount: [getChannelCountRaw(layout)],
    });
    this.numChannels = getChannelCountRaw(layout);

    // Listen for messages from the worklet
    this.port.onmessage = (event) => {
      if (event.data.loudness) {
        this.currentLoudnessValues = event.data.loudness;
      }
    };
  }
}
