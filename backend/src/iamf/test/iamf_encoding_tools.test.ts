import { expect, describe, it, beforeAll, afterAll } from "vitest";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { StorageService } from "src/storage/storage_fs";
import { formatSourceAudio } from "../parser/iamf_encoding_tools";
import { WaveFile } from "wavefile";

let storageService: StorageService;
let tempAudioDirectory: string;

beforeAll(async () => {
  const audioDirectory = path.join(
    process.cwd(),
    "src/iamf/test",
    "resources/audio_sources"
  );
  tempAudioDirectory = path.join(
    process.cwd(),
    "src/iamf/test/resources/test_audio_sources"
  );
  fsSync.mkdirSync(tempAudioDirectory, { recursive: true });

  // Copy source audio files to a temporary directory
  const entries = await fs.readdir(audioDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(audioDirectory, entry.name);
    const destPath = path.join(tempAudioDirectory, entry.name);
    if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }

  storageService = new StorageService(
    path.join(process.cwd(), "src/iamf/test"),
    "resources/test_audio_sources"
  );
});

afterAll(async () => {
  await fs.rm(tempAudioDirectory, { recursive: true, force: true });
});

describe("formatSourceAudio", () => {
  //   it("should convert all input files to the specified bit depth", async () => {
  //     const inputFile = new WaveFile();
  //     inputFile.fromScratch(1, 44100, "16", [0, 1, 2, 3]);
  //     const filePath = path.join(tempAudioDirectory, "file1.wav");
  //     await storageService.create(Buffer.from(inputFile.toBuffer()), "file1.wav");

  //     await formatSourceAudio(["file1.wav"], storageService, {
  //       bitDepth: 24,
  //       sampleRate: 44100,
  //     });

  //     const { url } = await storageService.exists("file1.wav");
  //     const processedFile = new WaveFile(await fs.readFile(url!));
  //     expect(processedFile.bitDepth).toBe("24");
  //   });

  //   it("should resample all input files to the specified sample rate", async () => {
  //     const inputFile = new WaveFile();
  //     inputFile.fromScratch(1, 22050, "16", [0, 1, 2, 3]);
  //     await storageService.create(Buffer.from(inputFile.toBuffer()), "file1.wav");

  //     await formatSourceAudio(["file1.wav"], storageService, {
  //       bitDepth: 16,
  //       sampleRate: 44100,
  //     });

  //     const { url } = await storageService.exists("file1.wav");
  //     const processedFile = new WaveFile(await fs.readFile(url!));
  //     expect((processedFile.fmt as any).sampleRate).toBe(44100);
  //   });

  it("should pad all input files to match the longest file", async () => {
    const inputFile1 = new WaveFile();
    inputFile1.fromScratch(1, 44100, "16", [0, 1, 2, 3]);
    const inputFile2 = new WaveFile();
    inputFile2.fromScratch(1, 44100, "16", [0, 1]);

    await storageService.create(
      Buffer.from(inputFile1.toBuffer()),
      "file1.wav"
    );
    await storageService.create(
      Buffer.from(inputFile2.toBuffer()),
      "file2.wav"
    );

    await formatSourceAudio(["file1.wav", "file2.wav"], storageService, {
      bitDepth: 16,
      sampleRate: 44100,
    });

    const { url: url1 } = await storageService.exists("file1.wav");
    const { url: url2 } = await storageService.exists("file2.wav");

    const processedFile1 = new WaveFile(await fs.readFile(url1!));
    const processedFile2 = new WaveFile(await fs.readFile(url2!));

    const samples1 = processedFile1.getSamples() as Float64Array;
    const samples2 = processedFile2.getSamples() as Float64Array;

    expect(samples2.length).toBe(samples1.length);
  });

  //   it("should update the storage service with processed files", async () => {
  //     const inputFile = new WaveFile();
  //     inputFile.fromScratch(1, 44100, "16", [0, 1, 2, 3]);
  //     await storageService.create(Buffer.from(inputFile.toBuffer()), "file1.wav");

  //     await formatSourceAudio(["file1.wav"], storageService, {
  //       bitDepth: 16,
  //       sampleRate: 44100,
  //     });

  //     const { url } = await storageService.exists("file1.wav");
  //     const processedFile = new WaveFile(await fs.readFile(url!));
  //     expect(processedFile.bitDepth).toBe("16");
  //   });
});
