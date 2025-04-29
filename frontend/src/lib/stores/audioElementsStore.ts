import { writable } from "svelte/store";
import type { AudioElement } from "src/@types/AudioElement";

const audioElementsStore = writable<AudioElement[]>([]);

export default audioElementsStore;
