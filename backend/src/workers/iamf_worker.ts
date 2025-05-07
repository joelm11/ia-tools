import { Job, Worker } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE, BULLMQ_REDIS_CONNECTION } from "../manager";
import { payloadToIAMF } from "../iamf/parser/iamf_proto";
import { buildIAMFFile } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import { StorageService } from "src/storage/storage_fs";
import path from "path";

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
        const protoFilePath = await payloadToIAMF(
          job.data,
          this.iamfProdsStore
        );

        // Use the proto file to encode the IAMF file
        const res = await buildIAMFFile(
          protoFilePath,
          this.audioSourceStore.storageDir,
          iamfOutSS.storageDir
        );

        // Notify job completion with the resulting file path
        const resultFilePath = iamfOutSS.exists("boo.iamf");
        job.updateProgress(100);
        await job.moveToCompleted("done", "", true);
        job.returnvalue = { filePath: resultFilePath };

        console.log("Completed job", job.id);
        console.log("IAMF File at", resultFilePath);
      },

      BULLMQ_REDIS_CONNECTION
    );
    this.audioSourceStore = audioSS;
    this.iamfProdsStore = iamfOutSS;
  }
}
