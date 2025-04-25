import type { AudioChFormat } from "./AudioFormats";

export interface AudioElementBase {
  name: string;
  id: string;
  audioChFormat: AudioChFormat;
  gain: number;
}

export interface AudioElement extends AudioElementBase {
  audioFile: File;
}
