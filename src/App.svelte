<script lang="ts">
  import AeContainer from "./lib/AEContainer/AEContainer.svelte";
  import MpContainer from "./lib/MPContainer/MPContainer.svelte";
  import type { AudioElement } from "./types/AudioElement";
  import type { MixPresentation } from "./types/MixPresentation";
  import { v4 as uuidv4 } from "uuid";

  /* State for Audio Elements and Mix Presentations */
  let audioElements: AudioElement[] = $state([]);
  let mixPresentations: MixPresentation[] = $state([]);

  function createAudioElement(filename: string) {
    audioElements.push({
      name: filename,
      id: uuidv4(),
    });
  }

  function deleteAudioElement(idToDelete: string) {
    removeAEFromMixPresentation(idToDelete);
    audioElements = audioElements.filter(
      (element) => element.id !== idToDelete
    );
  }

  function createMixPresentation(
    name: string,
    desc: string,
    elements: AudioElement[]
  ) {
    mixPresentations.push({
      name: name,
      description: desc,
      id: uuidv4(),
      audioElements: elements,
    });
  }

  function deleteMixPresentation(idToDelete: string) {
    mixPresentations = mixPresentations.filter(
      (presentation) => presentation.id !== idToDelete
    );
  }

  function removeAEFromMixPresentation(idToDelete: string) {
    for (const presentation of mixPresentations) {
      presentation.audioElements = presentation.audioElements.filter(
        (element) => element.id !== idToDelete
      );
    }
  }
</script>

<main class="grid grid-cols-6 gap-2 bg-gray-400 min-h-screen w-full m-0">
  <AeContainer {audioElements} {createAudioElement} {deleteAudioElement} />
  <MpContainer
    {audioElements}
    {mixPresentations}
    {createMixPresentation}
    {deleteMixPresentation}
    {removeAEFromMixPresentation}
  />
</main>
