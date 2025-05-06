import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import EventEmitter from "events";
import { UserEvents } from "../events/events";
import { StorageService } from "./storage/storage_fs";
import {
  MixPresentation,
  MixPresentationBase,
} from "src/@types/MixPresentation";

export class AppServer extends EventEmitter {
  app: express.Application;
  port: number;
  upload: any;
  storageService: StorageService;
  fileNameMap: Map<string, string>;
  httpServer: ReturnType<typeof this.app.listen>; // added property

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
        const parsedPayload = this.payloadMetadata(req);
        // Handle the uploaded audio files.
        try {
          if (!req.files || req.files.length === 0) {
            res.status(400).send("No audio files were uploaded.");
            return;
          }

          const uploadedUrls: string[] = [];
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
            const fileUrl = this.storageService.create(fileData, fileID);
            uploadedUrls.push((await fileUrl).url as string);
          }

          res.status(200).json({ urls: uploadedUrls });
          this.emit(UserEvents.PAYLOADUPLOAD, parsedPayload);
        } catch (error) {
          console.error("Error uploading audio files:", error);
          res.status(500).send("Failed to upload audio files.");
        }
      }
    );
  }

  private payloadMetadata(req: any) {
    let mixPresentationsObjects;
    console.log("Parsing payload");
    if (Array.isArray(req.body.mixPresentations)) {
      mixPresentationsObjects = [];
      for (const presentationString of req.body.mixPresentations) {
        try {
          const parsedPresentation = JSON.parse(
            presentationString
          ) as MixPresentationBase;
          mixPresentationsObjects.push(parsedPresentation);
          parsedPresentation.audioElements.map((audioElement) => {
            this.addAudioElementToMap(audioElement.name, audioElement.id);
            console.log("Adding", audioElement.name, "w/ID", audioElement.id);
          });
        } catch (error) {
          console.error("Error parsing a mixPresentation JSON string:", error);
          mixPresentationsObjects.push(presentationString);
        }
      }
    } else {
      mixPresentationsObjects = req.body.mixPresentations;
    }
    return mixPresentationsObjects;
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
