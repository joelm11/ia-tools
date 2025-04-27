import { Job, Worker } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE, BULLMQ_REDIS_CONNECTION } from "../manager";
import { payloadToIAMF } from "../iamf/parser/iamf_proto";
import { buildIAMFFile } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import { StorageService } from "src/storage/storage_fs";
import path from "path";

export class IAMFWorker extends Worker<MixPresentationBase[]> {
  audioSourceStore: StorageService;
  constructor(storageService: StorageService) {
    // Call the Worker constructor with the job processor
    super(
      BULLMQ_IAMF_JOB_QUEUE,
      async (job: Job<MixPresentationBase[]>) => {
        console.log("Processing job:", job.id);
        // Format metadata as IAMF textproto
        const protoFilePath = await payloadToIAMF(job.data);
        console.log("IAMF proto file path:", protoFilePath);
        // Use the proto file to encode the IAMF file
        return await buildIAMFFile(
          path.join(process.cwd(), protoFilePath),
          this.audioSourceStore.storageDir,
          process.cwd()
        );
      },
      BULLMQ_REDIS_CONNECTION
    );
    this.audioSourceStore = storageService;
  }
}
