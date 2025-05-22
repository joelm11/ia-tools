<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import LoudnessMeters from "./loudness/LoudnessBars.svelte";
  import { AudioMixer } from "src/@lib/iamf_renderer/audio-mixer";
  import VolumeSlider from "./VolumeSlider.svelte";
  import MixControls from "./MixControls.svelte";
  import WaveViz from "./WaveViz.svelte";
  import PBAEContainer from "./PBAEContainer.svelte";

  let { mixPresentation, isPlaying = $bindable() } = $props();
  let currentLoudnessValues = $state();
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
    if (isPlaying) mixer.pause();
    else mixer.play();
    isPlaying = !isPlaying;
  }

  async function setMasterGain(val: number) {
    mixer = await AudioMixer.getInstance();
    mixer.getMasterGainController().setMasterGain(val);
  }

  async function setAEGain(aeId: string, val: number) {
    mixer = await AudioMixer.getInstance();
    mixer.getAudioElementManager().getInputGainController(aeId)?.setGain(val);
  }
</script>

<div
  class="grid grid-cols-2 bg-app border border-ae-card-background rounded-md gap-2 p-2"
>
  <div
    class="col-span-1 rounded-md bg-ae-card-background border
     border-card-s-text h-full px-1"
    id="wave-vis-mix-controls"
  >
    <WaveViz {currentLoudnessValues} />
    <hr class="w-11/12 mx-auto border-t border-card-p-text/50 my-2" />
    <MixControls {handlePlayPause} {setMasterGain} />
  </div>
  <div class="col-span-1">
    <PBAEContainer {mixPresentation} {setAEGain} />
  </div>
</div>
