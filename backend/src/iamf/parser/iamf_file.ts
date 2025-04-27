import { spawn } from "child_process";
import fs from "fs";

const IAMF_EXE = `${process.cwd()}/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;

export async function buildIAMFFile(
  iamfMetaDataURL: string,
  inputWavDirURL: string,
  iamfOutputDirURL: string
) {
  const args = [
    "--user_metadata_filename=" + iamfMetaDataURL,
    "--input_wav_directory=" + inputWavDirURL,
    "--output_iamf_directory=" + iamfOutputDirURL,
  ];

  return new Promise((resolve, reject) => {
    const iamfProcess = spawn(IAMF_EXE, args);

    iamfProcess.stdout.on("data", (data) => {
      console.log(`Stdout from command: ${data.toString()}`);
    });

    iamfProcess.stderr.on("data", (data) => {
      console.error(`Stderr from command: ${data.toString()}`);
    });

    iamfProcess.on("close", (code) => {
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
