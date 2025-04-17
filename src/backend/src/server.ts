import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

export class AppServer {
  app: express.Application;
  port: number;
  upload: multer.Multer;
  // Map for a newly created file UUID to the original file name.
  fileNameMap: Map<string, string>;

  constructor() {
    this.app = express();
    this.port = 3000;
    this.fileNameMap = new Map<string, string>();
    this.upload = multer(); // Initialize with an empty multer instance

    this.configureMiddleware();
    this.configurePayloadUpload("/upload");
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }

  private configureMiddleware() {
    // Middleware to parse JSON request bodies
    this.app.use(bodyParser.json());
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
    console.log("Received FormData:");

    // Validate the request.
    // TODO:

    // Log text fields
    console.log("Fields:", req.body);

    // Log files (if any)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log("Files:");
      req.files.forEach((file: Express.Multer.File) => {
        // Use the correct type here
        console.log(`  - Fieldname: ${file.fieldname}`);
        console.log(`  - Original Name: ${file.originalname}`);
        console.log(`  - Mimetype: ${file.mimetype}`);
        console.log(`  - Size: ${file.size} bytes`);
        // If you configured storage with multer, file.path or file.buffer would be available
        console.log(`  - Path: ${file.path}`);
        // Save the the file to the server
      });
    } else {
      console.log("No files were uploaded.");
    }

    res.send("FormData received and logged!");
  }
}
