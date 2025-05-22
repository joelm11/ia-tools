import type { AudioElement } from "src/@types/AudioElement";
import { v4 as uuidv4 } from "uuid";
import type { AudioChFormat } from "src/@types/AudioFormats";
import { audioFormatFromFile } from "../WaveUtils";
import { getMixPresentations } from "./MixPresentationState.svelte";

let audioElements: AudioElement[] = $state([]);

function getAudioElements(): AudioElement[] {
  return audioElements;
}

async function createAudioElement(file: File) {
  const audioChFormat: AudioChFormat = await audioFormatFromFile(file);
  audioElements.push({
    name: file.name,
    id: uuidv4(),
    audioFile: file,
    audioChFormat: audioChFormat,
    gain: 50,
  });
  console.log(
    "Audio element created",
    $state.snapshot(audioElements[audioElements.length - 1])
  );
}

function deleteAudioElement(idToDelete: string) {
  const index = audioElements.findIndex((element) => element.id === idToDelete);
  if (index !== -1) {
    // Have to splice for Svelte to detect the change >.<
    audioElements.splice(index, 1);
  }

  // Remove from all mix presentations
  const mixPresentations = getMixPresentations();
  mixPresentations.forEach((presentation) => {
    presentation.audioElements = presentation.audioElements.filter(
      (element) => element.id !== idToDelete
    );
  });
}

export { getAudioElements, createAudioElement, deleteAudioElement };
