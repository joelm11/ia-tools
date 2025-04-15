<script lang="ts">
  import AeContainer from "./components/AEContainer/AEContainer.svelte";
  import MpContainer from "./components/MPContainer/MPContainer.svelte";

  import type { AudioElement } from "./types/AudioElement";
  import type { MixPresentation } from "./types/MixPresentation";
  import { v4 as uuidv4 } from "uuid";

  /* State for Audio Elements and Mix Presentations */
  let audioElements: AudioElement[] = $state([]);
  let mixPresentations: MixPresentation[] = $state([]);

  function createAudioElement(file: File) {
    audioElements.push({
      name: file.name,
      id: uuidv4(),
      audioFile: file,
    });
  }

  function deleteAudioElement(idToDelete: string) {
    removeAEFromMixPresentation(idToDelete);
    audioElements = audioElements.filter(
      (element) => element.id !== idToDelete
    );
  }

  function createMixPresentation(mixPresentation: MixPresentation) {
    mixPresentation.id = uuidv4();
    mixPresentations.push(mixPresentation);
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

<div class="min-h-screen bg-app">
  <main class="col-span-5 grid grid-cols-5 h-screen p-4 gap-2">
    <AeContainer {audioElements} {createAudioElement} {deleteAudioElement} />
    <MpContainer
      {audioElements}
      {mixPresentations}
      {createMixPresentation}
      {deleteMixPresentation}
      {removeAEFromMixPresentation}
    />
  </main>
</div>
