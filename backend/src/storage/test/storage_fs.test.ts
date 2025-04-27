import { describe, expect, beforeEach, afterEach, test } from "vitest";
import { StorageService } from "../storage_fs";
import * as fs from "fs";
import * as path from "path";

describe("StorageFS", () => {
  let storage: StorageService;
  const fileID = "testFile.txt";
  const testContent = "Hello, world!";
  const testFileContainer = "StorageFSTest";

  beforeEach(() => {
    storage = new StorageService("/tmp", testFileContainer);
  });

  afterEach(() => {
    // Clean up file created in storage container directory
    const fileInContainer = path.join(storage.storageDir, fileID);
    if (fs.existsSync(fileInContainer)) {
      fs.unlinkSync(fileInContainer);
    }
    // Cleanup the storage directory
    if (fs.existsSync(storage.storageDir)) {
      console.log(storage.storageDir);
      fs.rmdirSync(storage.storageDir, { recursive: true });
    }
  });

  test("should write a file and check if it exists", async () => {
    const fakeFile = {
      buffer: Buffer.from(testContent),
    } as Express.Multer.File;
    const createResult = await storage.create(fakeFile.buffer, fileID);
    expect(createResult.success).toBe(true);
    const existsResult = await storage.exists(fileID);
    expect(existsResult.success).toBe(true);
    expect(existsResult.url).toBe(path.join(storage.storageDir, fileID));
    // Delete the file after checking existence
    const deleteResult = await storage.delete(fileID);
    expect(deleteResult.success).toBe(true);
    const existsAfterDelete = await storage.exists(fileID);
    expect(existsAfterDelete.success).toBe(false);
    expect(existsAfterDelete.url).toBeUndefined();
  });

  test("write a file that already exists", async () => {
    const fakeFile = {
      buffer: Buffer.from(testContent),
    } as Express.Multer.File;
    const createResult = await storage.create(fakeFile.buffer, fileID);
    expect(createResult.success).toBe(true);
    const createAgainResult = await storage.create(fakeFile.buffer, fileID);
    expect(createAgainResult.success).toBe(true);
    expect(createAgainResult.url).toBe(path.join(storage.storageDir, fileID));
    // Delete the file after checking existence
    const deleteResult = await storage.delete(fileID);
    expect(deleteResult.success).toBe(true);
  });
});
