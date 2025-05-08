import type { MixPresentationBase } from "../../common/types/MixPresentation";
import { AppServer } from "./server";
import { Queue, Worker, WorkerOptions } from "bullmq";
import { StorageService } from "./storage/storage_fs";
import { IAMFWorker } from "./workers/iamf_worker";

/**
 * @brief
 * The manager module is responsible for managing the lifecycle of the application.
 * It handles the initialization, runtime, and shutdown of the application.
 * The manager owns the server instance, job parser, job queue, and job executor.
 * It is responsible for starting and stopping the server, as well as processing jobs.
 */

// Global constants for BullMQ jobs
export const BULLMQ_IAMF_JOB_QUEUE = "construct-iamf";
export const BULLMQ_REDIS_CONNECTION = {
  connection: {
    host: "localhost",
    port: 6379,
  },
} as WorkerOptions;

export class Manager {
  server: AppServer;
  audioStorage: StorageService;
  iamfStorage: StorageService;
  iamfJobQueue: Queue<MixPresentationBase[]>;
  workers: Worker[] = [];

  constructor() {
    // Initialize the server, job parser, job queue, and job executor.
    this.audioStorage = new StorageService("/tmp", "SSAudioElements");
    this.iamfStorage = new StorageService("/tmp", "SSIAMF");
    this.iamfJobQueue = new Queue(BULLMQ_IAMF_JOB_QUEUE);
    this.server = new AppServer(this.audioStorage, this.iamfJobQueue); // Pass the job queue to the server
    this.registerEvents();
    this.registerWorkers();
  }

  private registerEvents() {}

  private registerWorkers() {
    this.workers.push(new IAMFWorker(this.audioStorage));
  }

  stop() {
    // Added method to close the server
    this.server.close();
  }
}
