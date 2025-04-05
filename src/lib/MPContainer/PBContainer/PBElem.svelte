<script lang="ts">
  import PbElemAe from "./PBElemAE.svelte";
</script>

<div class="grid grid-cols-6 bg-gray-200 p-2 gap-2">
  <!-- Play and Volume -->
  <div id="play-and-volume" class="col-span-2 h-24 flex items-center">
    <button
      class="p-2 hover:bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center"
      aria-label="Play Mix Presentation"
    >
      <i class="fas fa-play text-2xl"></i>
    </button>
  </div>
  <!-- Placeholder for waveform -->
  <div class="col-span-4 h-24 flex items-center">Placeholder for Waveform</div>
  <!-- Render Audio Elements -->
  <div class="col-span-3">
    <PbElemAe></PbElemAe>
  </div>
</div>
