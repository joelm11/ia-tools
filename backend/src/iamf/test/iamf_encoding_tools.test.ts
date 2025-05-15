import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import * as wav from "node-wav";
import { StorageService } from "src/storage/storage_fs";
import { formatSourceAudio } from "../parser/iamf_encoding_tools";

describe("formatSourceAudio", () => {
  let storage: StorageService;

  beforeAll(async () => {
    storage = new StorageService(
      process.cwd(),
      "src/iamf/test/resources/test_audio_sources"
    );
  });

  afterAll(async () => {
    await fs.rm(storage.storageDir, { recursive: true, force: true });
  });

  it("Wav API test", async () => {
    const fileId = "file1.wav";
    const ichannelData = [new Float32Array([0, 1, 0, 0.6])];
    const buffer = wav.encode(ichannelData, {
      sampleRate: 16000,
      bitDepth: 16,
    });
    await storage.create(buffer, fileId);
    const exists = await storage.exists(fileId);

    expect(exists.success);

    const wavFile = await fs.readFile(exists.url!);
    const { sampleRate, channelData } = wav.decode(wavFile);

    expect(sampleRate).toEqual(16000);

    // Compare each value in the Float32Array
    for (let i = 0; i < ichannelData[0].length; ++i) {
      expect(channelData[0][i]).toBeCloseTo(ichannelData[0][i], 3);
    }
  });

  it("samplerate", async () => {
    const fileId = "file2.wav";
    const ichannelData = [new Float32Array([0, 1, 0, 0.6])];
    const buffer = wav.encode(ichannelData, {
      sampleRate: 24000,
      bitDepth: 16,
    });
    const ret = await storage.create(buffer, fileId);
    expect(ret.success === true);

    await formatSourceAudio([fileId], storage, {
      bitDepth: 24,
      sampleRate: 48000,
    });

    const existsPostMod = await storage.exists(fileId);

    const wavFile = await fs.readFile(existsPostMod.url!);
    const { sampleRate, channelData } = wav.decode(wavFile);

    expect(sampleRate).toEqual(48000);
    expect(channelData[0].length).toEqual(8);
  });

  it("pad", async () => {
    const fileId = "file3.wav";
    const fileId2 = "file4.wav";
    const ichannelData = [new Float32Array([0, 1, 0, 0.6])];
    const ichannelData2 = [new Float32Array([0, 1])];
    const buffer = wav.encode(ichannelData, {
      sampleRate: 44100,
      bitDepth: 16,
    });
    const buffer2 = wav.encode(ichannelData2, {
      sampleRate: 16000,
      bitDepth: 24,
    });
    let ret = await storage.create(buffer, fileId);
    expect(ret.success === true);
    ret = await storage.create(buffer2, fileId2);
    expect(ret.success === true);

    await formatSourceAudio([fileId, fileId2], storage, {
      bitDepth: 24,
      sampleRate: 48000,
    });

    let existsPostMod = await storage.exists(fileId);
    let wavFile = await fs.readFile(existsPostMod.url!);
    let { sampleRate, channelData } = wav.decode(wavFile);
    expect(sampleRate).toEqual(48000);
    const chLength = channelData[0].length;

    existsPostMod = await storage.exists(fileId2);
    wavFile = await fs.readFile(existsPostMod.url!);
    ({ sampleRate } = wav.decode(wavFile));
    expect(sampleRate).toEqual(48000);
    expect(channelData[0].length).toEqual(chLength);
  });
});
