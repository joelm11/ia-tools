import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import EventEmitter from "events";
import { UserEvents } from "../events/events";
import { StorageService } from "./storage/storage_fs";
import { MixPresentationBase } from "src/@types/MixPresentation";

export class AppServer extends EventEmitter {
  app: express.Application;
  port: number;
  upload: any;
  storageService: StorageService;
  fileNameMap: Map<string, string>;
  httpServer: ReturnType<typeof this.app.listen>;

  constructor(storageService: StorageService) {
    super();
    this.app = express();
    this.port = 3000;
    this.fileNameMap = new Map<string, string>();
    this.storageService = storageService;
    this.upload = multer({ storage: multer.memoryStorage() }).array(
      "audioFiles"
    );

    this.configureMiddleware();
    this.configureIAMFPayloadUpload("/upload");
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
            this.processReqAudioFiles(payloadMixPresentations, req, res);
          }
        } catch (e) {
          console.log(e);
          res.status(500).send("Server: Error processing payload");
        }
      }
    );
  }

  private parsePayloadMixPresentations(req: any) {
    let payloadMixPresentations: MixPresentationBase[] = [];
    if (Array.isArray(req.body.mixPresentations)) {
      for (const presentationString of req.body.mixPresentations) {
        const parsedPresentation = JSON.parse(
          presentationString
        ) as MixPresentationBase;
        payloadMixPresentations.push(parsedPresentation);
        parsedPresentation.audioElements.map((audioElement) => {
          this.addAudioElementToMap(audioElement.name, audioElement.id);
        });
      }
    } else {
      if (req.body.mixPresentations) {
        // Handle both single object and array cases
        payloadMixPresentations = [JSON.parse(req.body.mixPresentations)];
        payloadMixPresentations[0].audioElements.map((audioElement) => {
          this.addAudioElementToMap(audioElement.name, audioElement.id);
        });
      } else {
        payloadMixPresentations = [];
      }
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

      res.status(200).json({ urls: "Successful IAMF Payload Upload" });
      this.emit(UserEvents.PAYLOADUPLOAD, payloadMixPresentations);
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
