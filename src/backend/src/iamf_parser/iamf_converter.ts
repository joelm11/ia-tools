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

  addDefaultMetadata(metadata);
  addAudioFileData(metadata);
  addAudioElementData(metadata);
  addMixPresentationData(metadata);
  // Print the metadata to check its validity.
  console.log("Metadata: ", metadata);
}

function addDefaultMetadata(metadata: UserMetadata) {
  metadata.testVectorMetadata = TestVectorMetadata.create({ isValid: true });
}

function addAudioFileData(metadata: UserMetadata) {}

function addAudioElementData(metadata: UserMetadata) {}

function addMixPresentationData(metadata: UserMetadata) {}
