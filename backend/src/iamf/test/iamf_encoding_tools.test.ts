import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import fs from "fs/promises";
import { StorageService } from "src/storage/storage_fs";
import { formatAudio } from "../iamf_encoding_tools/source_formatter";
import { WaveFile } from "wavefile";
import path from "path";

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
    const wav = new WaveFile();
    wav.fromScratch(1, 16000, "32f", ichannelData[0]);
    const buffer = wav.toBuffer();
    await storage.create(buffer, fileId);
    const exists = await storage.exists(fileId);

    expect(exists.success).toBe(true);

    const wavFile = await fs.readFile(exists.url!);
    const decodedWav = new WaveFile(wavFile);

    expect((decodedWav.fmt as any).sampleRate).toEqual(16000);

    const channelData = [decodedWav.getSamples()];

    // Compare each value in the Float32Array
    for (let i = 0; i < ichannelData[0].length; ++i) {
      expect(channelData[0][i]).toBeCloseTo(ichannelData[0][i], 3);
    }
  });

  it("Wav API test multi-channel input", async () => {
    const fileId = "multi_channel.wav";
    const ichannelData = [
      new Float32Array([0.5, 0.4]),
      new Float32Array([0.5, 0.4]),
      new Float32Array([0.5, 0.4]),
      new Float32Array([0.5, 0.4]),
      new Float32Array([0.5, 0.4]),
      new Float32Array([0.5, 0.4]),
    ];
    const wav = new WaveFile();
    wav.fromScratch(6, 48000, "32f", ichannelData.flat());
    const buffer = wav.toBuffer();
    const ret = await storage.create(buffer, fileId);
    expect(ret.success).toBe(true);

    const existsPostMod = await storage.exists(fileId);
    const wavFile = await fs.readFile(existsPostMod.url!);
    const decodedWav = new WaveFile(wavFile);

    expect((decodedWav.fmt as any).sampleRate).toEqual(48000);
    expect((decodedWav.fmt as any).numChannels).toEqual(6); // Ensure 6 channels are preserved

    const channelData = decodedWav.getSamples();

    for (let i = 0; i < ichannelData.length; ++i) {
      for (let j = 0; j < ichannelData[i].length; ++j) {
        expect(channelData[i][j]).toBeCloseTo(ichannelData[i][j], 3);
      }
    }
  });

  // it("samplerate", async () => {
  //   const fileId = "file2.wav";
  //   const ichannelData = [new Float32Array([0, 1, 0, 0.6])];
  //   const wav = new WaveFile();
  //   wav.fromScratch(1, 24000, "32f", ichannelData[0]);
  //   const buffer = wav.toBuffer();
  //   const ret = await storage.create(buffer, fileId);
  //   expect(ret.success).toBe(true);

  //   await formatAudio([fileId], storage, {
  //     bitDepth: 24,
  //     sampleRate: 48000,
  //   });

  //   const existsPostMod = await storage.exists(fileId);
  //   const wavFile = await fs.readFile(existsPostMod.url!);
  //   const decodedWav = new WaveFile(wavFile);

  //   expect((decodedWav.fmt as any).sampleRate).toEqual(48000);
  //   const channelData = decodedWav.getSamples();
  //   expect(channelData[0].length).toBeGreaterThanOrEqual(
  //     ichannelData[0].length
  //   );
  // });

  // it("pad", async () => {
  //   const fileId = "file3.wav";
  //   const fileId2 = "file4.wav";
  //   const ichannelData = [new Float32Array([0, 1, 0, 0.6])];
  //   const ichannelData2 = [new Float32Array([0, 1])];

  //   const wav1 = new WaveFile();
  //   wav1.fromScratch(1, 44100, "16", ichannelData[0]);
  //   const buffer = wav1.toBuffer();

  //   const wav2 = new WaveFile();
  //   wav2.fromScratch(1, 16000, "16", ichannelData2[0]);
  //   const buffer2 = wav2.toBuffer();

  //   let ret = await storage.create(buffer, fileId);
  //   expect(ret.success).toBe(true);
  //   ret = await storage.create(buffer2, fileId2);
  //   expect(ret.success).toBe(true);

  //   await formatAudio([fileId, fileId2], storage, {
  //     bitDepth: 24,
  //     sampleRate: 48000,
  //   });

  //   let existsPostMod = await storage.exists(fileId);
  //   let wavFile = await fs.readFile(existsPostMod.url!);
  //   let decodedWav = new WaveFile(wavFile);

  //   expect((decodedWav.fmt as any).sampleRate).toEqual(48000);
  //   const channelData = decodedWav.getSamples();
  //   const chLength = channelData[0].length;

  //   existsPostMod = await storage.exists(fileId2);
  //   wavFile = await fs.readFile(existsPostMod.url!);
  //   decodedWav = new WaveFile(wavFile);

  //   expect((decodedWav.fmt as any).sampleRate).toEqual(48000);
  //   expect(decodedWav.getSamples()[0].length).toEqual(chLength);
  // });

  // it("7.1 input file", async () => {
  //   const fileId = "7dot1.wav";
  //   const sourceFilePath = path.join(
  //     process.cwd(),
  //     "src/iamf/test/resources/audio_sources/Nums_7dot1_24_48000.wav"
  //   );
  //   const buffer = await fs.readFile(sourceFilePath);
  //   let wav = new WaveFile(buffer);
  //   wav.toSampleRate(96000);
  //   const newBuffer = wav.toBuffer();

  //   let ret = await storage.create(newBuffer, fileId);
  //   expect(ret.success).toBe(true);

  //   await formatAudio([fileId], storage, {
  //     bitDepth: 24,
  //     sampleRate: 96000,
  //   });

  //   let existsPostMod = await storage.exists(fileId);
  //   let wavFile = await fs.readFile(existsPostMod.url!);
  //   let decodedWav = new WaveFile(wavFile);

  //   expect((decodedWav.fmt as any).sampleRate).toEqual(96000);
  //   expect((decodedWav.fmt as any).numChannels).toEqual(8);
  // }, 0);
});
