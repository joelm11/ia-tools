import type { AudioElement } from "./AudioElement";

export interface MixPresentation {
  name: string;
  id: string;
  audioElements: AudioElement[];
}
