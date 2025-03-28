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
    audioElements = audioElements.filter(
      (element) => element.id !== idToDelete
    );
  }

  function createMixPresentation(name: string, elements: AudioElement[]) {
    mixPresentations.push({
      name: "Default Mix Presentation",
      id: uuidv4(),
      audioElements: [],
    });
  }

  function deleteMixPresentation() {}

  function removeAEFromMixPresentation() {}
</script>

<main class="grid grid-cols-6 m-2 gap-2">
  <AeContainer {audioElements} {createAudioElement} {deleteAudioElement} />
  <MpContainer />
</main>
