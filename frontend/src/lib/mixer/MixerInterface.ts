import type { MixPresentation } from "src/@types/MixPresentation";

export interface MixerInterface {
  /**
   * @brief Play or pause all audio elements in the mixer.
   */
  playpause(): void;

  /**
   * @brief Set the active mix presentation.
   * @param mixPresentation The mix presentation to set as active.
   */
  setActive(mixPresentation: MixPresentation): void;

  /**
   * @brief Set the gain for the mix. If an ID is provided, set the gain for that audio element.
   * @param gain The gain value to set.
   */
  setGain(gain: number, elementID?: string): void;
}
