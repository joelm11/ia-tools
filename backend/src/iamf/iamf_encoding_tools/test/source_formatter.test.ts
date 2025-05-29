import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import fs from "fs/promises";
import { StorageService } from "src/storage/storage_fs";
import { formatAudio, FormatAudioParams } from "../source_formatter";
import { WaveFile } from "wavefile";

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
    wf.fromScratch(5, sampleRate, bitDepth, samples);

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

  it("should convert bit depth", async () => {
    const filename = "bit_depth_test.wav";
    const sampleRate = 44100;
    const initialBitDepth = 16;
    const targetBitDepth = 24;
    const duration = 1;

    const fileId = await createDummyWaveFile(
      filename,
      sampleRate,
      initialBitDepth.toString(),
      duration
    );
    const desc: FormatAudioParams = {
      bitDepth: targetBitDepth,
      sampleRate: sampleRate,
    };
    await formatAudio([fileId], storage, desc);

    const { url } = await storage.exists(fileId);
    const buffer = await fs.readFile(url!);
    const wf = new WaveFile(buffer);
    expect((wf.fmt as any).bitsPerSample).toBe(targetBitDepth);
  });

  it("should pad audio", async () => {
    const sampleRate = 44100;
    const bitDepth = 16;

    const fileId = await createDummyWaveFile(
      "padding_test.wav",
      sampleRate,
      bitDepth.toString(),
      1
    );
    const fileId2 = await createDummyWaveFile(
      "padding_test2.wav",
      sampleRate,
      bitDepth.toString(),
      5
    );
    const desc: FormatAudioParams = {
      bitDepth: bitDepth,
      sampleRate: sampleRate,
    };
    await formatAudio([fileId, fileId2], storage, desc);

    const { url } = await storage.exists(fileId);
    const buffer = await fs.readFile(url!);
    const wf = new WaveFile(buffer);
    const samples = wf.getSamples();
    const numSamples = (samples[0] as any).length;

    const url2 = (await storage.exists(fileId2)).url;
    const buffer2 = await fs.readFile(url2!);
    const wf2 = new WaveFile(buffer2);
    const samples2 = wf2.getSamples();
    const numSamples2 = (samples2[0] as any).length;
    expect(numSamples).toEqual(numSamples2);
  });
});
