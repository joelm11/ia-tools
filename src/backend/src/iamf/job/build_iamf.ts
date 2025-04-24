import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const AUDIO_SRC_DIR = `${process.cwd()}/src/backend/src/iamf/test/resources/audio_sources`;
const IAMF_EXE = `${process.cwd()}/src/backend/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;

export async function buildIAMFFile(iamfMetaDataFilePath: string) {
  const cwd = process.cwd();
  const command = IAMF_EXE;
  const userMetadataFilename = path.join(cwd, iamfMetaDataFilePath);
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
      fs.unlinkSync("iamf_md.textproto");
      resolve(null);
    });

    iamfProcess.on("error", (err) => {
      console.error(`Error spawning command: ${err}`);
      fs.unlinkSync("iamf_md.textproto");
      reject(err);
    });
  });
}
