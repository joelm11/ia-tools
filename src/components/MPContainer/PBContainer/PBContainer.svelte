<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import { AudioMixer } from "src/@lib/mixer/Mixer.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";

  interface Props {
    mixPresentations: MixPresentation[];
  }

  let { mixPresentations }: Props = $props();
  let mixer: AudioMixer;

  // onMount(() => {
  //   mixer = new AudioMixer();

  //   // Add existing tracks
  //   mixPresentations.forEach((mp: MixPresentation) => {
  //     if (mp.audio) {
  //       mixer.addTrack({
  //         audio: mp.audio,
  //         gain: mp.gain || 1,
  //       });
  //     }
  //   });
  // });

  // onDestroy(() => {
  //   if (mixer) {
  //     mixer.disconnect();
  //   }
  // });
</script>

<div class="flex flex-col col-span-3 bg-gray-300 h-full p-2 gap-2">
  {#each mixPresentations as mixPresentation}
    <PbElem {mixPresentation}></PbElem>
  {/each}
</div>
