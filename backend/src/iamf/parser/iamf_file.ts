import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const IAMF_EXE = `${process.cwd()}/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;
const IAMF_FILENAME = "boo.iamf";

interface IAMFFileResult {
  iamfUrl: string;
}

export async function buildIAMFFile(
  iamfMetaDataURL: string,
  inputWavDirURL: string,
  iamfOutputDirURL: string
): Promise<IAMFFileResult> {
  const args = [
    "--user_metadata_filename=" + iamfMetaDataURL,
    "--input_wav_directory=" + inputWavDirURL,
    "--output_iamf_directory=" + iamfOutputDirURL,
  ];

  return new Promise((resolve, reject) => {
    const iamfProcess = spawn(IAMF_EXE, args);

    // // Commenting these streams out for now.
    // // TODO: Capture / log this information
    // iamfProcess.stdout.on("data", (data) => {
    //   console.log(`Stdout from command: ${data.toString()}`);
    // });

    // iamfProcess.stderr.on("data", (data) => {
    //   console.error(`Stderr from command: ${data.toString()}`);
    // });

    iamfProcess.on("close", (code) => {
      fs.unlinkSync(iamfMetaDataURL);
      resolve({
        iamfUrl: path.join(iamfOutputDirURL, IAMF_FILENAME),
      });
    });

    iamfProcess.on("error", (err) => {
      fs.unlinkSync(iamfMetaDataURL);
      reject(err);
    });
  });
}
