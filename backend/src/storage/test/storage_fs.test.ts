import { describe, expect, beforeEach, afterEach, test } from "vitest";
import { StorageFS } from "../storage_fs";
import * as fs from "fs";
import * as path from "path";

describe("StorageFS", () => {
  let storage: StorageFS;
  const fileID = "testFile.txt";
  const testContent = "Hello, world!";

  beforeEach(() => {
    storage = new StorageFS("/tmp", "StorageFSTest");
  });

  afterEach(() => {
    // Clean up file created in storage container directory
    const fileInContainer = path.join(storage.storageDir, fileID);
    if (fs.existsSync(fileInContainer)) {
      fs.unlinkSync(fileInContainer);
    }
    // Clean up file created in deletion path (/tmp/AudioElements)
    const fileInAudioElements = path.join("/tmp/AudioElements", fileID);
    if (fs.existsSync(fileInAudioElements)) {
      fs.unlinkSync(fileInAudioElements);
    }
  });

  test("should write a file and check if it exists", async () => {
    const fakeFile = {
      buffer: Buffer.from(testContent),
    } as Express.Multer.File;
    const createResult = await storage.create(fakeFile, fileID);
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
});
