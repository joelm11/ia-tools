import { Job, Worker } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE, BULLMQ_REDIS_CONNECTION } from "../manager";
import { payloadToIAMF } from "../iamf/parser/iamf_proto";
import { buildIAMFFile } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import { StorageService } from "src/storage/storage_fs";

/**
 * @brief IAMF Job Executor. Given parsed and validated payload, attempts to encode an IAMF file.
 * @returns URL of the created IAMF file.
 */
export class IAMFWorker extends Worker<MixPresentationBase[]> {
  audioSourceStore: StorageService;

  constructor(audioSS: StorageService) {
    // Call the Worker constructor with the job processor
    super(
      BULLMQ_IAMF_JOB_QUEUE,
      async (job: Job<MixPresentationBase[]>) => {
        console.log("Processing job:", job.id);
        const iamfSS = new StorageService("/tmp", job.id || "NoIDJob");

        // Attempt IAMF encoding from job payload.
        const iamfEncoderRes = await payloadToIAMF(job.data, iamfSS)
          .then((iamfProtoRes) =>
            buildIAMFFile(
              iamfProtoRes.protoUrl,
              this.audioSourceStore.storageDir,
              iamfSS.storageDir
            )
          )
          .catch((error) => {
            throw error;
          });

        console.log("Completed job:", job.id);
        return iamfEncoderRes.iamfUrl;
      },

      BULLMQ_REDIS_CONNECTION
    );
    this.audioSourceStore = audioSS;
  }
}
