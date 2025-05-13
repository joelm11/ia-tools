import { StorageService } from "src/storage/storage_fs";
import { WaveFile } from "wavefile";
import fs from "fs";

interface WavFileDescriptor {
  bitDepth: number;
  sampleRate: number;
  numChannels: number;
  numSamples: number;
}

type ParsedFile = {
  file: WaveFile;
  desc: WavFileDescriptor;
};

interface FormatAudioParams {
  bitDepth: number;
  sampleRate: number;
}

// Take list of source IDs, the storage service, and the desired wav params.
export async function formatSourceAudio(
  sourceIds: string[],
  sourceStore: StorageService,
  desc: FormatAudioParams
) {
  return processInputs(sourceIds, sourceStore)
    .then((inFiles) => {
      return bitsizeSources(inFiles, desc.bitDepth);
    })
    .then((inFiles) => {
      return resampleSources(inFiles, desc.sampleRate);
    })
    .then((inFiles) => {
      return padSources(inFiles);
    })
    .then((inputFiles) => {
      for (let i = 0; i < sourceIds.length; ++i) {
        sourceStore.replace(sourceIds[i], inputFiles[i].file.toBuffer());
      }
    })
    .catch((error) => {
      throw error;
    });
}

async function processInputs(
  sourceIds: string[],
  sourceStore: StorageService
): Promise<ParsedFile[]> {
  let inputs: ParsedFile[] = [];
  for (const id of sourceIds) {
    const { success, url } = await sourceStore.exists(id);
    if (!success || !url) {
      throw `processInputs: Input file '${id}' not found.`;
    }
    const wav = new WaveFile(fs.readFileSync(url));
    // Ensure samples are loaded in the desired format for manipulation if needed later
    wav.toBitDepth(wav.bitDepth);

    inputs.push({
      file: wav,
      desc: {
        numSamples: (wav.getSamples() as any)[0].length, // getSamples returns channels as separate arrays
        bitDepth: Number(wav.bitDepth),
        sampleRate: (wav.fmt as any).sampleRate,
        numChannels: (wav.fmt as any).numChannels,
      },
    });
  }
  return inputs;
}

async function bitsizeSources(
  inputFiles: ParsedFile[],
  bitDepth: number
): Promise<ParsedFile[]> {
  for (const file of inputFiles) {
    if (file.desc.bitDepth !== bitDepth) {
      file.file.toBitDepth(bitDepth.toString());
      file.desc.bitDepth = Number(file.file.bitDepth); // Update descriptor
    }
  }
  return inputFiles;
}

async function resampleSources(
  inputFiles: ParsedFile[],
  sampleRate: number
): Promise<ParsedFile[]> {
  for (const file of inputFiles) {
    if (file.desc.sampleRate !== sampleRate) {
      file.file.toSampleRate(sampleRate);
    }
  }
  return inputFiles;
}

async function padSources(inputFiles: ParsedFile[]): Promise<ParsedFile[]> {
  let maxSamples: number = 0;
  for (const file of inputFiles) {
    maxSamples = Math.max(maxSamples, file.desc.numSamples);
  }

  for (const file of inputFiles) {
    const samplesToPad = maxSamples - file.desc.numSamples;
    if (samplesToPad > 0) {
      const bytesPerSample = file.desc.bitDepth / 8;
      const bytesToPad = samplesToPad * file.desc.numChannels * bytesPerSample;

      // Create a zero-filled buffer of the appropriate size
      const zeroPadding = new Uint8Array(bytesToPad);

      // Access the raw data chunk and append the zero padding
      const originalData = (file.file.data as any).samples;
      const paddedData = new Uint8Array(
        originalData.length + zeroPadding.length
      );
      paddedData.set(originalData, 0);
      paddedData.set(zeroPadding, originalData.length);

      // Update the WaveFile object's data chunk with the new padded data
      (file.file.data as any).samples = paddedData;
      (file.file.data as any).chunkSize = paddedData.length; // Update chunk size

      // Update the descriptor's sample count
      file.desc.numSamples = maxSamples;
    }
  }
  return inputFiles;
}
