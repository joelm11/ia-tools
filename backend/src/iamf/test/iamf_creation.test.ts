import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { payloadToIAMF } from "../parser/iamf_proto";
import fs from "fs";
import path from "path";
import { buildIAMFFile } from "../parser/iamf_file";
import { AudioChFormat } from "src/@types/AudioFormats";
import { StorageService } from "src/storage/storage_fs";

describe("Test create IAMF files from given payloads", async () => {
  let storageService: StorageService;

  beforeAll(() => {
    storageService = new StorageService(
      path.join(process.cwd(), "src/iamf/test/"),
      "resources"
    );
  });

  it("1AE1MP", async () => {
    // Read the payload for this test.
    const cwd = process.cwd();
    const payloadPath = path.join(
      cwd,
      "src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = fs.readFileSync(payloadPath, "utf-8");
    const protofile = await payloadToIAMF(JSON.parse(payload));
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

  //   it("All audio element formats", async () => {
  //     for (const layout of Object.keys(AudioChFormat)) {
  //       const payloadPath = path.join(
  //         process.cwd(),
  //         "src/iamf/test/resources",
  //         "1ae1mp.json"
  //       );
  //       let payload = fs.readFileSync(payloadPath, "utf-8");
  //       payload = payload.replace(
  //         /"audioElementFormat": ".*?"/,
  //         `"audioElementFormat": "${layout}"`
  //       );
  //       const protofile = await payloadToIAMF(JSON.parse(payload));
  //       await buildIAMFFile(protofile);
  //       // Check if the IAMF file is created.
  //       const iamfFilePath = process.cwd() + "/boo.iamf";
  //       expect(fs.existsSync(iamfFilePath)).toBe(true);
  //       // If not, throw an error.
  //       if (!fs.existsSync(iamfFilePath)) {
  //         throw new Error(`IAMF file not created for layout ${layout}`);
  //       } else {
  //         console.log(`IAMF file created for layout ${layout}`);
  //         // Delete the IAMF file.
  //         fs.unlinkSync(iamfFilePath);
  //       }
  //     }
  //   });

  //   it("1AE2MP", async () => {
  //     const payloadPath = path.join(
  //       process.cwd(),
  //       "src/iamf/test/resources",
  //       "1ae2mp.json"
  //     );
  //     let payload = fs.readFileSync(payloadPath, "utf-8");
  //     const protofile = await payloadToIAMF(JSON.parse(payload));
  //     await buildIAMFFile(protofile);
  //     // Check if the IAMF file is created.
  //     const iamfFilePath = process.cwd() + "/boo.iamf";
  //     expect(fs.existsSync(iamfFilePath)).toBe(true);
  //     // If not, throw an error.
  //     if (!fs.existsSync(iamfFilePath)) {
  //       throw new Error(`IAMF file not created for 1AE2MP`);
  //     } else {
  //       console.log(`IAMF file created for 1AE2MP`);
  //       // Delete the IAMF file.
  //       fs.unlinkSync(iamfFilePath);
  //     }
  //   });

  //   it("2AE2MP", async () => {
  //     const payloadPath = path.join(
  //       process.cwd(),
  //       "src/iamf/test/resources",
  //       "2ae2mp.json"
  //     );
  //     let payload = fs.readFileSync(payloadPath, "utf-8");
  //     const protofile = await payloadToIAMF(JSON.parse(payload));
  //     await buildIAMFFile(protofile);
  //     // Check if the IAMF file is created.
  //     const iamfFilePath = process.cwd() + "/boo.iamf";
  //     expect(fs.existsSync(iamfFilePath)).toBe(true);
  //     // If not, throw an error.
  //     if (!fs.existsSync(iamfFilePath)) {
  //       throw new Error(`IAMF file not created for 2AE2MP`);
  //     } else {
  //       console.log(`IAMF file created for 2AE2MP`);
  //       // Delete the IAMF file.
  //       fs.unlinkSync(iamfFilePath);
  //     }
  //   });

  //   it("4AE1MP", async () => {
  //     const payloadPath = path.join(
  //       process.cwd(),
  //       "src/iamf/test/resources",
  //       "4ae1mp.json"
  //     );
  //     let payload = fs.readFileSync(payloadPath, "utf-8");
  //     const protofile = await payloadToIAMF(JSON.parse(payload));
  //     await buildIAMFFile(protofile);
  //     // Check if the IAMF file is created.
  //     const iamfFilePath = process.cwd() + "/boo.iamf";
  //     expect(fs.existsSync(iamfFilePath)).toBe(true);
  //     // If not, throw an error.
  //     if (!fs.existsSync(iamfFilePath)) {
  //       throw new Error(`IAMF file not created for 4AE1MP`);
  //     } else {
  //       console.log(`IAMF file created for 4AE1MP`);
  //       // Delete the IAMF file.
  //       fs.unlinkSync(iamfFilePath);
  //     }
  //   });
});
