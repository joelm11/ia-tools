import { TestVectorMetadata } from "./protoc/test_vector_metadata";
import { AudioFrameObuMetadata } from "./protoc/audio_frame";
import { IASequenceHeaderObuMetadata } from "./protoc/ia_sequence_header";
import { CodecConfigObuMetadata } from "./protoc/codec_config";
import { AudioElementObuMetadata } from "./protoc/audio_element";
import { MixPresentationObuMetadata } from "./protoc/mix_presentation";
import { TemporalDelimiterObuMetadata } from "./protoc/temporal_delimiter";
import { UserMetadata } from "./protoc/user_metadata";

export function payloadToIAMF(payload: any) {
  let metadata = UserMetadata.create();

  addDefaultMetadata();
  addAudioFileData();
  addAudioElementData();
  addMixPresentationData();
  // Print the metadata to check its validity.
  console.log("Metadata: ", metadata);
}

function addDefaultMetadata() {}

function addAudioFileData() {}

function addAudioElementData() {}

function addMixPresentationData() {}
