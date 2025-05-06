import type { MixPresentationBase } from "../../common/types/MixPresentation";
import { UserEvents } from "../events/events";
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
    this.server = new AppServer(this.audioStorage);
    // Catch if IAMF job queue is not initialized
    this.iamfJobQueue = new Queue(BULLMQ_IAMF_JOB_QUEUE);
    this.registerEvents();
    this.registerWorkers();
  }

  private registerEvents() {
    // Listen for payload upload to the server.
    this.server.on(
      UserEvents.PAYLOADUPLOAD,
      (payload: MixPresentationBase[]) => {
        console.log("Received payload upload event:", payload);
        this.iamfJobQueue.add(BULLMQ_IAMF_JOB_QUEUE, payload);
      }
    );
  }

  private registerWorkers() {
    this.workers.push(new IAMFWorker(this.audioStorage, this.iamfStorage));
  }

  stop() {
    // Added method to close the server
    this.server.close();
  }
}
