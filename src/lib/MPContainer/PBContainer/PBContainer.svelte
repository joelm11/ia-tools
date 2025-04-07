<script lang="ts">
  import PbElem from "./PBElem.svelte";

  let { mixPresentations } = $props();
</script>

<div class="flex flex-col col-span-3 bg-gray-300 h-full p-2 gap-2">
  {#each mixPresentations as mixPresentation}
    <PbElem {mixPresentation}></PbElem>
  {/each}
</div>
