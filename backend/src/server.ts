import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import EventEmitter from "events";
import { UserEvents } from "../events/events";

export class AppServer extends EventEmitter {
  app: express.Application;
  port: number;
  upload: multer.Multer;
  // Map for a newly created file UUID to the original file name.
  fileNameMap: Map<string, string>;

  constructor() {
    super();
    this.app = express();
    this.port = 3000;
    this.fileNameMap = new Map<string, string>();
    this.upload = multer(); // Initialize with an empty multer instance before configuring storage.

    this.configureMiddleware();
    this.configurePayloadUpload("/upload");
    this.app.listen(this.port, () => {
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

    this.configureStorage();
  }

  private configureStorage() {
    // Configure multer to handle multipart/form-data (which is typically used for FormData)
    const storage = multer.diskStorage({
      destination: "/tmp/AudioElements",
      filename: (req, file, cb) => {
        // Changed to an arrow function
        // Generate a unique filename and Store the original file name in the map.
        const uniqueName = uuidv4();
        this.fileNameMap.set(uniqueName, file.originalname);
        cb(null, uniqueName);
      },
    });
    this.upload = multer({ storage: storage });
  }

  private configurePayloadUpload(uploadURL: string) {
    // Configure the upload URL
    this.app.post(
      uploadURL,
      this.upload.any(),
      (req: Request, res: Response) => {
        this.handlePayloadUpload(req, res);
      }
    );
  }

  private handlePayloadUpload(req: Request, res: Response) {
    // Send a JSON response back to the client
    res.json({
      message: "Files uploaded successfully",
    });

    // Emit an event after the payload is uploaded
    const parsedPayload = this.payloadMetadata(req);
    this.emit(UserEvents.PAYLOADUPLOAD, parsedPayload);
  }

  private payloadMetadata(req: any) {
    let mixPresentationsObjects;
    if (Array.isArray(req.body.mixPresentations)) {
      mixPresentationsObjects = [];
      for (const presentationString of req.body.mixPresentations) {
        try {
          const parsedObject = JSON.parse(presentationString);
          mixPresentationsObjects.push(parsedObject);
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
}
