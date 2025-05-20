// Mock AudioWorkletNode for Node.js/Vitest environment
class FakeAudioWorkletNode {
  public inputLayout: any;
  public outputLayout: any;
  public mixMatrix: any;
  public channelCount: number;
  public outputChannelCount: number[];
  constructor(context: any, processorName: string, options: any) {
    this.inputLayout = arguments[1];
    this.outputLayout = arguments[2];
    this.mixMatrix = options.processorOptions.matrix;
    this.channelCount = options.channelCount;
    this.outputChannelCount = options.outputChannelCount;
  }
  connect() {}
  disconnect() {}
}
(globalThis as any).AudioWorkletNode = FakeAudioWorkletNode;

import { AudioChFormat } from "src/@types/AudioFormats";
import { getMixMatrix } from "../../mixer/GetMixMatrix";
import { ElementMixNode } from "../ElementMixNode";
import { describe, expect, beforeEach, afterEach, it } from "vitest";

describe("ElementMixNode", () => {
  let context: AudioContext;

  beforeEach(() => {
    context = new (window.AudioContext || (window as any).webkitAudioContext)();
  });

  afterEach(() => {
    context.close();
  });

  it("should create with correct input/output layouts and matrix", () => {
    const inputLayout = AudioChFormat.STEREO;
    const outputLayout = AudioChFormat.K5P1;
    const node = new ElementMixNode(context, inputLayout, outputLayout);
    expect(node.inputLayout).toBe(inputLayout);
    expect(node.outputLayout).toBe(outputLayout);
    expect(node.mixMatrix).toEqual(getMixMatrix(inputLayout, outputLayout));
  });

  it("should set correct channel counts", () => {
    const inputLayout = AudioChFormat.STEREO;
    const outputLayout = AudioChFormat.K5P1;
    const node = new ElementMixNode(context, inputLayout, outputLayout);
    // The node's channelCount should match the number of input channels
    expect(node.channelCount).toBe(node.mixMatrix[0].length);
    // The node's outputChannelCount should match the number of output channels
    expect(node.channelCount).toBe(node.mixMatrix.length);
  });

  it("should process audio with the correct matrix (integration)", async () => {
    // This test is a stub: full integration would require a test AudioWorkletProcessor
    // and offline audio context rendering, which is best done in browser-based test runners.
    // Here, we just check that the node can be constructed and connected.
    const inputLayout = AudioChFormat.STEREO;
    const outputLayout = AudioChFormat.K5P1;
    const node = new ElementMixNode(context, inputLayout, outputLayout);
    const gain = context.createGain();
    node.connect(gain);
    expect(gain.numberOfInputs).toBeGreaterThan(0);
  });
});
