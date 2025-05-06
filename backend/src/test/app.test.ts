import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { Manager } from "../manager";
import request from "supertest";
import fs from "fs";
import path from "path";
import { MixPresentationBase } from "src/@types/MixPresentation";

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

  it("Valid upload with single MP single audio source file", async () => {});

  it("Valid upload with single MP two audio source file", async () => {});

  it("Valid upload with 2 MP single audio source file", async () => {});

  it("Invalid upload with single MP and no audio source file", async () => {});
});
