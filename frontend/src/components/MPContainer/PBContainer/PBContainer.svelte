<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import { PresentationMixer } from "src/@lib/mixer/PresentationMixer.svelte";

  const { mixPresentations } = $props<{
    mixPresentations: MixPresentation[];
  }>();

  const presentationMixer = $state<PresentationMixer>(new PresentationMixer());
</script>

<div
  class="col-span-3 h-full flex flex-col text-left gap-1 bg-card-background rounded-2xl p-4 border border-ae-card-background"
>
  <div class="text-card-p-text mb-1 text-2xl">Playback</div>
  <div class="border-b border-ae-card-background mb-2"></div>
  <div class="flex flex-col gap-2">
    {#each mixPresentations as mixPresentation}
      <PbElem {mixPresentation} {presentationMixer}></PbElem>
    {/each}
  </div>
</div>
