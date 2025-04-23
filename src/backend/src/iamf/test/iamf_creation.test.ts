import { expect, describe, it } from "vitest";
import { payloadToIAMF } from "../parser/iamf_converter";
import fs from "fs";

/**
 * For these tests we need the protofile produced by the parser as well as
 * the paths to the source audio files.
 */
const AUDIO_SRC_DIR = `${process.cwd()}/src/backend/src/iamf/parser/test/resources/audio_sources`;
const IAMF_EXE = `${process.cwd()}/src/backend/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;

describe("Test create IAMF files from given payloads", () => {
  it("1AE1MP", () => {
    const cwd = process.cwd();
    const filePath = `${cwd}/src/backend/src/iamf/parser/test/resources/1ae1mp.json`;
    const payload = fs.readFileSync(filePath, "utf-8");
    const protofile = payloadToIAMF(JSON.parse(payload));
    const command = `${IAMF_EXE} --user_metadata_filename=${cwd}/${protofile} --input_wav_directory=${AUDIO_SRC_DIR} --output_iamf_directory=${cwd} `;
    console.log(command);
    const exec = require("child_process").exec;
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    // Expect that 'boo.iamf' exists in the CWD.
    const iamfFilePath = `${cwd}/boo.iamf`;
    expect(fs.existsSync(iamfFilePath)).toBe(true);
  });
});
