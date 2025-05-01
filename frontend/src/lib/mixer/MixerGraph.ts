import type { Mixer } from "./Mixer.svelte";
import {
  surroundNodes,
  topNodes,
  type MixerGraphNode,
} from "./MixerGraphNodes";

export enum SurroundType {
  S7,
  S5,
  S3,
  S2,
  S1,
}

export enum TopType {
  T4,
  T2,
  TF2,
}

type SurroundFormat = {
  surround: SurroundType;
  top?: TopType;
};

export function constructGraph(
  inputFormat: SurroundFormat,
  outputFormat: SurroundFormat
) {}
