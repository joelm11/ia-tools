import { Job, Worker } from "bullmq";
import { IAMF_JOB_QUEUE } from "../manager";
import { payloadToIAMF } from "../iamf/parser/iamf_proto";
import { buildIAMFFile } from "../iamf/parser/iamf_file";
import type { MixPresentationBase } from "../../../common/types/MixPresentation";

const iamfWorker = new Worker(
  IAMF_JOB_QUEUE,
  async (job: Job<MixPresentationBase[]>) => {
    console.log("Processing job:", job.id);
    // Format metadata as IAMF textproto
    const protoFilePath = await payloadToIAMF(job.data);
    console.log("IAMF proto file path:", protoFilePath);
    // Use the proto file to encode the IAMF file
    return await buildIAMFFile(protoFilePath);
  },
  { connection: { host: "localhost", port: 6379 } }
);
