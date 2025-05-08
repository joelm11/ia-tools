import { Job, Worker } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE, BULLMQ_REDIS_CONNECTION } from "../manager";
import { payloadToIAMF } from "../iamf/parser/iamf_proto";
import { buildIAMFFile } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import { StorageService } from "src/storage/storage_fs";

export class IAMFWorker extends Worker<MixPresentationBase[]> {
  audioSourceStore: StorageService;
  iamfProdsStore: StorageService;

  constructor(audioSS: StorageService, iamfOutSS: StorageService) {
    // Call the Worker constructor with the job processor
    super(
      BULLMQ_IAMF_JOB_QUEUE,
      async (job: Job<MixPresentationBase[]>) => {
        console.log("Processing job:", job.id);

        // Attempt IAMF encoding from job payload.
        const iamfEncoderRes = await payloadToIAMF(
          job.data,
          this.iamfProdsStore
        )
          .then((iamfProtoRes) =>
            buildIAMFFile(
              iamfProtoRes.protoUrl,
              this.audioSourceStore.storageDir,
              iamfOutSS.storageDir
            )
          )
          .catch((error) => {
            throw error;
          });

        return iamfEncoderRes.iamfUrl;
      },

      BULLMQ_REDIS_CONNECTION
    );
    this.audioSourceStore = audioSS;
    this.iamfProdsStore = iamfOutSS;
  }
}
