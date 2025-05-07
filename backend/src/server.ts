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
    this.configurePayloadUpload("/upload");
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

  private configurePayloadUpload(uploadURL: string) {
    this.app.post(
      uploadURL,
      this.upload,
      async (req: Request, res: Response) => {
        // Parse payload and check validity.
        const payloadMixPresentations = this.getPayloadMixPresentations(req);
        const { isValid, reasonInvalid } = this.validIAMFPayload(
          payloadMixPresentations,
          req
        );
        if (!isValid) {
          res.status(400).send(reasonInvalid);
        }
        // Handle the uploaded audio files.
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
    );
  }

  private getPayloadMixPresentations(req: any) {
    let payloadMixPresentations: MixPresentationBase[] = [];
    if (Array.isArray(req.body.mixPresentations)) {
      payloadMixPresentations = [];
      for (const presentationString of req.body.mixPresentations) {
        try {
          const parsedPresentation = JSON.parse(
            presentationString
          ) as MixPresentationBase;
          payloadMixPresentations.push(parsedPresentation);
          parsedPresentation.audioElements.map((audioElement) => {
            this.addAudioElementToMap(audioElement.name, audioElement.id);
            console.log("Adding", audioElement.name, "w/ID", audioElement.id);
          });
        } catch (error) {
          console.error("Error parsing a mixPresentation JSON string:", error);
        }
      }
    } else {
      payloadMixPresentations = req.body
        .mixPresentations as MixPresentationBase[];
    }
    return payloadMixPresentations;
  }

  // Basic validation of a request payload. A valid payload will have:
  // GTE 1MP. GTE 1AE. GTE 1 Audio file.
  private validIAMFPayload(
    presentations: MixPresentationBase[],
    req: Request
  ): { isValid: boolean; reasonInvalid?: string } {
    let isValid = true;
    let reasonInvalid;

    if (presentations.length === 0) {
      isValid = false;
      reasonInvalid = "No Mix Presentations";
    } else if (presentations[0].audioElements.length <= 0) {
      isValid = false;
      reasonInvalid = "No Audio Elements in Mix Presentation";
    } else if (!req.files || req.files.length === 0) {
      isValid = false;
      reasonInvalid = "No Audio Files uploaded";
    }

    return { isValid, reasonInvalid };
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
