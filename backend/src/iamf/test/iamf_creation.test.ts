import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { payloadToIAMF } from "../parser/iamf_proto";
import fs from "fs";
import path from "path";
import { buildIAMFFile } from "../parser/iamf_file";
import { AudioChFormat } from "src/@types/AudioFormats";
import { StorageService } from "src/storage/storage_fs";

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
    fs.rmdirSync(iamfStorage.storageDir);
  });

  it("1AE1MP", async () => {
    // Read the payload for this test.
    const payloadPath = path.join(
      cwd,
      "src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8"));
    const protoOpResult = await payloadToIAMF(payload, iamfStorage);
    // Await the IAMF file creation.
    await buildIAMFFile(
      protoOpResult.protoUrl,
      audioSourceStorage.storageDir,
      iamfStorage.storageDir
    );
    // Check if the IAMF file is created.
    const iamfFilePath = path.join(iamfStorage.storageDir, "/boo.iamf");
    expect(fs.existsSync(iamfFilePath)).toBe(true);
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
      const iamfProtoRes = await payloadToIAMF(
        JSON.parse(payload),
        iamfStorage
      );
      await buildIAMFFile(
        iamfProtoRes.protoUrl,
        audioSourceStorage.storageDir,
        iamfStorage.storageDir
      );
      // Check if the IAMF file is created.
      const iamfFilePath = path.join(iamfStorage.storageDir, "/boo.iamf");
      expect(fs.existsSync(iamfFilePath)).toBe(true);
    }
  });

  it("1AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "1ae2mp.json"
    );
    let payload = fs.readFileSync(payloadPath, "utf-8");
    const iamfProtoRes = await payloadToIAMF(JSON.parse(payload), iamfStorage);
    await buildIAMFFile(
      iamfProtoRes.protoUrl,
      audioSourceStorage.storageDir,
      iamfStorage.storageDir
    );
    const iamfFilePath = path.join(iamfStorage.storageDir, "/boo.iamf");
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });

  it("2AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "2ae2mp.json"
    );
    let payload = fs.readFileSync(payloadPath, "utf-8");
    const iamfProtoRes = await payloadToIAMF(JSON.parse(payload), iamfStorage);
    await buildIAMFFile(
      iamfProtoRes.protoUrl,
      audioSourceStorage.storageDir,
      iamfStorage.storageDir
    );
    const iamfFilePath = path.join(iamfStorage.storageDir, "/boo.iamf");
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });

  it("4AE1MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "4ae1mp.json"
    );
    let payload = fs.readFileSync(payloadPath, "utf-8");
    const iamfProtoRes = await payloadToIAMF(JSON.parse(payload), iamfStorage);
    await buildIAMFFile(
      iamfProtoRes.protoUrl,
      audioSourceStorage.storageDir,
      iamfStorage.storageDir
    );
    const iamfFilePath = path.join(iamfStorage.storageDir, "/boo.iamf");
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });
});
