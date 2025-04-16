import express, { type Request, type Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Configure multer to handle multipart/form-data (which is typically used for FormData)
const storage = multer.diskStorage({
  destination: "/tmp/mpUploads",
  filename: function (req, file, cb) {
    cb(null, file.filename + "-" + "Woo!");
    console.log("Foo");
  },
});

const upload = multer({ storage: storage });

interface MulterRequest extends Request {
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined;
}

app.post("/upload", upload.any(), (req: MulterRequest, res: Response) => {
  console.log("Received FormData:");

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
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
