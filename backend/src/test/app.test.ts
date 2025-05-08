import { describe, beforeAll, afterAll, it, expect, afterEach } from "vitest";
import { Manager } from "../manager";
import request from "supertest";
import fs from "fs";
import path from "path";
import { JobState } from "bullmq";
import { setTimeout } from "timers/promises";

// Helper function to load test data
function loadTestData(fileName: string) {
  const filePath = path.join(
    process.cwd(),
    "src/iamf/test/resources",
    fileName
  );
  return fs.readFileSync(filePath);
}

// Helper function that sends a simple valid IAMF job.
async function startValidIAMFJob(appUT: any): Promise<request.Response> {
  const mixPresentation = JSON.parse(loadTestData("1ae1mp.json").toString());
  const audioFilePath = path.join(
    process.cwd(),
    "src/iamf/test/resources",
    "audio_sources",
    "BassNote.wav"
  );

  const response = await request(appUT)
    .post("/upload")
    .field("mixPresentations", JSON.stringify(mixPresentation))
    .attach("audioFiles", audioFilePath)
    .expect(200);

  expect(response.text).toContain(
    "Successful IAMF Payload Upload - Job Created"
  );

  return response;
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

  afterEach(async () => {
    // Clean slate between each test run.
    await manager.iamfJobQueue.drain();
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
    expect(response.text).toContain("No Audio Files uploaded");
  });

  it("Valid - 1MP 1 Audio Source", async () => {
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

    expect(response.text).toContain(
      "Successful IAMF Payload Upload - Job Created"
    );
  });

  it("Valid - 1MP 2 Audio Source", async () => {
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
      .attach("audioFiles", audioFilePath)
      .expect(200);

    expect(response.text).toContain(
      "Successful IAMF Payload Upload - Job Created"
    );
  });

  it("Valid - 2 MP 1 Audio Source", async () => {
    const mixPresentation = JSON.parse(loadTestData("1ae2mp.json").toString());
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

    expect(response.text).toContain(
      "Successful IAMF Payload Upload - Job Created"
    );
  });

  it("Invalid 1 MP 0 Audio Source", async () => {
    const formData = new FormData();
    const mixPresentation = JSON.parse(loadTestData("1ae1mp.json").toString());

    formData.append("mixPresentations", JSON.stringify(mixPresentation));

    const response = await request(manager.server.app)
      .post("/upload")
      .send(formData)
      .expect(400);

    expect(response.text).toContain("No Audio Files uploaded");
  });

  it("Valid Job Poll", async () => {
    const response = await startValidIAMFJob(manager.server.app);

    // Poll job status.
    const jobID = JSON.parse(response.text).jobID;
    const pollStatus = await request(manager.server.app)
      .get(`/job-status/${jobID}`)
      .expect(200);
    const jobState = JSON.parse(pollStatus.text) as {
      state: JobState;
      result: any;
    };
    expect(jobState.state).toEqual("waiting");
  });

  it("Valid Job Poll for Completed", async () => {
    const response = await startValidIAMFJob(manager.server.app);

    // Poll job status.
    const jobID = JSON.parse(response.text).jobID;
    let pollStatus: request.Response;
    let jobState: { state: JobState; result: any };

    do {
      pollStatus = await request(manager.server.app)
        .get(`/job-status/${jobID}`)
        .expect(200);
      jobState = JSON.parse(pollStatus.text);
      if (jobState.state !== "completed") await setTimeout(1000);
    } while (jobState.state === "waiting");

    expect(jobState.state === "completed");

    // Response should have a file.
    const downloadResponse = await request(manager.server.app)
      .get(`/job-download/${jobID}`)
      .expect(200);

    // Save the file to the current working directory
    const fname = "app_test.iamf";
    fs.writeFileSync(fname, downloadResponse.body);

    expect(fs.existsSync(fname)).toBe(true);
    fs.rmSync(fname);
  }, 2000);
});
