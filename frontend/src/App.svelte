<script lang="ts">
  import AeContainer from "./components/AEContainer/AEContainer.svelte";
  import MpContainer from "./components/MPContainer/MPContainer.svelte";
  import { getAudioElements } from "./lib/state/AudioElementState.svelte";
  import {
    createMixPresentation,
    deleteMixPresentation,
    removeAEFromMixPresentation,
  } from "./lib/state/MixPresentationState.svelte";

  // // Format and send mix presentations to the server.
  // // We serialize mix presentations and audio elements to their base formats and attach referenced files to the form data.
  // async function sendMixPresentations() {
  //   const formData = new FormData();
  //   // Construct a set of audio elements to avoid duplicates.
  //   const activeAudioElementSet = new Set<string>();
  //   for (const presentation of mixPresentations) {
  //     const { audioElements, ...rest } = presentation;
  //     const baseAudioElements = audioElements.map(
  //       ({ audioFile, ...audioElementBase }) => audioElementBase
  //     );
  //     const serializablePresentation = {
  //       ...rest,
  //       audioElements: baseAudioElements,
  //     };
  //     for (const element of audioElements) {
  //       activeAudioElementSet.add(element.id);
  //     }

  //     formData.append(
  //       "mixPresentations",
  //       JSON.stringify(serializablePresentation)
  //     );
  //   }
  //   // Append active audio element files to the form data.
  //   const currentAudioElements = audioElements;
  //   currentAudioElements
  //     .filter((element) => activeAudioElementSet.has(element.id))
  //     .forEach((element) => {
  //       formData.append("audioFiles", element.audioFile);
  //     });
  //   try {
  //     const response = await fetch("http://localhost:3000/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await response.json();
  //     // TODO: Optional response status check.
  //   } catch (error) {
  //     console.error("Error sending mix presentations:", error);
  //   }
  // }
</script>

<div class="min-h-screen bg-app">
  <main class="col-span-5 grid grid-cols-5 h-screen p-4 gap-2">
    <AeContainer />
    <MpContainer />
  </main>
</div>
