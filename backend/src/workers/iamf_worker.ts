import { Job, Worker } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE, BULLMQ_REDIS_CONNECTION } from "../manager";
import {
  CODEC_BIT_DEPTH,
  CODEC_SR,
  payloadToIAMF,
} from "../iamf/parser/iamf_proto";
import { buildIAMFFile, IAMFFileResult } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import { StorageService } from "src/storage/storage_fs";
import { formatSourceAudio } from "src/iamf/parser/iamf_encoding_tools";

/**
 * @brief IAMF Job Executor. Given parsed and validated payload, attempts to encode an IAMF file.
 * @returns URL of the created IAMF file.
 */
export class IAMFWorker extends Worker<MixPresentationBase[]> {
  constructor(audioSS: StorageService) {
    super(
      BULLMQ_IAMF_JOB_QUEUE,
      // The job processor function:
      async (job: Job<MixPresentationBase[]>) => {
        const jobId = job.id ? job.id : "InvalidJobId";
        console.log("Processing job:", job.id);

        try {
          const iamfJobRes = await iamfWorkerJob(jobId, job.data, audioSS);
          console.log("Completed job:", job.id);
          return iamfJobRes.iamfUrl;
        } catch (err) {
          console.log("Failed IAMF job:", job.id, "with", err);
          // Log information about the failure like mix presentation MD and audio source information.
          console.log("Job data:", job.data);
          throw err;
        }
      },
      BULLMQ_REDIS_CONNECTION
    );
  }
}

export async function iamfWorkerJob(
  jobId: string,
  jobData: MixPresentationBase[],
  audioSS: StorageService
): Promise<IAMFFileResult> {
  const iamfSS = new StorageService("/tmp/ia-tools", jobId as string);

  // Encoding will fail unless audio sources are at the same sample rate
  let sourceSet = new Map<string, string>();
  for (const pres of jobData) {
    if (!Array.isArray(pres.audioElements)) {
      pres.audioElements = [pres.audioElements];
    }

    for (const elem of pres.audioElements) {
      const exists = await audioSS.exists(elem.id);
      if (exists.success && exists.url) {
        sourceSet.set(elem.id, exists.url);
      }
    }
  }
  const sourceIds = [...sourceSet.keys()];
  await formatSourceAudio(sourceIds, audioSS, {
    sampleRate: CODEC_SR,
    bitDepth: CODEC_BIT_DEPTH,
  });

  // Attempt IAMF encoding from job payload.
  const iamfEncoderRes = await payloadToIAMF(jobData, iamfSS)
    .then((iamfProtoRes) => {
      return buildIAMFFile(
        iamfProtoRes.protoUrl,
        audioSS.storageDir,
        iamfSS.storageDir,
        iamfSS
      );
    })
    .catch((error) => {
      console.log("Failed building IAMF file with error:", error, jobId);
      throw error;
    });
  return iamfEncoderRes;
}
