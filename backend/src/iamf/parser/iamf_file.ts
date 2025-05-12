import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { StorageService } from "src/storage/storage_fs";

const IAMF_EXE = `${process.cwd()}/src/iamf/iamf-tools/bazel-bin/iamf/cli/encoder_main`;
const IAMF_FILENAME = "boo.iamf";

interface IAMFFileResult {
  iamfUrl: string;
}

export async function buildIAMFFile(
  iamfMetaDataURL: string,
  inputWavDirURL: string,
  iamfOutputDirURL: string,
  iamfJobStorage: StorageService
): Promise<IAMFFileResult> {
  const args = [
    "--user_metadata_filename=" + iamfMetaDataURL,
    "--input_wav_directory=" + inputWavDirURL,
    "--output_iamf_directory=" + iamfOutputDirURL,
  ];

  const logFileID = `iamf_process_${Date.now()}.log`;

  return new Promise((resolve, reject) => {
    const iamfProcess = spawn(IAMF_EXE, args);
    let logData = "";

    iamfProcess.stdout.on("data", (data) => {
      logData += `Stdout: ${data.toString()}\n`;
    });

    iamfProcess.stderr.on("data", (data) => {
      logData += `Stderr: ${data.toString()}\n`;
    });

    iamfProcess.on("close", async (code) => {
      fs.unlinkSync(iamfMetaDataURL);
      resolve({
        iamfUrl: path.join(iamfOutputDirURL, IAMF_FILENAME),
      });
    });

    iamfProcess.on("error", async (err) => {
      try {
        await iamfJobStorage.create(Buffer.from(logData), logFileID);
        console.error(`Process error. Log file: ${logFileID}`);
      } catch (storageErr) {
        console.error(`Failed to store log file: ${storageErr}`);
      }
      fs.unlinkSync(iamfMetaDataURL);
      reject(err);
    });
  });
}
