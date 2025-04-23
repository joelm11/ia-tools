import { expect, describe, it } from "vitest"; // If globals are not enabled
import { payloadToIAMF } from "../iamf_converter";
import fs from "fs";

describe("1ae1mp", () => {
  it("Generate IAMF Metadata from internal state representation", () => {
    // Get the path to the CWD
    const cwd = process.cwd();
    // Append the path to the file
    const filePath = `${cwd}/src/backend/src/iamf/parser/test/resources/1ae1mp.json`;
    const payload = fs.readFileSync(filePath, "utf-8");
    payloadToIAMF(JSON.parse(payload));
  });
});
