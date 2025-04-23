import { expect, describe, it } from "vitest"; // If globals are not enabled
import { payloadToIAMF } from "../iamf_converter";
import fs from "fs";

describe("1ae1mp", () => {
  it("Generate IAMF Metadata from internal state representation", () => {
    // Read a JSON file in as data and pass it to the function
    const payload = fs.readFileSync(
      "./src/backend/src/iamf_parser/test/resources/1ae1mp.json",
      "utf-8"
    );
    payloadToIAMF(JSON.parse(payload));
  });
});
