import type { AudioElement } from "./AudioElement";
import { v4 as uuidv4 } from "uuid";

export interface MixPresentationAudioElement extends AudioElement {
  gain: number;
}

export interface MixPresentation {
  name: string;
  description: string;
  id: string;
  audioElements: MixPresentationAudioElement[];
}
