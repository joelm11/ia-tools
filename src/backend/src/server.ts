import express from "express";
import multer from "multer";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Configure multer to handle multipart/form-data (which is typically used for FormData)
const upload = multer();

app.post("/upload", upload.any(), (req, res) => {
  console.log("Received FormData:");

  // Log text fields
  console.log("Fields:", req.body);

  // Log files (if any)
  if (req.files && req.files.length > 0) {
    console.log("Files:");
    req.files.forEach((file: Express.Multer.File) => {
      console.log(`  - Fieldname: ${file.fieldname}`);
      console.log(`  - Original Name: ${file.originalname}`);
      console.log(`  - Mimetype: ${file.mimetype}`);
      console.log(`  - Size: ${file.size} bytes`);
      // If you configured storage with multer, file.path or file.buffer would be available
    });
  } else {
    console.log("No files were uploaded.");
  }

  res.send("FormData received and logged!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
