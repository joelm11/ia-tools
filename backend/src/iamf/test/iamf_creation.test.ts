import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { iamfWorkerJob } from "../../workers/iamf_worker";
import fs from "fs";
import path from "path";
import { AudioChFormat } from "src/@types/AudioFormats";
import { StorageService } from "src/storage/storage_fs";
import { MixPresentationBase } from "src/@types/MixPresentation";

describe("Test create IAMF files from given payloads", async () => {
  const cwd = process.cwd();
  let audioSourceStorage: StorageService;
  let iamfStorage: StorageService;

  beforeAll(() => {
    // Provide the location of audio sources to the service
    audioSourceStorage = new StorageService(
      path.join(process.cwd(), "src/iamf/test"),
      "resources/audio_sources"
    );
    // Configure the storage service for output of IAMF files
    iamfStorage = new StorageService(
      path.join(process.cwd(), "src/iamf/test"),
      "iamf_creation_test_output"
    );
  });

  afterEach(async () => {
    const ret = await iamfStorage.delete("boo.iamf");
    expect(ret.success).toBe(true);
  });

  afterAll(async () => {
    // Only remove the folder if it's empty (no failed test logs to look at)
    if (fs.readdirSync(iamfStorage.storageDir).length === 0) {
      console.log("IAMF Creation Test: Removing encoder logs");
      // fs.rmdirSync(iamfStorage.storageDir);
    }
  });

  it("1AE1MP", async () => {
    const payloadPath = path.join(
      cwd,
      "src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8"));
    const result = await iamfWorkerJob(
      "1AE1MPTest",
      [payload],
      audioSourceStorage
    );

    expect(fs.existsSync(result.iamfUrl)).toBe(true);
  });

  it("1AE1MP: All audio element formats", async () => {
    for (const layout of Object.keys(AudioChFormat)) {
      const payloadPath = path.join(
        process.cwd(),
        "src/iamf/test/resources",
        "1ae1mp.json"
      );
      let payload = fs.readFileSync(payloadPath, "utf-8");
      payload = payload.replace(
        /"audioElementFormat": ".*?"/,
        `"audioElementFormat": "${layout}"`
      );
      const result = await iamfWorkerJob(
        "1AE1MPFormats",
        [JSON.parse(payload)],
        audioSourceStorage
      );

      expect(fs.existsSync(result.iamfUrl)).toBe(true);
    }
  });

  it("1AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "1ae2mp.json"
    );
    const payload: MixPresentationBase[] = JSON.parse(
      fs.readFileSync(payloadPath, "utf-8")
    );
    console.log("Payload", payload);
    const result = await iamfWorkerJob("1AE2MP", payload, audioSourceStorage);

    expect(fs.existsSync(result.iamfUrl)).toBe(true);
  });

  // it("2AE2MP", async () => {
  //   const payloadPath = path.join(
  //     process.cwd(),
  //     "src/iamf/test/resources",
  //     "2ae2mp.json"
  //   );
  //   const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8"));
  //   const job = { id: "2AE2MP", data: [payload] };
  //   const result = await iamfWorkerJob(job, audioSourceStorage);

  //   expect(fs.existsSync(result.iamfUrl)).toBe(true);
  // });

  // it("4AE1MP", async () => {
  //   const payloadPath = path.join(
  //     process.cwd(),
  //     "src/iamf/test/resources",
  //     "4ae1mp.json"
  //   );
  //   const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8"));
  //   const job = { id: "4AE1MP", data: [payload] };
  //   const result = await iamfWorkerJob(job, audioSourceStorage);

  //   expect(fs.existsSync(result.iamfUrl)).toBe(true);
  // });
});
