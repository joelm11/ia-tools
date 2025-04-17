import type { AudioElement } from "./AudioElement";
import type { AudioChFormat } from "./AudioFormats";

export interface MixPresentationAudioElement extends AudioElement {
  gain: number;
}

export interface MixPresentation {
  name: string;
  description: string;
  id: string;
  playbackFormat: AudioChFormat;
  audioElements: MixPresentationAudioElement[];
}
