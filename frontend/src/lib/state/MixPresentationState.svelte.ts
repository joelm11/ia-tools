import type { MixPresentation } from "src/@types/MixPresentation";
import { v4 as uuidv4 } from "uuid";
import { getAudioElements } from "./AudioElementState.svelte";

let mixPresentations: MixPresentation[] = $state([]);

function getMixPresentations(): MixPresentation[] {
  return mixPresentations;
}

function createMixPresentation(mixPresentation: MixPresentation) {
  mixPresentation.id = uuidv4();
  mixPresentations.push(mixPresentation);
  console.log(
    "Mix presentation created",
    $state.snapshot(mixPresentations[mixPresentations.length - 1])
  );
}

function deleteMixPresentation(idToDelete: string) {
  const index = mixPresentations.findIndex((pres) => pres.id === idToDelete);
  if (index !== -1) {
    // Have to splice for Svelte to detect the change >.<
    mixPresentations.splice(index, 1);
  }
}

function removeAEFromMixPresentation(idToDelete: string) {
  mixPresentations = mixPresentations.map((presentation) => ({
    ...presentation,
    audioElements: presentation.audioElements.filter(
      (element) => element.id !== idToDelete
    ),
  }));
}

// Format and send mix presentations to the server.
// We serialize mix presentations and audio elements to their base formats and attach referenced files to the form data.
async function sendMixPresentations() {
  const formData = new FormData();
  // Construct a set of audio elements to avoid duplicates.
  const activeAudioElementSet = new Set<string>();
  for (const presentation of getMixPresentations()) {
    const { audioElements, ...rest } = presentation;
    const baseAudioElements = audioElements.map(
      ({ audioFile, ...audioElementBase }) => audioElementBase
    );
    const serializablePresentation = {
      ...rest,
      audioElements: baseAudioElements,
    };
    for (const element of audioElements) {
      activeAudioElementSet.add(element.id);
    }

    formData.append(
      "mixPresentations",
      JSON.stringify(serializablePresentation)
    );
  }
  // Append active audio element files to the form data.
  const currentAudioElements = getAudioElements();
  currentAudioElements
    .filter((element) => activeAudioElementSet.has(element.id))
    .forEach((element) => {
      formData.append("audioFiles", element.audioFile);
    });
  let jobId = -1;
  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });
    const responseData = JSON.parse(await response.text()) as {
      urls: any;
      jobID: any;
    };
    console.log(responseData);
    return responseData.jobID;
  } catch (error) {
    console.error("Error sending mix presentations:", error);
  }
  return jobId;
}

export {
  getMixPresentations,
  createMixPresentation,
  deleteMixPresentation,
  removeAEFromMixPresentation,
  sendMixPresentations,
};
