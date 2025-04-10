<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import { PresentationMixer } from "src/@lib/mixer/PresentationMixer.svelte";

  const { mixPresentations } = $props<{
    mixPresentations: MixPresentation[];
  }>();

  const presentationMixer = $state<PresentationMixer>(new PresentationMixer());
</script>

<div class="flex flex-col col-span-3 bg-gray-300 h-full p-2 gap-2">
  {#each mixPresentations as mixPresentation}
    <PbElem {mixPresentation} {presentationMixer}></PbElem>
  {/each}
</div>
