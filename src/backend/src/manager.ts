import { UserEvents } from "../events/events.ts";
import { AppServer } from "./server.ts";

/**
 * @brief
 * The manager module is responsible for managing the lifecycle of the application.
 * It handles the initialization, runtime, and shutdown of the application.
 * The manager owns the server instance, job parser, job queue, and job executor.
 * It is responsible for starting and stopping the server, as well as processing jobs.
 */
export class Manager {
  server: AppServer;

  constructor() {
    // Initialize the server, job parser, job queue, and job executor.
    this.server = new AppServer();
    this.registerEvents();
  }

  private registerEvents() {
    // Listen for payload upload to the server.
    this.server.on(UserEvents.PAYLOADUPLOAD, (job) => {
      console.log("Job received:", job);
      // Parse payload.
    });
  }
}
