import { writable } from "svelte/store";
import type { MixPresentation } from "src/@types/MixPresentation";

const mixPresentationsStore = writable<MixPresentation[]>([]);

export default mixPresentationsStore;
