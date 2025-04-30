import type { MixPresentation } from "src/@types/MixPresentation";
import { v4 as uuidv4 } from "uuid";

let mixPresentations: MixPresentation[] = $state([]);

function getMixPresentations(): MixPresentation[] {
  return mixPresentations;
}

function createMixPresentation(mixPresentation: MixPresentation) {
  mixPresentation.id = uuidv4();
  mixPresentations.push(mixPresentation);
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

export {
  getMixPresentations,
  createMixPresentation,
  deleteMixPresentation,
  removeAEFromMixPresentation,
};
