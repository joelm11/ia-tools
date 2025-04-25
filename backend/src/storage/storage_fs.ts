import path from "path";
import { Storage, StorageReturn } from "./storage";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export class StorageFS implements Storage {
  storageRoot: string;
  storageDir: string;

  constructor(storageRoot: string, objectLabel: string) {
    this.storageRoot = storageRoot;
    this.storageDir = `${this.storageRoot}/${objectLabel}`;

    // Create the storage directory at path.join(storageRoot, objectLabel) if it doesn't exist
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File): Promise<StorageReturn> {
    const fileUuid = uuidv4();
    // Get the file extension from the original filename
    const fileExtension = path.extname(file.originalname);
    // const newFilename = `${fileUuid}${fileExtension}`;
    const newFilename = fileUuid; // Removing the extension for now.
    const filePath = path.join(this.storageDir, newFilename);

    // Attempt to write the file to the filesystem
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, url: this.storageDir + "/" + newFilename });
        }
      });
    });
  }

  async exists(fileID: string): Promise<StorageReturn> {
    // Check if the file exists in the filesystem
    return new Promise((resolve) => {
      const filePath = path.join(this.storageDir, fileID);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          resolve({ success: false });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  async delete(fileID: string): Promise<StorageReturn> {
    // Implement the logic to delete a file from the filesystem
    return new Promise((resolve, reject) => {
      const filePath = `/tmp/AudioElements/${fileID}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}
