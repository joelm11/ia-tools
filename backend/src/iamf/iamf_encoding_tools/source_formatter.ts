import { StorageService } from "src/storage/storage_fs";
import fs from "fs/promises";
import { WaveFile } from "wavefile";
import { spawn } from "child_process";
import path from "path";
import os from "os";

const FORMAT_EXE = `${process.cwd()}/src/iamf/iamf_encoding_tools/ffmpeg/ffmpeg_custom_backend_build/bin/ffmpeg`;

export interface FormatAudioParams {
  bitDepth: number;
  sampleRate: number;
}

export interface FormatInputParams {
  fileId: string;
  inputUrl: string;
  inputDuration: number;
  desc: FormatAudioParams;
  maxDuration: number;
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
    parsedInputs.map(async (pp) => {
      // Get the path to the input file.
      const { success, url } = await sourceStore.exists(pp.fileId);
      if (!success || !url) {
        throw `formatAudio: Input file '${pp.fileId}' not found.`;
      }

      const formatParams: FormatInputParams = {
        fileId: pp.fileId,
        inputUrl: url,
        inputDuration: pp.duration,
        desc: desc,
        maxDuration: maxDuration,
      };

      await formatInput(formatParams, sourceStore);
    })
  );
}

interface ParsedAudioParams {
  fileId: string;
  bitDepth: number;
  sampleRate: number;
  numSamples: number;
  duration: number;
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
  const samples = wf.getSamples(false, Uint8Array);
  const numSamples = (samples[0] as any).length;

  parsedParams = {
    fileId: sourceId,
    bitDepth: parseInt(wf.bitDepth),
    sampleRate: formatData.sampleRate,
    numSamples: numSamples,
    duration: numSamples / formatData.sampleRate,
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
  formatParams: FormatInputParams,
  storageService: StorageService
) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(
    tmpDir,
    `tmp_audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.wav`
  );
  const args = buildFormatArgs(
    formatParams.inputUrl,
    formatParams.inputDuration,
    formatParams.desc,
    formatParams.maxDuration,
    tmpFile
  );

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
      if (code === 0) {
        try {
          const buffer = await fs.readFile(tmpFile);
          await storageService.replace(formatParams.fileId, buffer);
          //   await fs.rm(tmpFile, { force: true });
          resolve({});
        } catch (err: any) {
          console.error("Error replacing file:", err);
          reject(err);
        }
      } else {
        console.log(logData);
        reject(new Error(`FFmpeg process failed with code ${code}`));
      }
    });

    formatProcess.on("error", async (err) => {
      console.log(logData);
      reject(err);
    });
  });
}

function buildFormatArgs(
  inputFilePath: string,
  inputFileDuration: number, // New parameter: actual duration of the input file in seconds
  desc: FormatAudioParams,
  duration: number, // Target duration in seconds
  outputFilePath: string
): string[] {
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
      audioCodec = "pcm_s32le";
      break;
    default:
      throw new Error("Unsupported bit depth. Please use 16, 24, or 32.");
  }

  const args: string[] = ["-i", inputFilePath, "-t", duration.toString()];

  // If the input file is shorter than the target duration, add padding for the encoder
  if (inputFileDuration < duration) {
    args.push(
      "-filter_complex",
      `[0:a]apad=whole_len=${duration * sampleRate}[aout]`
    );
    args.push("-map", "[aout]");
  }

  // Add standard audio encoding arguments
  args.push(
    "-ar",
    sampleRate.toString(),
    "-c:a",
    audioCodec,
    "-y", // Overwrite output file without asking
    outputFilePath
  );

  return args;
}
