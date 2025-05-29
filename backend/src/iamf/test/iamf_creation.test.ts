import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { iamfWorkerJob } from "../../workers/iamf_worker";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { AudioChFormat } from "src/@types/AudioFormats";
import { StorageService } from "src/storage/storage_fs";
import { MixPresentationBase } from "src/@types/MixPresentation";

async function copyDirectoryRecursive(
  src: string,
  dest: string
): Promise<void> {
  // Read the source directory entries
  const entries = await fs.readdir(src, { withFileTypes: true });

  // Ensure the destination directory exists
  await fs.mkdir(dest, { recursive: true });

  // Iterate over entries and copy files or recurse into subdirectories
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recursively call the copy function
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      // If it's a file, copy it
      await fs.copyFile(srcPath, destPath);
    }
  }
}

describe("Test create IAMF files from given payloads", async () => {
  let tempAudioDirectory: string;
  let audioSourceStorage: StorageService;
  let result: { iamfUrl: string };

  beforeAll(async () => {
    // Copy source audio files to a temporary directory as we modify source files
    const audioDirectory = path.join(
      process.cwd(),
      "src/iamf/test",
      "resources/audio_sources"
    );
    tempAudioDirectory = path.join(
      process.cwd(),
      "src/iamf/test/resources/test_audio_sources"
    );
    fsSync.mkdirSync(tempAudioDirectory);
    await copyDirectoryRecursive(audioDirectory, tempAudioDirectory);
    // Provide the location of audio sources to the service
    audioSourceStorage = new StorageService(
      path.join(process.cwd(), "src/iamf/test"),
      "resources/test_audio_sources"
    );
  });

  afterEach(async () => {
    // Remove the file at result.iamfUrl after each test
    if (result && result.iamfUrl) {
      await fs.rm(result.iamfUrl, { force: true });
    }
  });

  afterAll(async () => {
    await fs.rm(tempAudioDirectory, { recursive: true, force: true });
  });

  it("1AE1MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = JSON.parse(fsSync.readFileSync(payloadPath, "utf-8"));
    result = await iamfWorkerJob("1AE1MPTest", [payload], audioSourceStorage);

    expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
  });

  it("1AE1MP: All audio element formats", async () => {
    for (const layout of Object.keys(AudioChFormat)) {
      const payloadPath = path.join(
        process.cwd(),
        "src/iamf/test/resources",
        "1ae1mp.json"
      );
      let payload = fsSync.readFileSync(payloadPath, "utf-8");
      payload = payload.replace(
        /"audioElementFormat": ".*?"/,
        `"audioElementFormat": "${layout}"`
      );
      result = await iamfWorkerJob(
        "1AE1MPFormats",
        [JSON.parse(payload)],
        audioSourceStorage
      );

      expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
    }
  });

  it("1AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "1ae2mp.json"
    );
    const payload: MixPresentationBase[] = JSON.parse(
      fsSync.readFileSync(payloadPath, "utf-8")
    );
    const result = await iamfWorkerJob("1AE2MP", payload, audioSourceStorage);

    expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
  });

  it("2AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "2ae2mp.json"
    );
    const payload = JSON.parse(fsSync.readFileSync(payloadPath, "utf-8"));
    result = await iamfWorkerJob("2AE2MP", payload, audioSourceStorage);

    expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
  });

  it("4AE1MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "4ae1mp.json"
    );
    const payload = JSON.parse(fsSync.readFileSync(payloadPath, "utf-8"));
    result = await iamfWorkerJob("4AE1MP", [payload], audioSourceStorage);

    expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
  });

  it("1AE1MP: All playback layouts", async () => {
    for (const layout of Object.values(AudioChFormat)) {
      if (layout === AudioChFormat.NONE) continue;
      const payloadPath = path.join(
        process.cwd(),
        "src/iamf/test/resources",
        "1ae1mp.json"
      );
      let payload = fsSync.readFileSync(payloadPath, "utf-8");
      payload = payload.replace(
        /"playbackFormat": ".*?"/,
        `"playbackFormat": "${layout}"`
      );
      result = await iamfWorkerJob(
        "1AE1MPFormats",
        [JSON.parse(payload)],
        audioSourceStorage
      );

      expect(fsSync.existsSync(result.iamfUrl)).toBe(true);
    }
  });
});
