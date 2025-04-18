<script lang="ts">
  import AeContainer from "./components/AEContainer/AEContainer.svelte";
  import MpContainer from "./components/MPContainer/MPContainer.svelte";
  import type { AudioElement } from "./types/AudioElement";
  import type {
    MixPresentation,
    MixPresentationAudioElement,
  } from "./types/MixPresentation";
  import { AudioChFormat } from "./types/AudioFormats";
  import { v4 as uuidv4 } from "uuid";
  import { WaveFile } from "wavefile";

  /* State for Audio Elements and Mix Presentations */
  let audioElements: AudioElement[] = $state([]);
  let mixPresentations: MixPresentation[] = $state([]);

  async function createAudioElement(file: File) {
    audioElements.push({
      name: file.name,
      id: uuidv4(),
      audioFile: file,
      audioChFormat: await audioFormatFromFile(file),
    });
  }

  async function audioFormatFromFile(file: File): Promise<AudioChFormat> {
    const characteristics = await getWavCharacteristics(file);
    if (characteristics) {
      const { numChannels, channelMask } = characteristics;
      return audioFormatFromChannels(numChannels, channelMask);
    }
    return AudioChFormat.NONE;
  }

  async function getWavCharacteristics(file: File): Promise<{
    numChannels: number;
    sampleRate: number;
    bitDepth: number;
    channelMask?: number;
  } | null> {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      if (arrayBuffer) {
        let data: Uint8Array | ArrayBuffer = arrayBuffer;
        // Check if conversion is needed
        if (!(data instanceof Uint8Array)) {
          data = new Uint8Array(arrayBuffer);
        }
        const waveFile = new WaveFile(data as Uint8Array);
        return {
          numChannels: (waveFile.fmt as any).numChannels,
          sampleRate: (waveFile.fmt as any).sampleRate,
          bitDepth: (waveFile.fmt as any).bitsPerSample,
          channelMask: (waveFile.fmt as any).dwChannelMask,
        };
      }
      return null;
    } catch (error) {
      // Log the error to the console for debugging, but return null
      console.error("Error getting WAV characteristics:", error);
      return null;
    }
  }

  async function readFileAsArrayBuffer(
    file: File
  ): Promise<ArrayBuffer | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result instanceof ArrayBuffer ? reader.result : null);
      };
      reader.onerror = () => {
        console.error("Error reading the file:", reader.error);
        resolve(null);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function audioFormatFromChannels(
    numChannels: number,
    channelMask?: number
  ): AudioChFormat {
    switch (numChannels) {
      case 1:
        return AudioChFormat.MONO;
      case 2:
        return AudioChFormat.STEREO;
      case 6:
        if (channelMask === 0x3f) {
          return AudioChFormat.K5P1;
        } else {
          return AudioChFormat.K3P1P2;
        }
      case 8:
        if (channelMask === 0x503f) {
          return AudioChFormat.K5P1P2;
        } else {
          return AudioChFormat.K7P1;
        }
      case 10:
        if (channelMask === 0x2d03f) {
          return AudioChFormat.K5P1P4;
        } else {
          return AudioChFormat.K7P1P2;
        }
      case 12:
        return AudioChFormat.K7P1P4;
    }
    return AudioChFormat.NONE;
  }

  function deleteAudioElement(idToDelete: string) {
    removeAEFromMixPresentation(idToDelete);
    audioElements = audioElements.filter(
      (element) => element.id !== idToDelete
    );
  }

  function createMixPresentation(mixPresentation: MixPresentation) {
    mixPresentation.id = uuidv4();
    mixPresentation.playbackFormat = AudioChFormat.NONE;
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
      const { id, name, playbackFormat, audioElements } = presentation;
      const mpAudioElements = audioElements.map((element) => ({
        id: element.id,
        chFormat: element.audioChFormat,
      }));
      formData.append(
        "mixPresentations",
        JSON.stringify({ id, name, playbackFormat, mpAudioElements })
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
