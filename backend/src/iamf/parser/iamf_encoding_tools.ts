import { StorageService } from "src/storage/storage_fs";
import * as wav from "node-wav";
import { resample } from "wave-resampler";
import fs from "fs/promises";

interface WavFileDescriptor {
  sampleRate: number;
  numChannels: number;
  numSamples: number;
}

type ParsedFile = {
  file: { channelData: Float32Array[]; sampleRate: number };
  desc: WavFileDescriptor;
};

interface FormatAudioParams {
  bitDepth: number;
  sampleRate: number;
}

export async function formatSourceAudio(
  sourceIds: string[],
  sourceStore: StorageService,
  desc: FormatAudioParams
) {
  try {
    const inFiles = await processInputs(sourceIds, sourceStore);
    const resampledFiles = await resampleSources(inFiles, desc.sampleRate);
    const paddedFiles = await padSources(resampledFiles);

    for (let i = 0; i < sourceIds.length; ++i) {
      const buffer = wav.encode(paddedFiles[i].file.channelData, {
        sampleRate: desc.sampleRate,
        float: false,
        bitDepth: desc.bitDepth,
      });
      await sourceStore.replace(sourceIds[i], buffer);
    }
  } catch (error) {
    throw error;
  }
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
    const buffer = await fs.readFile(url);
    const { sampleRate, channelData } = wav.decode(buffer);

    inputs.push({
      file: { channelData: Array.from(channelData), sampleRate },
      desc: {
        numSamples: channelData[0].length,
        sampleRate: sampleRate,
        numChannels: channelData.length,
      },
    });
  }
  return inputs;
}

async function resampleSources(
  inputFiles: ParsedFile[],
  sampleRate: number
): Promise<ParsedFile[]> {
  for (const file of inputFiles) {
    const channelData = file.file.channelData;
    for (let ch = 0; ch < channelData.length; ++ch) {
      const newSampleCh = resample(
        channelData[ch],
        file.desc.sampleRate,
        sampleRate,
        {
          method: "sinc",
        }
      );
      channelData[ch] = new Float32Array(newSampleCh);
    }
    file.desc.numSamples = channelData[0].length;
  }
  return inputFiles;
}

async function padSources(inputFiles: ParsedFile[]): Promise<ParsedFile[]> {
  let maxSamples: number = 0;
  for (const file of inputFiles) {
    maxSamples = Math.max(maxSamples, file.desc.numSamples);
  }

  for (let file of inputFiles) {
    const samplesToPad = maxSamples - file.desc.numSamples;
    if (samplesToPad > 0) {
      file.file.channelData = file.file.channelData.map((channel) => {
        const padding = new Float32Array(samplesToPad);
        return Float32Array.from([...channel, ...padding]);
      });
      file.desc.numSamples = maxSamples;
    }
  }
  return inputFiles;
}
