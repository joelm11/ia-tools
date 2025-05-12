import { StorageService } from "src/storage/storage_fs";
import { WaveFile } from "wavefile";
import fs from "fs";

interface WavFileDescriptor {
  numSamples?: number;
  bitDepth?: number;
  sampleRate?: number;
}

/** @brief As the IAMF Encoder requires input audio files to be formatted exactly the same ( sample rate)
 * we provide this utility function to set these features.
 */
export async function formatWav(
  inputId: string,
  audioStorageService: StorageService,
  desc: WavFileDescriptor
) {
  const { success, url } = await audioStorageService.exists(inputId);
  if (!success || !url) {
    throw `formatWav: Input file '${inputId}' not found.`;
  }

  // Only resample for now
  let newWav = new WaveFile(fs.readFileSync(url));
  if (desc.sampleRate && (newWav.fmt as any).sampleRate) {
    console.log("Resampling:", inputId);
    let newWav = new WaveFile(fs.readFileSync(url));
    newWav.toSampleRate(desc.sampleRate, { method: "sinc" });
    audioStorageService.replace(inputId, newWav.toBuffer());
  }
}
