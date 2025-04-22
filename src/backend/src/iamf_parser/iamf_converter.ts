import { TestVectorMetadata } from "./protoc/test_vector_metadata";
import { AudioFrameObuMetadata, ChannelLabel } from "./protoc/audio_frame";
import {
  IASequenceHeaderObuMetadata,
  ProfileVersion,
} from "./protoc/ia_sequence_header";
import {
  CodecConfigObuMetadata,
  CodecId,
  LpcmFormatFlags,
} from "./protoc/codec_config";
import {
  AudioElementObuMetadata,
  AudioElementType,
} from "./protoc/audio_element";
import {
  HeadPhonesRenderingMode,
  MixPresentationAnnotations,
  MixPresentationObuMetadata,
} from "./protoc/mix_presentation";
import { TemporalDelimiterObuMetadata } from "./protoc/temporal_delimiter";
import { UserMetadata } from "./protoc/user_metadata";
import type { MixPresentationBase } from "src/@types/MixPresentation";

export function payloadToIAMF(mixPresentations: MixPresentationBase[]) {
  let metadata = UserMetadata.create();

  addDefaultMetadata(metadata);
  addAudioFileData(metadata);
  addAudioElementData(metadata);
  addMixPresentationData(metadata);

  // Write the metadata to a JSON file.
  metadataToTextProto(metadata);
}

function addDefaultMetadata(metadata: UserMetadata) {
  // Test vector field
  metadata.testVectorMetadata = TestVectorMetadata.create({ isValid: true });

  // Sequence header field
  metadata.iaSequenceHeaderMetadata.push(
    IASequenceHeaderObuMetadata.create({
      primaryProfile: ProfileVersion.PROFILE_VERSION_SIMPLE,
      additionalProfile: ProfileVersion.PROFILE_VERSION_SIMPLE,
    })
  );

  // Codec config field
  metadata.codecConfigMetadata.push(
    CodecConfigObuMetadata.create({
      codecConfigId: 200,
      // Hardcoding these for now as params are independent of input files.
      codecConfig: {
        codecId: CodecId.CODEC_ID_LPCM,
        numSamplesPerFrame: 512,
        decoderConfigLpcm: {
          sampleFormatFlags: LpcmFormatFlags.LPCM_LITTLE_ENDIAN,
          sampleSize: 16,
          sampleRate: 48000,
        },
      },
    })
  );

  // Temporal delimiter field
  metadata.temporalDelimiterMetadata = TemporalDelimiterObuMetadata.create(
    TemporalDelimiterObuMetadata.create({
      enableTemporalDelimiters: false,
    })
  );
}

function addAudioFileData(metadata: UserMetadata) {
  metadata.audioFrameMetadata.push(
    AudioFrameObuMetadata.create({
      wavFilename: "audio.wav", // TODO
      samplesToTrimAtEndIncludesPadding: false,
      samplesToTrimAtStartIncludesCodecDelay: false,
      samplesToTrimAtEnd: 0,
      samplesToTrimAtStart: 0,
      audioElementId: 100, // TODO
      channelMetadatas: [
        // TODO
        { channelId: 0, channelLabel: ChannelLabel.CHANNEL_LABEL_A_0 },
      ],
    })
  );
}

function addAudioElementData(metadata: UserMetadata) {
  metadata.audioElementMetadata.push(
    AudioElementObuMetadata.create({
      audioElementId: 100,
      audioElementType: AudioElementType.AUDIO_ELEMENT_CHANNEL_BASED,
      codecConfigId: 200, // TODO this needs to change with file data for the element.
      numSubstreams: 1, // TODO
      audioSubstreamIds: [0], // TODO
      numParameters: 0,
      scalableChannelLayoutConfig: {
        numLayers: 1,
        channelAudioLayerConfigs: [
          {
            loudspeakerLayout: 0, // TODO
            outputGainIsPresentFlag: 0, // TODO
            reconGainIsPresentFlag: 0, // TODO
            substreamCount: 1,
            coupledSubstreamCount: 0,
          },
        ],
      },
    })
  );
}

function addMixPresentationData(metadata: UserMetadata) {
  metadata.mixPresentationMetadata.push(
    MixPresentationObuMetadata.create({
      mixPresentationId: 0, // TODO
      countLabel: 1,
      annotationsLanguage: ["en-us"], // TODO
      localizedPresentationAnnotations: ["MP Name"], // TODO
      subMixes: [
        {
          audioElements: [
            {
              audioElementId: 300,
              localizedElementAnnotations: ["ah"],
              renderingConfig: {
                headphonesRenderingMode:
                  HeadPhonesRenderingMode.HEADPHONES_RENDERING_MODE_BINAURAL,
              },
              // TODO?
              elementMixGain: {
                paramDefinition: {
                  parameterId: 999,
                  parameterRate: 48000,
                  paramDefinitionMode: true,
                },
                defaultMixGain: 0,
              },
            }, // TODO
          ],
          outputMixGain: {
            paramDefinition: {
              parameterId: 998,
              parameterRate: 48000,
              paramDefinitionMode: true,
            },
            defaultMixGain: 0,
          },
          // Let's see if we can get away without loudness information.
          // Otherwise, TODO.
        },
      ], // TODO
    })
  );
}

function metadataToTextProto(metadata: UserMetadata) {
  const foo = UserMetadata.toJSON(metadata);
  console.log("-- Constructed MD --");
  console.log(foo);
}
