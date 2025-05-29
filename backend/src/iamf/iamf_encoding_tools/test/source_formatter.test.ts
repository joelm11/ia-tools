import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import fs from "fs/promises";
import { StorageService } from "src/storage/storage_fs";
import { formatAudio, FormatAudioParams } from "../source_formatter";
import { WaveFile } from "wavefile";
import path from "path";

describe("formatSourceAudio", () => {
  let storage: StorageService;
  const testDir = "src/iamf/iamf_encoding_tools/test/test_audio_sources";

  beforeAll(async () => {
    storage = new StorageService(process.cwd(), testDir);
    await fs.mkdir(storage.storageDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(storage.storageDir, { recursive: true, force: true });
  });

  async function createDummyWaveFile(
    filename: string,
    sampleRate: number,
    bitDepth: string,
    duration: number
  ): Promise<string> {
    const numSamples = sampleRate * duration;
    const samples = new Array(numSamples).fill(0.5);
    const wf = new WaveFile();
    wf.fromScratch(1, sampleRate, bitDepth, samples);

    const buffer = wf.toBuffer();
    const fileId = filename; // Use filename as fileId for now
    await storage.create(buffer, fileId);
    return fileId;
  }

  it("should convert sample rate", async () => {
    const filename = "sample_rate_test.wav";
    const initialSampleRate = 44100;
    const targetSampleRate = 48000;
    const bitDepth = 16;
    const duration = 1;

    const fileId = await createDummyWaveFile(
      filename,
      initialSampleRate,
      bitDepth.toString(),
      duration
    );
    const desc: FormatAudioParams = {
      bitDepth: bitDepth,
      sampleRate: targetSampleRate,
    };
    await formatAudio([fileId], storage, desc);

    const { url } = await storage.exists(fileId);
    const buffer = await fs.readFile(url!);
    const wf = new WaveFile(buffer);
    expect((wf.fmt as any).sampleRate).toBe(targetSampleRate);
  });

  //   it("should convert bit depth", async () => {
  //     const filename = "bit_depth_test.wav";
  //     const sampleRate = 44100;
  //     const initialBitDepth = 16;
  //     const targetBitDepth = 24;
  //     const duration = 1;

  //     const fileId = await createDummyWaveFile(
  //       filename,
  //       sampleRate,
  //       initialBitDepth.toString(),
  //       duration
  //     );
  //     const desc: FormatAudioParams = {
  //       bitDepth: targetBitDepth,
  //       sampleRate: sampleRate,
  //     };
  //     await formatAudio([fileId], storage, desc);

  //     const { url } = await storage.exists(fileId);
  //     const buffer = await fs.readFile(url!);
  //     const wf = new WaveFile(buffer);
  //     expect((wf.fmt as any).bitsPerSample).toBe(targetBitDepth);
  //   });

  //   it("should pad audio", async () => {
  //     const filename = "padding_test.wav";
  //     const sampleRate = 44100;
  //     const bitDepth = 16;
  //     const initialDuration = 1;
  //     const targetDuration = 2;

  //     const fileId = await createDummyWaveFile(
  //       filename,
  //       sampleRate,
  //       bitDepth.toString(),
  //       initialDuration
  //     );
  //     const desc: FormatAudioParams = {
  //       bitDepth: bitDepth,
  //       sampleRate: sampleRate,
  //     };
  //     await formatAudio([fileId], storage, desc);

  //     const { url } = await storage.exists(fileId);
  //     const buffer = await fs.readFile(url!);
  //     const wf = new WaveFile(buffer);
  //     const samples = wf.getSamples();
  //     const numSamples = Array.isArray(samples[0])
  //       ? samples[0].length
  //       : samples.length;
  //     const actualDuration = numSamples / sampleRate;
  //     expect(actualDuration).toBeCloseTo(targetDuration, 1); // Allow a small tolerance
  //   });
});
