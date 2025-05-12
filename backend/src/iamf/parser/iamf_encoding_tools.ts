import { StorageService } from "src/storage/storage_fs";
import { WaveFile } from "wavefile";
import fs from "fs";

interface WavFileDescriptor {
  numSamples?: number;
  bitDepth?: number;
  sampleRate?: number;
}

// Take list of source IDs, the storage service, and the desired wav params.
export async function formatSourceAudio(
  sourceIds: string[],
  sourceStore: StorageService,
  desc: WavFileDescriptor
) {
  for (const id of sourceIds) {
    const { success, url } = await sourceStore.exists(id);
    if (!success || !url) {
      throw `formatSourceAudio: Input file '${id}' not found.`;
    }

    // Only resample for now
    let newWav = new WaveFile(fs.readFileSync(url));
    if (desc.sampleRate && (newWav.fmt as any).sampleRate !== desc.sampleRate) {
      console.log("Resampling:", id);
      newWav.toSampleRate(desc.sampleRate, { method: "sinc" });
      sourceStore.replace(id, newWav.toBuffer());
    }
  }
}
