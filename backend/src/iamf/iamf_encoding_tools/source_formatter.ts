import { StorageService } from "src/storage/storage_fs";
import fs from "fs/promises";
import { WaveFile } from "wavefile";
import { spawn } from "child_process";

const FORMAT_EXE = `${process.cwd()}/src/iamf/iamf_encoding_tools/ffmpeg/ffmpeg_custom_backend_build/bin/ffmpeg`;

export interface FormatAudioParams {
  bitDepth: number;
  sampleRate: number;
}

export async function formatAudio(
  sourceIds: string[],
  sourceStore: StorageService,
  desc: FormatAudioParams
) {
  const parsedInputs = await Promise.all(
    sourceIds.map((sourceId) => parseInput(sourceId, sourceStore))
  );
  const maxDuration = getMaxDuration(parsedInputs);
  await Promise.all(
    sourceIds.map(async (sourceId) => {
      // Get the path to the input file.
      const { success, url } = await sourceStore.exists(sourceId);
      if (!success || !url) {
        throw `formatAudio: Input file '${sourceId}' not found.`;
      }
      formatInput(url, desc, maxDuration);
    })
  );
}

interface ParsedAudioParams {
  fileId: string;
  bitDepth: number;
  sampleRate: number;
  numSamples: number;
}

async function parseInput(
  sourceId: string,
  sourceStore: StorageService
): Promise<ParsedAudioParams> {
  let parsedParams: ParsedAudioParams;

  const { success, url } = await sourceStore.exists(sourceId);
  if (!success || !url) {
    throw `processInputs: Input file '${sourceId}' not found.`;
  }
  const buffer = await fs.readFile(url);
  const wf = new WaveFile(buffer);

  const formatData = wf.fmt as any;
  const samples = wf.getSamples();
  const numSamples = Array.isArray(samples[0])
    ? samples[0].length
    : samples.length;

  parsedParams = {
    fileId: sourceId,
    bitDepth: parseInt(wf.bitDepth),
    sampleRate: formatData.sampleRate,
    numSamples: numSamples,
  };
  return parsedParams;
}

// Find the longest file length in seconds
function getMaxDuration(fileParams: ParsedAudioParams[]): number {
  let maxLen = 0;
  for (const param of fileParams) {
    const len = param.numSamples / param.sampleRate;
    maxLen = Math.max(maxLen, len);
  }
  return maxLen;
}

// Format and replace input files according to desired input desc
async function formatInput(
  inputUrl: string,
  desc: FormatAudioParams,
  duration: number
) {
  const args = [buildFormatArgs(inputUrl, desc, duration)];

  console.log(args); // debug

  return new Promise((resolve, reject) => {
    const formatProcess = spawn(FORMAT_EXE, args);

    let logData = "";
    formatProcess.stdout.on("data", (data) => {
      logData += `Stdout: ${data.toString()}\n`;
    });
    formatProcess.stderr.on("data", (data) => {
      logData += `Stderr: ${data.toString()}\n`;
    });

    formatProcess.on("close", async (code) => {
      console.log(logData); // Debug
      resolve({});
    });

    formatProcess.on("error", async (err) => {
      console.log(logData);
      reject(err);
    });
  });
}

function buildFormatArgs(
  inputFilePath: string,
  desc: FormatAudioParams,
  duration: number
) {
  const { bitDepth, sampleRate } = desc;

  // Determine output format based on bit depth
  let audioCodec: string;
  switch (bitDepth) {
    case 16:
      audioCodec = "pcm_s16le";
      break;
    case 24:
      audioCodec = "pcm_s24le";
      break;
    case 32:
      audioCodec = "pcm_f32le";
      break;
    default:
      throw new Error("Unsupported bit depth. Please use 16, 24, or 32.");
  }

  const input = `-i "${inputFilePath}"`;
  const dur = `-t ${duration}`;
  const sr = `-ar ${sampleRate}`;
  const codec = `-c:a ${audioCodec}`;
  const output = `-y "${inputFilePath}"`;
  return `${input} ${dur} ${sr} ${codec} ${output}`;
}
