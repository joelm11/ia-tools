<script lang="ts">
  import { tick } from "svelte"; // For focusing after opening
  import { fade } from "svelte/transition";

  // Props - control visibility from parent
  let { show, closeModal } = $props();

  // Internal state for the form
  let filename = $state("My_Awesome_Mix");
  let format = $state("wav");
  let quality = $state("320"); // Default quality

  let modalElement: HTMLDivElement;

  function handleExport(event: { preventDefault: () => void }) {
    event.preventDefault(); // Prevent default form submission
    console.log("Exporting:", { filename, format, quality });
    // Add your actual file export logic here
    closeModal(); // Close modal after "export"
  }

  // Effect to handle Escape key press for closing the modal
  $effect(() => {
    const handleKeydown = (event: { key: string }) => {
      if (event.key === "Escape" && show) {
        closeModal();
        console.log("Escape key pressed, closing modal");
      }
    };

    if (show && typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown);
    } else if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }

    // Cleanup function for the effect
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
    };
  });

  function handleBackdropClick(event: any) {
    // Check if the click is not directly on the backdrop (modalElement)
    if (event.target === modalElement) {
      closeModal();
    }
  }
</script>

{#if show}
  <div
    bind:this={modalElement}
    transition:fade={{ duration: 100 }}
    onclick={handleBackdropClick}
    onkeydown={handleBackdropClick}
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ease-in-out"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      onclick={(e) => e.stopPropagation()}
      role="presentation"
      class="bg-slate-800 w-full max-w-md rounded-lg shadow-xl border border-slate-600"
      aria-labelledby="modal-title"
    >
      <div
        class="flex justify-between items-center border-b border-slate-600 p-4 sm:p-6"
      >
        <h2 id="modal-title" class="text-xl font-semibold text-slate-200">
          Export File
        </h2>
        <button
          onclick={closeModal}
          class="text-slate-400 hover:text-slate-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <form onsubmit={handleExport} class="p-4 sm:p-6">
        <div class="mb-4">
          <label
            for="filename"
            class="block text-sm font-medium text-slate-400 mb-1"
            >Filename</label
          >
          <input
            type="text"
            id="filename"
            name="filename"
            bind:value={filename}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        </div>

        <div class="mb-4">
          <label
            for="format"
            class="block text-sm font-medium text-slate-400 mb-1">Format</label
          >
          <div class="relative">
            <select
              id="format"
              name="format"
              bind:value={format}
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none transition"
            >
              <option value="wav">WAV (.wav)</option>
              <option value="mp3">MP3 (.mp3)</option>
              <option value="ogg">Ogg Vorbis (.ogg)</option>
              <option value="flac">FLAC (.flac)</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {#if format === "mp3"}
          <div class="mb-6">
            <label
              for="quality"
              class="block text-sm font-medium text-slate-400 mb-1"
            >
              Quality (MP3 Bitrate)
            </label>
            <div class="relative">
              <select
                id="quality"
                name="quality"
                bind:value={quality}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none transition"
              >
                <option value="320">320 kbps (Highest)</option>
                <option value="256">256 kbps</option>
                <option value="192">192 kbps (Standard)</option>
                <option value="128">128 kbps (Low)</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
              >
                <svg
                  class="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        {/if}

        <div
          class="flex justify-end space-x-3 border-t border-slate-600 pt-4 mt-4"
        >
          <button
            type="button"
            onclick={closeModal}
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Export
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
