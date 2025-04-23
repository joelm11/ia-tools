import { expect, describe, it } from "vitest";
import { payloadToIAMF } from "../parser/iamf_converter";
import fs from "fs";

/**
 * For these tests we need the protofile produced by the parser as well as
 * the paths to the source audio files.
 */
const AUDIO_SRC_DIR = `${process.cwd()}/src/backend/src/iamf/parser/test/resources/audio_files`;

describe("Test create IAMF files from given payloads", () => {
  it("1AE1MP", () => {
    const cwd = process.cwd();
    const filePath = `${cwd}/src/backend/src/iamf/parser/test/resources/1ae1mp.json`;
    const payload = fs.readFileSync(filePath, "utf-8");
    const protofile = payloadToIAMF(JSON.parse(payload));
  });
});
