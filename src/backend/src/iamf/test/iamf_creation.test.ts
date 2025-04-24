import { expect, describe, it } from "vitest";
import { payloadToIAMF } from "../parser/iamf_converter";
import fs from "fs";
import path from "path";
import { buildIAMFFile } from "../job/build_iamf";

describe("Test create IAMF files from given payloads", async () => {
  it("1AE1MP", async () => {
    const cwd = process.cwd();
    const payloadPath = path.join(
      cwd,
      "src/backend/src/iamf/test/resources",
      "1ae1mp.json"
    );
    const payload = fs.readFileSync(payloadPath, "utf-8");
    const protofile = await payloadToIAMF(JSON.parse(payload));
    // Await the IAMF file creation.
    await buildIAMFFile(protofile);
    // Check if the IAMF file is created.
    const iamfFilePath = cwd + "/boo.iamf";
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });
});
