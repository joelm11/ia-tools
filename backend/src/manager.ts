import type { MixPresentationBase } from "../../common/types/MixPresentation";
import { UserEvents } from "../events/events";
import { AppServer } from "./server";
import { Queue } from "bullmq";

/**
 * @brief
 * The manager module is responsible for managing the lifecycle of the application.
 * It handles the initialization, runtime, and shutdown of the application.
 * The manager owns the server instance, job parser, job queue, and job executor.
 * It is responsible for starting and stopping the server, as well as processing jobs.
 */

export const IAMF_JOB_QUEUE = "construct-iamf";
export class Manager {
  server: AppServer;
  iamfJobQueue = new Queue(IAMF_JOB_QUEUE);

  constructor() {
    // Initialize the server, job parser, job queue, and job executor.
    this.server = new AppServer();
    this.registerEvents();
  }

  private registerEvents() {
    // Listen for payload upload to the server.
    this.server.on(
      UserEvents.PAYLOADUPLOAD,
      (payload: MixPresentationBase[]) => {
        console.log("Received payload upload event:", payload);
        this.iamfJobQueue.add(IAMF_JOB_QUEUE, payload);
      }
    );
  }
}
