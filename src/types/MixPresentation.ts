import type { AudioElement } from "./AudioElement";
import type { UUID } from "crypto";

export interface MixPresentation {
  name: string;
  id: UUID;
  audioElements: AudioElement[];
}
