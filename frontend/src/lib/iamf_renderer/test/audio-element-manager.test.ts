import { AudioElementManager } from "../audio-element-manager";
import { InputGainController } from "../input-gain-controller";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AudioContext, GainNode, and MediaElementSourceNode
class MockGainNode {
  gain = { value: 1 };
  connect = vi.fn();
}
class MockMediaElementSourceNode {
  connect = vi.fn();
}
class MockAudioContext {
  createGain() {
    return new MockGainNode();
  }
  createMediaElementSource() {
    return new MockMediaElementSourceNode();
  }
}

describe("AudioElementManager", () => {
  let context: AudioContext;
  let manager: AudioElementManager;

  beforeEach(() => {
    context = new MockAudioContext() as unknown as AudioContext;
    manager = new AudioElementManager(context);
  });

  it("registers and retrieves an InputGainController for HTMLMediaElement", () => {
    const mockMediaElement = {} as HTMLMediaElement;
    manager.registerAudioElement("uuid1", mockMediaElement);
    const ctrl = manager.getInputGainController("uuid1");
    expect(ctrl).toBeInstanceOf(InputGainController);
  });
});
