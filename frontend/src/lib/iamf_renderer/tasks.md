# MVP Step-by-Step Plan

## Phase 1: Core Structure and Input Management

- [x] **Task:** Create an `src` folder and a file `audio-element-manager.ts`. Define an empty class `AudioElementManager`.

  - **Start:** Create the file and class definition.
  - **End:** Empty `AudioElementManager` class defined.
  - **Focus:** Class definition.
  - **Test:** Check if the file exists and the class is defined.

- [x] **Task:** In `audio-element-manager.ts`, add a private property `audioElements` of type `Map<string, HTMLMediaElement | AudioBuffer>`.

  - **Start:** Add the property declaration.
  - **End:** `audioElements` property declared.
  - **Focus:** Data storage.
  - **Test:** Inspect the class structure for the property.

- [x] **Task:** In `audio-element-manager.ts`, implement a public method `registerAudioElement(uuid: string, element: HTMLMediaElement | AudioBuffer): void` that adds the element to the `audioElements` map using the provided UUID.

  - **Start:** Implement the method signature and logic.
  - **End:** `registerAudioElement` method implemented.
  - **Focus:** Adding audio elements.
  - **Test:** Create an instance of `AudioElementManager` and call `registerAudioElement` with a mock UUID and element. Verify the element is in the `audioElements` map.

- [x] **Task:** Create a test file `test/audio-element-manager.test.ts` and write a basic test case using a testing framework (e.g., Jest or Mocha with Chai) to verify the `registerAudioElement` method.
  - **Start:** Set up the test file and basic structure.
  - **End:** Test case verifying `registerAudioElement` functionality.
  - **Focus:** Testing input registration.
  - **Test:** Run the test to ensure an element can be registered.

## Phase 2: Gain Control

- [x] **Task:** Create a new file `input-gain-controller.ts`. Define a class `InputGainController` that takes an `AudioContext` object in its constructor and creates a private `GainNode` property.

  - **Start:** Create the file and class with constructor and property.
  - **End:** `InputGainController` class with `GainNode` created.
  - **Focus:** Gain node creation.
  - **Test:** Instantiate `InputGainController` and check if the `GainNode` property exists.

- [x] **Task:** In `input-gain-controller.ts`, implement a public method `getGainNode(): GainNode` that returns the internal `GainNode`.

  - **Start:** Implement the getter method.
  - **End:** `getGainNode` method implemented.
  - **Focus:** Accessing the gain node.
  - **Test:** Instantiate `InputGainController` and call `getGainNode`. Verify that it returns a `GainNode` object.

- [x] **Task:** In `input-gain-controller.ts`, implement a public method `setGain(value: number): void` that sets the `gain.value` of the internal `GainNode`.

  - **Start:** Implement the method to update gain value.
  - **End:** `setGain` method implemented.
  - **Focus:** Controlling gain.
  - **Test:** Instantiate `InputGainController`, call `setGain` with a specific value, and then check the `gain.value` of the internal `GainNode`.

- [x] **Task:** Create a test file `test/input-gain-controller.test.ts` and write test cases to verify the `getGainNode` and `setGain` methods of the `InputGainController`.
  - **Start:** Set up the test file and test cases.
  - **End:** Tests verifying gain node access and value setting.
  - **Focus:** Testing gain control.
  - **Test:** Run the tests to ensure gain node access and control work correctly.

## Phase 3: Connecting Inputs to Gain

- [x] **Task:** In `audio-element-manager.ts`, modify the `registerAudioElement` method to also create an `InputGainController` for each registered `HTMLMediaElement`. Store the `InputGainController` in the `audioElements` map instead of just the `HTMLMediaElement`. You'll need to pass an `AudioContext` instance to `AudioElementManager`.

  - **Start:** Modify `registerAudioElement` to instantiate `InputGainController`.
  - **End:** `AudioElementManager` creates and stores `InputGainController`.
  - **Focus:** Linking audio elements to gain control.
  - **Test:** Register an audio element and check if the value in the `audioElements` map is an instance of `InputGainController`.

- [x] **Task:** In `audio-element-manager.ts`, implement a public method `getInputGainController(uuid: string): InputGainController | undefined` to retrieve the `InputGainController` for a given UUID.

  - **Start:** Implement the retrieval method.
  - **End:** Method to get `InputGainController` by UUID.
  - **Focus:** Accessing gain controller.
  - **Test:** Register an audio element and then use `getInputGainController` to retrieve its controller. Verify the returned object is an instance of `InputGainController`.

- [x] **Task:** In `audio-element-manager.ts`, when registering an `HTMLMediaElement`, create a `MediaElementAudioSourceNode` using the `AudioContext` and connect its output to the input of the newly created `InputGainController`'s `GainNode`.
  - **Start:** Modify `registerAudioElement` to create and connect the source node.
  - **End:** Audio element connected to its gain node.
  - **Focus:** Connecting audio source to gain.
  - **Test:** Register an `HTMLMediaElement`, get its `InputGainController`, and verify that the `GainNode`'s input is connected to a `MediaElementAudioSourceNode` (this might require internal knowledge or a helper method for verification). For now, you can assume correctness if no errors are thrown.

## Phase 4: Master Gain

- [x] **Task:** Create a new file `master-gain-controller.ts`. Define a class `MasterGainController` that takes an `AudioContext` in its constructor and creates a private `GainNode` for the master volume.

  - **Start:** Create the file and class with constructor and property.
  - **End:** `MasterGainController` class with `GainNode` created.
  - **Focus:** Master gain node creation.
  - **Test:** Instantiate `MasterGainController` and check if the `GainNode` property exists.

- [x] **Task:** In `master-gain-controller.ts`, implement a public method `getMasterGainNode(): GainNode` to get the master `GainNode`.

  - **Start:** Implement the getter method.
  - **End:** `getMasterGainNode` method implemented.
  - **Focus:** Accessing master gain node.
  - **Test:** Instantiate `MasterGainController` and call `getMasterGainNode`. Verify it returns a `GainNode`.

- [x] **Task:** In `master-gain-controller.ts`, implement a public method `setMasterGain(value: number): void` to set the `gain.value` of the master `GainNode`.
  - **Start:** Implement the method to set master gain.
  - **End:** `setMasterGain` method implemented.
  - **Focus:** Controlling master gain.
  - **Test:** Instantiate `MasterGainController`, set the gain, and verify the `gain.value` of the internal node.

## Phase 5: Basic Mixer Class and Connection

- [x] **Task:** Create a new file `audio-mixer.ts`. Define a class `AudioMixer` that takes an `AudioContext` in its constructor and instantiates `AudioElementManager` and `MasterGainController`.

  - **Start:** Create the file and class with constructor and member instances.
  - **End:** `AudioMixer` class with `AudioElementManager` and `MasterGainController`.
  - **Focus:** Mixer orchestration.
  - **Test:** Instantiate `AudioMixer` and check if `AudioElementManager` and `MasterGainController` instances are created.

- [x] **Task:** In `audio-mixer.ts`, implement a method `registerElement(uuid: string, element: HTMLMediaElement | AudioBuffer): void` that calls the `registerAudioElement` method of the `AudioElementManager`.

  - **Start:** Implement the element registration proxy method.
  - **End:** `registerElement` method in `AudioMixer`.
  - **Focus:** Proxying element registration.
  - **Test:** Instantiate `AudioMixer`, call `registerElement`, and verify the element is registered in the `AudioElementManager` (you might need a getter in `AudioElementManager` for this).

- [x] **Task:** In `audio-mixer.ts`, implement a method `connectInputToMaster(uuid: string): void`. This method should get the `GainNode` for the given UUID from the `AudioElementManager` and connect its output to the input of the `MasterGainController`'s `GainNode`.

  - **Start:** Implement the method to connect individual gain to master gain.
  - **End:** Input connected to master output.
  - **Focus:** Connecting audio paths.
  - **Test:** Register an audio element, call `connectInputToMaster` for its UUID, and verify the audio node connections in the Web Audio API context (this might require more advanced testing or manual inspection using browser developer tools). For now, ensure no errors are thrown.

- [x] **Task:** In `audio-mixer.ts`, connect the output of the `MasterGainController`'s `GainNode` to the `AudioContext`'s `destination`.
  - **Start:** Connect master output to audio destination.
  - **End:** Master gain connected to final output.
  - **Focus:** Final output connection.
  - **Test:** While not directly testable without audio playback, ensure the connection is made in the `AudioMixer`'s constructor or a dedicated initialization method.

## Phase 6: Basic Playback Control (HTMLMediaElement Sources)

- [x] **Task:** Create a new file `playback-controller.ts`. Define a class `PlaybackController` that takes an `AudioElementManager` as a dependency in its constructor.

  - **Start:** Create the file and class with dependency injection.
  - **End:** `PlaybackController` with `AudioElementManager` dependency.
  - **Focus:** Playback management setup.
  - **Test:** Instantiate `PlaybackController` and check if the `AudioElementManager` instance is stored.

- [x] **Task:** In `playback-controller.ts`, implement a method `playAll(): void`. This method should iterate through the `HTMLMediaElement` sources managed by the `AudioElementManager` and call the `play()` method on each element.

  - **Start:** Implement the play all method.
  - **End:** `playAll` method implemented.
  - **Focus:** Starting playback.
  - **Test:** Register a mock `HTMLMediaElement` with the `AudioElementManager`, instantiate `PlaybackController`, call `playAll`, and verify that the `play()` method was called on the mock element.

- [x] **Task:** In `playback-controller.ts`, implement a method `pauseAll(): void`. This method should iterate through the `HTMLMediaElement` sources managed by the `AudioElementManager` and call the `pause()` method on each element.

  - **Start:** Implement the pause all method.
  - **End:** `pauseAll` method implemented.
  - **Focus:** Pausing playback.
  - **Test:** Similar to the play test, verify that the `pause()` method is called on a registered mock `HTMLMediaElement`.

- [ ] **Task:** In `audio-mixer.ts`, add public methods `play(): void` and `pause(): void` that delegate the calls to the corresponding methods in the `PlaybackController`.
  - **Start:** Add proxy methods for play and pause.
  - **End:** `play` and `pause` methods in `AudioMixer`.
  - **Focus:** Proxying playback control.
  - **Test:** Instantiate `AudioMixer`, register an element, call the `play` and `pause` methods, and verify that the corresponding methods in the `PlaybackController` are invoked (again, using mocks or spies).
