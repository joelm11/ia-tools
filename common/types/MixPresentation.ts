import type { AudioElementBase, AudioElement } from "./AudioElement";
import type { AudioChFormat } from "./AudioFormats";

export interface MixPresentationBase {
  name: string;
  description: string;
  id: string;
  playbackFormat: AudioChFormat;
  audioElements: AudioElementBase[];
}

export interface MixPresentation extends MixPresentationBase {
  audioElements: AudioElement[];
}
