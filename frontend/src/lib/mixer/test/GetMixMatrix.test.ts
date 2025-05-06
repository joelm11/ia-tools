import { describe, expect, beforeEach, afterEach, test } from "vitest";
import { AudioChFormat } from "src/@types/AudioFormats";
import { getMixMatrix, printMatrixDynamicPadding } from "../GetMixMatrix";
import { getChannelCountRaw } from "src/@common/AudioFormatsTools";

describe("Test downmixing cases", () => {
  const PRINTDEBUG = false;

  test("Generate a downmix matrix", async () => {
    for (const format of Object.values(AudioChFormat)) {
      if (format !== AudioChFormat.NONE) {
        const mat = getMixMatrix(AudioChFormat.K7P1P4, format as AudioChFormat);
        // Check matrix is sized as expected.
        expect(mat.length === getChannelCountRaw(format));
        expect(mat[0].length === getChannelCountRaw(AudioChFormat.K7P1P4));

        if (PRINTDEBUG) {
          console.log(AudioChFormat.K7P1P4, "->", format);
          printMatrixDynamicPadding(mat);
        }
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

        if (PRINTDEBUG) {
          console.log(format, "->", AudioChFormat.K7P1P4);
          printMatrixDynamicPadding(mat);
        }
      }
    }
  });
});
