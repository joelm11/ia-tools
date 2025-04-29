<script lang="ts">
  import { AudioChFormat } from "src/@types/AudioFormats";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import type { AudioElement } from "src/@types/AudioElement";
  import { fade } from "svelte/transition";

  let {
    isOpen = false,
    onClose,
    createMixPresentation,
    audioElements = [],
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    createMixPresentation: (mixPresentation: MixPresentation) => void;
    audioElements: AudioElement[];
  }>();

  let mixPresentation: MixPresentation = $state({
    name: "",
    description: "",
    id: "",
    playbackFormat: AudioChFormat.STEREO,
    mixGain: 0.5,
    audioElements: [],
  });

  function handleSubmit() {
    const mixPresentationCopy = { ...mixPresentation };
    createMixPresentation(mixPresentationCopy);
    // Reset form.
    mixPresentation.name = "";
    mixPresentation.description = "";
    mixPresentation.playbackFormat = AudioChFormat.STEREO;
    mixPresentation.mixGain = 0.5;
    mixPresentation.audioElements = [];
    onClose();
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    handleSubmit();
  }

  function handleCheckboxChange(audioElement: AudioElement, checked: boolean) {
    if (checked) {
      mixPresentation.audioElements = [
        ...mixPresentation.audioElements,
        audioElement,
      ];
    } else {
      mixPresentation.audioElements = mixPresentation.audioElements.filter(
        (el) => el.id !== audioElement.id
      );
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="bg-slate-800 rounded-lg shadow-xl border border-slate-600 w-full max-w-md"
      aria-labelledby="modal-title"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div
        class="flex justify-between items-center border-b border-slate-600 p-4 sm:p-6"
      >
        <h3 id="modal-title" class="text-xl font-semibold text-slate-200">
          Add Mix Presentation
        </h3>
        <button
          onclick={onClose}
          class="text-slate-400 hover:text-slate-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <form onsubmit={handleFormSubmit} class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-slate-400 mb-1">Name</label
            >
            <input
              type="text"
              id="name"
              bind:value={mixPresentation.name}
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="Mix Presentation Name"
              required
            />
          </div>
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-slate-400 mb-1"
              >Description</label
            >
            <textarea
              id="description"
              bind:value={mixPresentation.description}
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="Description..."
            ></textarea>
          </div>
        </div>
        <div>
          <label
            for="playback-format"
            class="block text-sm font-medium text-slate-400 mb-1"
            >Playback Format</label
          >
          <select
            id="playback-format"
            bind:value={mixPresentation.playbackFormat}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition mb-1"
          >
            {#each Object.values(AudioChFormat) as format}
              <option value={format}>{format}</option>
            {/each}
          </select>
        </div>
        <div>
          <label
            for="form-audio-elements"
            class="block text-sm font-medium text-slate-400"
            >Audio Elements</label
          >
          <div
            id="form-audio-elements"
            class="m-1 flex flex-wrap items-start justify-start gap-2 space-y-2 max-h-48 overflow-y-auto"
          >
            {#each audioElements as audioElement}
              <div
                class="flex cursor-pointer items-center space-x-3 rounded-md border-2 p-2 border-card-h-line hover:ring-1 hover:ring-cyan-500 hover:border-cyan-500 gap-1"
              >
                <input
                  type="checkbox"
                  id={audioElement.id}
                  value={audioElement.name}
                  class="h-5 w-5 accent-mp-card-t-background"
                  onchange={(e) =>
                    handleCheckboxChange(audioElement, e.currentTarget.checked)}
                />
                <span class="font-medium text-gray-300">
                  <label for={audioElement.id}>{audioElement.name}</label>
                </span>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-600 pt-4 mt-4">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
