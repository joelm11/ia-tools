<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { AudioMixer } from "src/@lib/iamf_renderer/audio-mixer";
  import MixControls from "./MixControls.svelte";
  import WaveViz from "./WaveViz.svelte";
  import PBAEContainer from "./PBAEContainer.svelte";

  let { mixPresentation } = $props();
  let currentLoudnessValues = $state();
  let isPlaying = $state(false);
  let mixer: AudioMixer;
  let intervalId: number;

  async function updateLoudness() {
    mixer = await AudioMixer.getInstance();
    currentLoudnessValues = mixer.getLoudnessValues();
  }

  onMount(() => {
    intervalId = window.setInterval(updateLoudness, 1000 / 60);
  });

  onDestroy(() => {
    window.clearInterval(intervalId);
  });

  async function handlePlayPause() {
    mixer = await AudioMixer.getInstance();
    mixer.setMixPresentation(mixPresentation);
    // setMasterGain(mixPresentation.gain);
    if (mixer.playbackActive()) mixer.pause();
    else mixer.play();
    isPlaying = mixer.playbackActive();
  }

  async function setMasterGain(val: number) {
    mixPresentation.mixGain = val;
    mixer = await AudioMixer.getInstance();
    console.log("SMG:", mixPresentation.mixGain);
    mixer.setMixGain(mixPresentation.mixGain, mixPresentation.id);
  }

  async function setAEGain(aeId: string, val: number) {
    mixer = await AudioMixer.getInstance();
    mixer.getAudioElementManager().getInputGainController(aeId)?.setGain(val);
  }
</script>

<div
  class="grid grid-cols-2 bg-app border border-ae-card-background rounded-md gap-2 p-2 h-full"
>
  <div
    class="col-span-1 rounded-md bg-ae-card-background border border-card-s-text px-1 h-36 flex flex-col"
    id="wave-vis-mix-controls"
  >
    <WaveViz {currentLoudnessValues} />
    <hr class="w-11/12 mx-auto border-t border-card-p-text/50 my-2" />
    <MixControls {handlePlayPause} {setMasterGain} {isPlaying} />
  </div>
  <div class="col-span-1 flex-grow">
    <PBAEContainer {mixPresentation} {setAEGain} />
  </div>
</div>
