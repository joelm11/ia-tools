import { MasterGainController } from "../master-gain-controller";
import { describe, it, expect, beforeEach, vi } from "vitest";

class MockGainNode {
  gain = { value: 1 };
  connect = vi.fn();
}
class MockAudioContext {
  createGain() {
    return new MockGainNode();
  }
}

describe("MasterGainController", () => {
  let context: AudioContext;
  let master: MasterGainController;

  beforeEach(() => {
    context = new MockAudioContext() as unknown as AudioContext;
    master = new MasterGainController(context);
  });

  it("returns a GainNode from getMasterGainNode", () => {
    expect(master.getMasterGainNode()).toBeInstanceOf(MockGainNode);
  });

  it("sets the gain value via setMasterGain", () => {
    master.setMasterGain(0.5);
    expect(master.getMasterGainNode().gain.value).toBe(0.5);
  });
});
