import { StorageService } from "src/storage/storage_fs";

export interface FormatAudioParams {
  bitDepth: number;
  sampleRate: number;
}

export async function formatAudio(
  sourceIds: string[],
  sourceStore: StorageService,
  desc: FormatAudioParams
) {}
