import InputGainController from "../input-gain-controller";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

describe("InputGainController", () => {
  let mockGainNode: GainNode;
  let MockAudioContext: { new (): AudioContext };
  let context: AudioContext;

  beforeEach(() => {
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
      },
    } as unknown as GainNode;

    MockAudioContext = vi.fn(() => ({
      createGain: vi.fn(() => mockGainNode),
      destination: { connect: vi.fn() },
      close: vi.fn(),
    })) as unknown as { new (): AudioContext };

    vi.stubGlobal("AudioContext", MockAudioContext);
    context = new (MockAudioContext as any)(); // Instantiate using the mocked constructor
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a GainNode from getGainNode", () => {
    const ctrl = new InputGainController(context);
    expect(ctrl.getGainNode()).toBe(mockGainNode); // Check if it returns our mock
  });

  it("sets the gain value via setGain", () => {
    const ctrl = new InputGainController(context);
    ctrl.setGain(0.42);
    expect(mockGainNode.gain.value).toBeCloseTo(0.42);
  });
});
