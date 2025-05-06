import { expect, describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { payloadToIAMF } from "../parser/iamf_proto";
import fs from "fs";
import path from "path";
import { buildIAMFFile } from "../parser/iamf_file";
import { AudioChFormat } from "src/@types/AudioFormats";
import { StorageService } from "src/storage/storage_fs";
import { getCoupledChannelCount } from "../parser/iamf_format_tools";

describe("Test create IAMF files from given payloads", async () => {
  const cwd = process.cwd();
  let storageService: StorageService;

  beforeAll(() => {
    // Provide the location of audio sources to the service
    storageService = new StorageService(
      path.join(process.cwd(), "src/iamf/test/"),
      "resources/audio_sources"
    );
  });

  afterEach(() => {
    // Clean up the IAMF file after each test
    const iamfFilePath = path.join(process.cwd(), "/boo.iamf");
    if (fs.existsSync(iamfFilePath)) {
      fs.unlinkSync(iamfFilePath);
    }
  });

  it("1AE1MP", async () => {
    // Read the payload for this test.
    const payloadPath = path.join(
      cwd,
      "src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8"));
    console.log(payload);
    const protofile = await payloadToIAMF(payload);
    // Await the IAMF file creation.
    await buildIAMFFile(
      path.join(process.cwd(), protofile),
      storageService.storageDir,
      cwd
    );
    // Check if the IAMF file is created.
    const iamfFilePath = path.join(cwd, "/boo.iamf");
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
      const protofile = await payloadToIAMF(JSON.parse(payload));
      await buildIAMFFile(
        path.join(process.cwd(), protofile),
        storageService.storageDir,
        cwd
      );
      // Check if the IAMF file is created.
      const iamfFilePath = process.cwd() + "/boo.iamf";
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
    const protofile = await payloadToIAMF(JSON.parse(payload));
    await buildIAMFFile(
      path.join(process.cwd(), protofile),
      storageService.storageDir,
      cwd
    );
    const iamfFilePath = process.cwd() + "/boo.iamf";
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });

  it("2AE2MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "2ae2mp.json"
    );
    let payload = fs.readFileSync(payloadPath, "utf-8");
    const protofile = await payloadToIAMF(JSON.parse(payload));
    await buildIAMFFile(
      path.join(process.cwd(), protofile),
      storageService.storageDir,
      cwd
    );
    const iamfFilePath = process.cwd() + "/boo.iamf";
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });

  it("4AE1MP", async () => {
    const payloadPath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "4ae1mp.json"
    );
    let payload = fs.readFileSync(payloadPath, "utf-8");
    const protofile = await payloadToIAMF(JSON.parse(payload));
    await buildIAMFFile(
      path.join(process.cwd(), protofile),
      storageService.storageDir,
      cwd
    );
    const iamfFilePath = process.cwd() + "/boo.iamf";
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });
});
