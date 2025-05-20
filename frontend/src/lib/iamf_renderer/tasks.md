# Mixer additional features

## Mix Presentation audio-mixer.

- [x] Add a setMixPresentation(presentation: MixPresentation) function to AudioMixer. This function should reset the audio graph. Store the playback layout from the mix presentation as a member variable.

## Master-gain-controller.

- [x] Change the master-gain-controller to output the number of channels specified in the audio-mixer's playback layout. These channels will be folded down or routed appropriately when connected to the destination node.

## New Element mixer node

- [x] Create a new ElementMixNode type.
- [x] This node should take in its contructor the input layout of the audio element that will be connected to it, and the playback layout.
- [x] This node should have its number of input channels as the channels of its input element, and its output channels as the channels of the playback layout.
- [x] This node should grab the conversion matrix from GetMixMatrix.ts. It should then apply the conversion matrix on the input buffer to the output buffer.
- [x] Add unit tests for all implemented functionality.
