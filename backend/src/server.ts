import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import { StorageService } from "./storage/storage_fs";
import { MixPresentationBase } from "src/@types/MixPresentation";
import { Queue } from "bullmq";
import { BULLMQ_IAMF_JOB_QUEUE } from "./manager";

export class AppServer {
  app: express.Application;
  port: number;
  upload: any;
  storageService: StorageService;
  iamfJobQueue: Queue<MixPresentationBase[]>;
  fileNameMap: Map<string, string>;
  httpServer: ReturnType<typeof this.app.listen>;

  constructor(
    storageService: StorageService,
    iamfJobQueue: Queue<MixPresentationBase[]>
  ) {
    this.app = express();
    this.port = 3000;
    this.fileNameMap = new Map<string, string>();
    this.storageService = storageService;
    this.iamfJobQueue = iamfJobQueue;
    this.upload = multer({ storage: multer.memoryStorage() }).array(
      "audioFiles"
    );

    this.configureMiddleware();
    this.configureIAMFPayloadUpload("/upload");
    this.configureIAMFJobStatusEndpoint();
    this.configureIAMFDownloadEndpoint();
    // Changed: store the server reference.
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`Server: Listening on port ${this.port}`);
    });
  }

  private configureMiddleware() {
    // Middleware to parse JSON request bodies
    this.app.use(bodyParser.json());

    // Enable CORS for requests from http://localhost:5173
    this.app.use(
      cors({
        origin: "http://localhost:5173",
      })
    );
  }

  private configureIAMFPayloadUpload(uploadURL: string) {
    this.app.post(
      uploadURL,
      this.upload,
      // Parse response, validate, and create job.
      async (req: Request, res: Response) => {
        try {
          const payloadMixPresentations =
            this.parsePayloadMixPresentations(req);
          const { isValid, reasonInvalid } = this.validateIAMFPayload(
            payloadMixPresentations,
            req
          );
          if (!isValid) {
            res.status(400).send(reasonInvalid);
          } else {
            await this.processReqAudioFiles(payloadMixPresentations, req, res);
            // If we successfully process audio files in the request, create the job.
            const job = await this.iamfJobQueue.add(
              BULLMQ_IAMF_JOB_QUEUE,
              payloadMixPresentations
            );
            res.status(200).json({
              urls: "Successful IAMF Payload Upload - Job Created",
              jobID: job.id,
            });
          }
        } catch (e) {
          console.log(e);
          res.status(500).send("Server: Error processing payload");
        }
      }
    );
  }

  private configureIAMFJobStatusEndpoint() {
    this.app.get("/job-status/:jobId", async (req: Request, res: Response) => {
      const jobId = req.params.jobId;
      try {
        const job = await this.iamfJobQueue.getJob(jobId);
        if (!job) {
          res.status(404).send("Job not found");
          return;
        }
        const state = await job.getState();
        const result = job.returnvalue;
        res.status(200).json({ state, iamfFileUrl: result });
      } catch (error) {
        console.error("Error fetching job status:", error);
        res.status(500).send("Error fetching job status");
      }
    });
  }

  private configureIAMFDownloadEndpoint() {
    this.app.get(
      "/job-download/:jobId",
      async (req: Request, res: Response) => {
        const jobId = req.params.jobId;
        try {
          const job = await this.iamfJobQueue.getJob(jobId);
          if (!job) {
            res.status(404).send("Job not found");
            return;
          }
          const state = await job.getState();
          if (state === "completed") {
            const iamfFileUrl = job.returnvalue;
            console.log(iamfFileUrl);
            res.download(iamfFileUrl, "IamfEncoding.iamf", (error) => {
              if (error) {
                // Handle errors, e.g., file not found
                console.error("Error downloading file:", error);
                if (error.message === "ENOENT") {
                  res.status(404).send(`File ${iamfFileUrl} not found.`);
                } else {
                  res.status(500).send("Error downloading file.");
                }
              }
            });
          }
        } catch (error) {
          console.error("Error downloading job result:", error);
          res.status(500).send("Error downloading job result");
        }
      }
    );
  }

  private parsePayloadMixPresentations(req: any) {
    let payloadMixPresentations: MixPresentationBase[] = [];
    if (req.body.mixPresentations) {
      const presentations = JSON.parse(req.body.mixPresentations) as
        | MixPresentationBase
        | MixPresentationBase[];
      if (Array.isArray(presentations)) {
        for (const presentation of presentations) {
          payloadMixPresentations.push(presentation);
          presentation.audioElements.map((audioElement) => {
            this.addAudioElementToMap(audioElement.name, audioElement.id);
          });
        }
      } else {
        payloadMixPresentations.push(presentations);
        presentations.audioElements.map((audioElement) => {
          this.addAudioElementToMap(audioElement.name, audioElement.id);
        });
      }
    } else {
      payloadMixPresentations = [];
    }
    return payloadMixPresentations;
  }

  // Basic validation of a request payload. A valid payload will have:
  // GTE 1MP. GTE 1AE. GTE 1 Audio file.
  private validateIAMFPayload(
    presentations: MixPresentationBase[],
    req: Request
  ): { isValid: boolean; reasonInvalid?: string } {
    let isValid = true;
    let reasonInvalid;
    if (presentations.length === 0 || !presentations[0]) {
      isValid = false;
      reasonInvalid = "No Mix Presentations";
    } else if (presentations[0].audioElements.length === 0) {
      isValid = false;
      reasonInvalid = "No Audio Elements in Mix Presentation";
    }

    if (!req.files || req.files.length === 0) {
      isValid = false;
      reasonInvalid = "No Audio Files uploaded";
    }

    return { isValid, reasonInvalid };
  }

  private async processReqAudioFiles(
    payloadMixPresentations: MixPresentationBase[],
    req: Request,
    res: Response
  ) {
    try {
      const files = req.files as Express.Multer.File[]; // Type assertion for req.files
      for (const file of files) {
        let fileData: Buffer;
        if (file.buffer) {
          // Using memory storage
          fileData = file.buffer;
        } else {
          console.error("Error: File data not found.");
          continue; // Skip to the next file
        }

        const fileID = this.fileNameMap.get(file.originalname);
        if (!fileID) {
          console.error(
            `Error: File ID not found for file name ${file.originalname}.`
          );
          continue; // Skip to the next file
        }
        await this.storageService.create(fileData, fileID);
      }
    } catch (error) {
      console.error("Error uploading audio files:", error);
      res.status(500).send("Failed to upload audio files.");
    }
  }

  private addAudioElementToMap(fileName: string, audioElementID: string) {
    this.fileNameMap.set(fileName, audioElementID);
  }

  close() {
    if (this.httpServer) {
      this.httpServer.close();
    }
  }
}
