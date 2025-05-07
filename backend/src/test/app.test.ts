import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { Manager } from "../manager";
import request from "supertest";
import fs from "fs";
import path from "path";
import { MixPresentationBase } from "src/@types/MixPresentation";

// Helper function to load test data
function loadTestData(fileName: string) {
  const filePath = path.join(
    process.cwd(),
    "src/iamf/test/resources",
    fileName
  );
  return fs.readFileSync(filePath);
}

describe("Payload Upload", () => {
  let manager: Manager;
  const resourcePath = path.join(
    process.cwd(),
    "src/iamf/test/resources/audio_sources"
  );

  beforeAll(() => {
    manager = new Manager();
  });

  afterAll(() => {
    manager.stop();
  });

  it("POST /upload with no files returns 400", async () => {
    const formData = new FormData();
    const response = await request(manager.server.app)
      .post("/upload")
      .send(formData)
      .expect(400);
    expect(response.text).toContain("No audio files were uploaded");
  });

  it("Valid upload with single MP single audio source file", async () => {
    const mixPresentation = JSON.parse(loadTestData("1ae1mp.json").toString());
    const audioFilePath = path.join(
      process.cwd(),
      "src/iamf/test/resources",
      "audio_sources",
      "BassNote.wav"
    );

    const response = await request(manager.server.app)
      .post("/upload")
      .field("mixPresentations", JSON.stringify(mixPresentation))
      .attach("audioFiles", audioFilePath)
      .expect(200);
  });

  it("Valid upload with single MP two audio source file", async () => {
    // Implementation for two audio source files
  });

  it("Valid upload with 2 MP single audio source file", async () => {
    // Implementation for two mix presentations
  });

  it("Invalid upload with single MP and no audio source file", async () => {
    const formData = new FormData();
    const mixPresentation = JSON.parse(loadTestData("1ae1mp.json").toString());

    formData.append("mixPresentations", JSON.stringify(mixPresentation));

    const response = await request(manager.server.app)
      .post("/upload")
      .send(formData)
      .expect(400);

    expect(response.text).toContain("No audio files were uploaded");
  });
});
