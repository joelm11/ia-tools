import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { Manager } from "../manager";
import request from "supertest";

describe("Payload Upload", () => {
  let manager: Manager;

  beforeAll(() => {
    manager = new Manager();
  });

  afterAll(() => {
    manager.stop();
  });

  it("POST /upload with no files returns 400", async () => {
    const response = await request(manager.server.app)
      .post("/upload")
      .field("mixPresentations", JSON.stringify([]))
      .expect(400);
    expect(response.text).toContain("No audio files were uploaded");
  });
});
