import express from "express";
import multer from "multer";
const app = express();
const port = 3000;

// Configure multer to handle form data
const upload = multer(); // No storage specified, data will be in memory

// Define a POST route to handle form data
app.post("/log", upload.any(), (req: any, res: any) => {
  console.log("Received Form Data:");

  // Access text data sent in the FormData
  for (const field in req.body) {
    console.log(`  ${field}: ${req.body[field]}`);
  }

  // Access files sent in the FormData (if any)
  if (req.files && req.files.length > 0) {
    console.log("Received Files:");
    req.files.forEach((file: any) => {
      console.log(`  Fieldname: ${file.fieldname}`);
      console.log(`  Original Name: ${file.originalname}`);
      console.log(`  MIME Type: ${file.mimetype}`);
      console.log(`  Size: ${file.size} bytes`);
      // You can access the file buffer via file.buffer if no storage is specified
    });
  } else {
    console.log("No files received.");
  }

  res.json({ message: "Form data received and logged successfully!" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
