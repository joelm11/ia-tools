import type { MixPresentation } from "src/@types/MixPresentation";
import type { MixerInterface } from "./MixerInterface";

export class Mixer implements MixerInterface {
  private static instance: PresentationMixer | null = null;
  private audioContext: AudioContext = new AudioContext();
  private elemGainNodes: Map<string, GainNode> = new Map();
  private mediaElementSources: Map<string, MediaElementAudioSourceNode> =
    new Map();
  private mixGainNode: GainNode = null as any;
  private activeMixPres: string = "";

  private constructor() {}

  getInstance(): MixerInterface {
    if (Mixer.instance === null) {
      Mixer.instance = new Mixer();
    }
    return Mixer.instance;
  }

  playpause(): void {}

  setActive(mixPresentation: MixPresentation): void {}

  setGain(gain: number, elementID?: string): void {
    this.mixGainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    if (elementID && this.elemGainNodes.has(elementID)) {
      this.elemGainNodes
        .get(elementID)
        ?.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }
  }
}
