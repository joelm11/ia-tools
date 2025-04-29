import type { AudioElementBase, AudioElement } from "./AudioElement";
import type { AudioChFormat } from "./AudioFormats";

export interface MixPresentationBase {
  name: string;
  description: string;
  id: string;
  playbackFormat: AudioChFormat;
  mixGain: number;
  audioElements: AudioElementBase[];
}

export interface MixPresentation extends MixPresentationBase {
  audioElements: AudioElement[];
}
