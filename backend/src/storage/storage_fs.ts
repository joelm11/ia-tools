import path from "path";
import { Storage, StorageReturn } from "./storage";
import fs from "fs";

export class StorageService implements Storage {
  storageRoot: string;
  storageDir: string;

  constructor(storageRoot: string, containerLabel: string) {
    this.storageRoot = storageRoot;
    this.storageDir = `${this.storageRoot}/${containerLabel}`;

    // Create the storage directory at path.join(storageRoot, objectLabel) if it doesn't exist
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async create(
    file: Buffer | ArrayBufferLike,
    fileID: string
  ): Promise<StorageReturn> {
    // Before storing the file, check if the file exists in the filesystem
    const fileExists = await this.exists(fileID);
    if (fileExists.success) {
      return { success: true, url: fileExists.url };
    }

    // Attempt to write the file to the filesystem
    const filePath = path.join(this.storageDir, fileID);
    const fileData = file instanceof Buffer ? file : Buffer.from(file);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileData, (err) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, url: filePath });
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
          resolve({ success: true, url: filePath });
        }
      });
    });
  }

  async delete(fileID: string): Promise<StorageReturn> {
    // Check if the file exists before attempting to delete it
    const fileExists = await this.exists(fileID);
    if (!fileExists.success) {
      return { success: true };
    }
    // Attempt to delete the file from the filesystem
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.storageDir, fileID);
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
