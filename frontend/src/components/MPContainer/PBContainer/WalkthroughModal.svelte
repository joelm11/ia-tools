<script lang="ts">
  import { fade } from "svelte/transition";
  import WalkthroughContent from "../WalkthroughContent.svelte";

  let { show, closeModal } = $props();

  let modalElement: HTMLDivElement;

  function handleBackdropClick(event: any) {
    if (event.target === modalElement) {
      closeModal();
    }
  }

  $effect(() => {
    const handleKeydown = (event: { key: string }) => {
      if (event.key === "Escape" && show) {
        closeModal();
      }
    };

    if (show && typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown);
    } else if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
    };
  });
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    bind:this={modalElement}
    transition:fade={{ duration: 100 }}
    onclick={handleBackdropClick}
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ease-in-out"
    role="dialog"
    aria-modal="true"
    aria-labelledby="walkthrough-modal-title"
    tabindex="-1"
  >
    <div
      onclick={(e) => e.stopPropagation()}
      role="presentation"
      class="bg-slate-800 w-full max-w-lg rounded-lg shadow-xl border border-slate-600"
      aria-labelledby="walkthrough-modal-title"
    >
      <div
        class="flex justify-between items-center border-b border-slate-600 p-4 sm:p-6"
      >
        <h2
          id="walkthrough-modal-title"
          class="text-xl font-semibold text-slate-200"
        >
          Walkthrough
        </h2>
        <button
          onclick={closeModal}
          class="text-slate-400 hover:text-slate-500 active:text-slate-600 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div class="p-4 sm:p-6 text-slate-200">
        <WalkthroughContent></WalkthroughContent>
      </div>
      <div class="flex justify-around border-t border-slate-600 p-4 sm:p-6">
        <div class="mt-6 text-xs text-gray-500">
          <p>This product is not endorsed by the AOM, Google, nor Samsung.</p>
          <a
            href="mailto:developer@example.com"
            class="flex items-center mt-2 text-blue-500 hover:underline"
          >
            Contact Developer
          </a>
        </div>
        <button
          onclick={closeModal}
          class="px-4 py-2 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-slate-200 font-medium rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
