import { vi } from "vitest";

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

class FakeAudioContext {
  public state = "running";
  public destination = {};
  public close = vi.fn();
  public createGain = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
  public createMediaElementSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  public audioWorklet = { addModule: vi.fn() };
}
(globalThis as any).AudioContext = FakeAudioContext;
(globalThis as any).webkitAudioContext = FakeAudioContext;
