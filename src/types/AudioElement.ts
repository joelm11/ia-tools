import type { AudioChFormat } from "./AudioFormats";

export interface AudioElement {
  name: string;
  id: string;
  audioFile: File;
  audioChFormat: AudioChFormat;
}
