<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import { AudioMixer } from "src/@lib/mixer/PresentationMixer.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";

  interface Props {
    mixPresentations: MixPresentation[];
  }

  let { mixPresentations }: Props = $props();
  let mixer: AudioMixer;
</script>

<div class="flex flex-col col-span-3 bg-gray-300 h-full p-2 gap-2">
  {#each mixPresentations as mixPresentation}
    <PbElem {mixPresentation}></PbElem>
  {/each}
</div>
