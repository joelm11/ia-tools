import { expect, describe, it } from "vitest";
import { payloadToIAMF } from "../parser/iamf_converter";
import fs from "fs";
import { spawn } from "child_process";
import path from "path";

const AUDIO_SRC_DIR = `${process.cwd()}/src/backend/src/iamf/parser/test/resources/audio_sources`;
const IAMF_EXE = `${process.cwd()}/src/backend/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;

describe("Test create IAMF files from given payloads", async () => {
  it("1AE1MP", async () => {
    const cwd = process.cwd();
    const filePath = path.join(
      cwd,
      "src",
      "backend",
      "src",
      "iamf",
      "parser",
      "test",
      "resources",
      "1ae1mp.json"
    );
    const payload = fs.readFileSync(filePath, "utf-8");
    const protofile = await payloadToIAMF(JSON.parse(payload));
    const command = IAMF_EXE;
    const userMetadataFilename = path.join(cwd, protofile);
    const inputWavDirectory = AUDIO_SRC_DIR;
    const outputIamfDirectory = cwd;

    const args = [
      "--user_metadata_filename=" + userMetadataFilename,
      "--input_wav_directory=" + inputWavDirectory,
      "--output_iamf_directory=" + outputIamfDirectory,
    ];

    console.log(`${command} ${args.join(" ")}`);

    return new Promise((resolve, reject) => {
      const iamfProcess = spawn(command, args);

      iamfProcess.stdout.on("data", (data) => {
        console.log(`Stdout from command: ${data.toString()}`);
      });

      iamfProcess.stderr.on("data", (data) => {
        console.error(`Stderr from command: ${data.toString()}`);
      });

      iamfProcess.on("close", (code) => {
        console.log(`IAMF process exited with code ${code}`);
        // Expect that 'boo.iamf' exists in the CWD.
        const iamfFilePath = path.join(cwd, "boo.iamf");
        expect(fs.existsSync(iamfFilePath)).toBe(true);
        resolve(null);
      });

      iamfProcess.on("error", (err) => {
        console.error(`Error spawning command: ${err}`);
        reject(err);
      });
    });
  });
});
