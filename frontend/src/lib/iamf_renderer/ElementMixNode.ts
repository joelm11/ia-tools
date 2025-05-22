import { AudioChFormat } from "src/@types/AudioFormats";
import { getMixMatrix } from "../mixer/GetMixMatrix";

/**
 * ElementMixNode: A custom Web Audio node for mixing an audio element to a playback layout.
 * Handles channel conversion using a mix matrix.
 */
export class ElementMixNode extends AudioWorkletNode {
  public readonly inputLayout: AudioChFormat;
  public readonly outputLayout: AudioChFormat;
  public readonly mixMatrix: number[][];

  constructor(
    context: AudioContext,
    inputLayout: AudioChFormat,
    outputLayout: AudioChFormat
  ) {
    // Get the conversion matrix
    const matrix = getMixMatrix(inputLayout, outputLayout);
    // Call super with appropriate options
    super(context, "matrix-gain-processor", {
      processorOptions: { matrix },
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCountMode: "explicit",
      channelCount: matrix[0]?.length || 1,
      outputChannelCount: [matrix.length],
    });
    this.inputLayout = inputLayout;
    this.outputLayout = outputLayout;
    this.mixMatrix = matrix;
  }
}
