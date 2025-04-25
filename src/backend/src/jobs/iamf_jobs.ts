import { Job, Worker } from "bullmq";
import { IAMF_JOB_QUEUE } from "../manager.ts";
import { payloadToIAMF } from "../iamf/parser/iamf_proto.ts";
import { buildIAMFFile } from "../iamf/parser/iamf_file.ts";
import type { MixPresentationBase } from "src/@types/MixPresentation";

const iamfWorker = new Worker(
  IAMF_JOB_QUEUE,
  async (job: Job<MixPresentationBase[]>) => {
    console.log("Processing job:", job.id);
    // Format metadata as IAMF textproto
    const protoFilePath = await payloadToIAMF(job.data);
    // Use the proto file to encode the IAMF file
    return await buildIAMFFile(protoFilePath);
  }
);
