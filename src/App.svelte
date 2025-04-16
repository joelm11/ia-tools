<script lang="ts">
  import AeContainer from "./components/AEContainer/AEContainer.svelte";
  import MpContainer from "./components/MPContainer/MPContainer.svelte";

  import type { AudioElement } from "./types/AudioElement";
  import type {
    MixPresentation,
    MixPresentationAudioElement,
  } from "./types/MixPresentation";
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
    // Send to server.
    // logAudioElementCreation(file);
  }

  // // Log audio element creation on server.
  // async function logAudioElementCreation(file: File) {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   try {
  //     const response = await fetch("http://localhost:3000/log", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error("Error sending form data:", error);
  //   }
  // }

  function deleteAudioElement(idToDelete: string) {
    removeAEFromMixPresentation(idToDelete);
    audioElements = audioElements.filter(
      (element) => element.id !== idToDelete
    );
  }

  function createMixPresentation(mixPresentation: MixPresentation) {
    mixPresentation.id = uuidv4();
    mixPresentations.push(mixPresentation);
    sendMixPresentations();
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

  // Send mix presentations to server.
  async function sendMixPresentations() {
    const formData = new FormData();
    // Append data for each mix presentation. We only attach the id of the audio elements here.
    for (const presentation of mixPresentations) {
      const { id, name, audioElements } = presentation;
      const mpAudioElements = audioElements.map((element) => ({
        id: element.id,
        name: element.name,
      }));
      formData.append(
        "mixPresentations",
        JSON.stringify({ id, name, mpAudioElements })
      );
      // Append audio element files to the form data.
      for (const element of audioElements) {
        formData.append("audioFiles", element.audioFile);
      }
    }
    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      // TODO: Optional response status check.
    } catch (error) {
      console.error("Error sending mix presentations:", error);
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
