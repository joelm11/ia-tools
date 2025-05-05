import { describe, expect, beforeEach, afterEach, test } from "vitest";
import { AudioChFormat } from "src/@types/AudioFormats";
import { getMixMatrix } from "../GetMixMatrix";
import { getChannelCountRaw } from "src/@common/AudioFormatsTools";

describe("Test downmixing cases", () => {
  test("Generate a downmix matrix", async () => {
    for (const format of Object.values(AudioChFormat)) {
      if (format !== AudioChFormat.NONE) {
        const mat = getMixMatrix(AudioChFormat.K7P1P4, format as AudioChFormat);
        // Check matrix is sized as expected.
        expect(mat.length === getChannelCountRaw(format));
        expect(mat[0].length === getChannelCountRaw(AudioChFormat.K7P1P4));

        console.log(AudioChFormat.K7P1P4, "->", format);
        printMatrixDynamicPadding(mat);
      }
    }
  });

  test("Generate a upmix matrix", async () => {
    for (const format of Object.values(AudioChFormat)) {
      if (format !== AudioChFormat.NONE) {
        const mat = getMixMatrix(format as AudioChFormat, AudioChFormat.K7P1P4);
        // Check matrix is sized as expected.
        expect(mat.length === getChannelCountRaw(AudioChFormat.K7P1P4));
        expect(mat[0].length === getChannelCountRaw(format));

        console.log(format, "->", AudioChFormat.K7P1P4);
        printMatrixDynamicPadding(mat);
      }
    }
  });
});

function printMatrixDynamicPadding(matrix: number[][]): void {
  if (!matrix || matrix.length === 0) {
    console.log("[]");
    return;
  }

  const numRows = matrix.length;
  const numCols = matrix[0].length;

  // Determine the maximum width needed for each column
  const columnWidths: number[] = new Array(numCols).fill(0);

  for (let i = 0; i < numRows; i++) {
    if (matrix[i].length !== numCols) {
      console.error("Error: Matrix rows must have consistent lengths.");
      return; // Or handle inconsistency as needed
    }
    for (let j = 0; j < numCols; j++) {
      const numStr = String(matrix[i][j]);
      columnWidths[j] = Math.max(columnWidths[j], numStr.length);
    }
  }

  // Print the matrix with padding
  for (let i = 0; i < numRows; i++) {
    let rowString = "[";
    for (let j = 0; j < numCols; j++) {
      const numStr = String(matrix[i][j]);
      // Calculate padding needed
      const padding = columnWidths[j] - numStr.length;
      // Add padding spaces before the number
      rowString += " ".repeat(padding) + numStr;
      if (j < numCols - 1) {
        rowString += ", "; // Separator between elements
      }
    }
    rowString += "]";
    console.log(rowString);
  }
}
