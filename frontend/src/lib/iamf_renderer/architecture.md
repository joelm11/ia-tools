# Web Audio Mixer Architecture

This document outlines the architecture for a web-based audio mixer built using the Web Audio API and TypeScript.

## 1. Core Components

The audio mixer will primarily consist of the following components within the Web Audio API context:

- **Audio Element Manager:** Responsible for managing the input audio elements, identified by their UUID strings. It will store references to the HTMLMediaElement or other audio source objects.
- **Input Gain Controller:** For each input audio element, a `GainNode` will be created to control its individual volume. This gain node will be connected to a UI slider for user interaction.
- **Channel Mixer:** A component to handle the mixing of audio sources with varying channel layouts into a common output format before applying individual gain.
- **Master Gain Node:** A single `GainNode` that controls the overall volume of the mixed audio.
- **Output Destination:** The final `AudioDestinationNode` of the Web Audio API context, potentially configured for different output formats (though this is largely handled by the browser's audio system).
- **Playback Controller:** Manages the play/pause state of all audio sources synchronously.

## 2. Input Handling

- The `Audio Element Manager` will maintain a map where the keys are the UUID strings and the values are the corresponding audio elements (e.g., `HTMLMediaElement`).
- For each audio element registered with the manager:
  - An `AudioBufferSourceNode` (if using `AudioBuffer`) or a direct connection from an `MediaElementAudioSourceNode` (if using `HTMLMediaElement`) will be created.
  - An `Input Gain Controller` will be instantiated and associated with this audio source.

## 3. Gain Control

- Each `Input Gain Controller` will encapsulate a `GainNode`.
- The input audio source node (either `AudioBufferSourceNode` or `MediaElementAudioSourceNode`) will be connected to the input of this `GainNode`.
- The `GainNode.gain.value` will be bound to the value of the corresponding UI slider.
- The output of this `GainNode` will be passed to the `Channel Mixer`.

## 4. Channel Layout Handling

- To handle varying channel layouts, the mixer will implement a strategy to mix all inputs to a common intermediate format (e.g., stereo or a format matching the maximum number of channels across all inputs).
- This mixing can be achieved using `ChannelSplitterNode` and `ChannelMergerNode`.
- For each input source, its output (after the individual gain) will be analyzed for its channel count.
- If the input has fewer channels than the target mixing format, it will be up-mixed (e.g., by duplicating channels or using a more sophisticated spatialization technique if desired).
- If the input has more channels, it will be down-mixed (e.g., by averaging channels).
- The specific mixing logic will depend on the desired output and the characteristics of the input audio. A simplified approach could be to always mix to stereo by taking the first channel as left and the second as right (if available) and discarding or averaging additional channels. More advanced scenarios might involve preserving spatial information.

## 5. Master Mixer

- The outputs of all the `Channel Mixer` instances (or directly from the individual `GainNode` if a common channel format is assumed for simplicity initially) will be connected to the input of the `Master Gain Node`.
- The `Master Gain Node` will have its `gain.value` potentially controlled by another UI element for overall volume.
- The output of the `Master Gain Node` will be connected to the `AudioDestinationNode` of the `AudioContext`.

## 6. Output Formats

- The Web Audio API primarily outputs to the system's audio output as configured for the `AudioContext`.
- To support different output formats (e.g., downloading a mixed file in a specific format), additional processing would be required, potentially involving:
  - Recording the output of the `Master Gain Node` using `MediaRecorder` with a `MediaStream` created from the `AudioContext`.
  - Server-side processing if more complex format conversions are needed beyond what the browser's `MediaRecorder` supports.

## 7. Play/Pause Synchronization

- A `Playback Controller` will manage the overall playback state.
- When the user initiates play:
  - For each `AudioBufferSourceNode`, its `start()` method will be called (keeping track of the offset if paused).
  - For each `MediaElementAudioSourceNode` connected to an `<audio>` element, the `<audio>.play()` method will be called.
- When the user initiates pause:
  - For each `AudioBufferSourceNode`, its `stop()` method will be called (and the current playback position will be stored).
  - For each `MediaElementAudioSourceNode`, the `<audio>.pause()` method will be called.
- To ensure consistent pausing and resuming across sources of different lengths:
  - The `Playback Controller` should ideally manage a central time reference (e.g., using the `AudioContext.currentTime`).
  - For `AudioBufferSourceNode`s, the `start()` method can take an offset parameter to resume from the correct position.
  - For `HTMLMediaElement` sources, the `currentTime` property can be used to manage the playhead position.
  - Consider the case where some sources might end before others. The `Playback Controller` might need to track the active state of each source.

## 8. TypeScript Implementation Considerations

- TypeScript's strong typing will be beneficial for managing the Web Audio API nodes and their connections.
- Interfaces can be defined for the `Audio Element Manager`, `Input Gain Controller`, and `Playback Controller` to enforce structure and improve code maintainability.
- Enums can be used to represent different playback states (e.g., Playing, Paused, Stopped).
