import { channelGroupings, type AudioChFormat } from "src/@types/AudioFormats";
import { getDownmixGainMatrix } from "./DownMixer";

function getMixMatrix(input: AudioChFormat, output: AudioChFormat): number[][] {
  if (upmixRequired(input, output)) {
    const mat = getDownmixGainMatrix(output, input);
    return deriveUpmixPassThroughMatrix(mat);
  } else {
    return getDownmixGainMatrix(input, output);
  }
}

function upmixRequired(input: AudioChFormat, output: AudioChFormat): boolean {
  const inputSurCG = channelGroupings[input].surr;
  const OutputSurCG = channelGroupings[output].surr;
  const inputTopCG = channelGroupings[input].tops;
  const outputTopCG = channelGroupings[output].tops;
  if (outputTopCG) {
    if (!inputTopCG || inputTopCG < outputTopCG) {
      return true;
    }
  }
  if (inputSurCG < OutputSurCG) return true;
  return false;
}

// Transposes matrix and makes non-zero entries unity.
function deriveUpmixPassThroughMatrix(downmixMatrix: number[][]) {
  // Basic validation
  if (
    !Array.isArray(downmixMatrix) ||
    downmixMatrix.length === 0 ||
    !Array.isArray(downmixMatrix[0])
  ) {
    console.error("Input must be a non-empty 2D array.");
    throw new Error("Invalid input: Must be a non-empty 2D array.");
  }

  const numDownmixOutputChannels = downmixMatrix.length; // Number of rows in downmix = number of output channels
  const numDownmixInputChannels = downmixMatrix[0].length; // Number of columns in downmix = number of input channels

  // The transposed matrix will have dimensions swapped:
  // Number of rows in upmix = numDownmixInputChannels
  // Number of columns in upmix = numDownmixOutputChannels
  const numUpmixOutputChannels = numDownmixInputChannels;
  const numUpmixInputChannels = numDownmixOutputChannels;

  // Use Array.from and map to build the transposed matrix
  // We create an array representing the columns of the original matrix (which become rows in the transposed)
  // Then, for each original column index (j), we map over the original rows (i)
  // to get the element at downmixMatrix[i][j] and determine the value for the transposed matrix.
  const upmixMatrix = Array.from(
    { length: numUpmixOutputChannels },
    (_, upmixOutputCh) =>
      downmixMatrix.map((downmixRow) => {
        // In the transposed matrix, the original row index (i) becomes the column index,
        // and the original column index (j) becomes the row index.
        // So, downmixMatrix[i][j] corresponds to upmixMatrix[j][i].
        // Here, `upmixOutputCh` corresponds to the original column index (j),
        // and the `downmixRow` iteration implicitly gives us the original row index (i).
        const originalValue = downmixRow[upmixOutputCh];

        // Set the value to 1 if the original value was non-zero, otherwise 0
        return originalValue !== 0 ? 1 : 0;
      })
  );

  return upmixMatrix;
}

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

export { getMixMatrix, printMatrixDynamicPadding };
