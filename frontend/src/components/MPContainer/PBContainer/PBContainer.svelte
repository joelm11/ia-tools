<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import ExportForm from "./ExportForm.svelte";

  const { mixPresentations } = $props<{
    mixPresentations: MixPresentation[];
  }>();

  let activeMix: string = $state("");
  let showExportForm = $state(false);
  let exportButton: HTMLButtonElement | null = $state(null);
  let showWalkthrough = $state(false);

  function closeExportForm() {
    showExportForm = false;
    if (exportButton) {
      exportButton.blur(); // Remove focus from the button
    }
  }

  function startWalkthrough() {
    showWalkthrough = true;
    // Logic to trigger the walkthrough can be added here
  }
</script>

<div
  class="col-span-3 h-full flex flex-col text-left gap-1 bg-card-background rounded-2xl p-4 border border-ae-card-background overflow-y-auto max-h-full"
>
  <div id="pb-container-header" class="flex justify-between">
    <div class="text-card-p-text mb-1 text-2xl w-32">Playback</div>
    <div class="flex items-center gap-2">
      {#if mixPresentations.length > 0}
        <button
          bind:this={exportButton}
          onclick={() => (showExportForm = true)}
          id="export-mix-presentations"
          class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Export mix presentations as IAMF file button"
        >
          <i class="fas fa-download text-xl"></i>
        </button>
      {/if}
      <button
        onclick={startWalkthrough}
        id="walkthrough-button"
        class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
        aria-label="Start walkthrough button"
      >
        <i class="fas fa-question text-xl"></i>
      </button>
    </div>
  </div>
  <div class="border-b border-ae-card-background mb-2"></div>
  <div class="flex flex-col gap-2">
    {#each mixPresentations as mixPresentation}
      <PbElem
        {mixPresentation}
        isActive={activeMix === mixPresentation.id}
        bind:activeMix
      ></PbElem>
    {/each}
  </div>
  <ExportForm show={showExportForm} closeModal={closeExportForm}></ExportForm>
</div>
