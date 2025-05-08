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

        // Format metadata as IAMF textproto
        const protoOpResult = await payloadToIAMF(
          job.data,
          this.iamfProdsStore
        );
        if (!protoOpResult.success) {
          throw new Error(protoOpResult.error);
        }

        // Use the proto file to encode the IAMF file
        const encoderOpResult = await buildIAMFFile(
          protoOpResult.protoURL,
          this.audioSourceStore.storageDir,
          iamfOutSS.storageDir
        );
        if (!encoderOpResult.success) {
          throw new Error(encoderOpResult.error);
        }

        // Notify job completion with the resulting file path
        job.updateProgress(100);
        await job.moveToCompleted("done", "", true);
        job.returnvalue = { filePath: encoderOpResult.iamfURL };

        console.log("Completed job", job.id);
        console.log("IAMF File at", encoderOpResult.iamfURL);
      },

      BULLMQ_REDIS_CONNECTION
    );
    this.audioSourceStore = audioSS;
    this.iamfProdsStore = iamfOutSS;
  }
}
