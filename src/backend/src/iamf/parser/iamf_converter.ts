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
  MixPresentationObuMetadata,
  SubMixAudioElement,
} from "./protoc/mix_presentation";
import { TemporalDelimiterObuMetadata } from "./protoc/temporal_delimiter";
import { UserMetadata } from "./protoc/user_metadata";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import type { AudioElementBase } from "src/@types/AudioElement";
import {
  getChannelCountRaw,
  getCoupledChannelCount,
  getChannelLabels,
  getIAMFLayout,
} from "./AudioFormat_tools";
import fs from "fs";

interface AudioElementMetadata extends AudioElementBase {
  idInt: number;
  channelLabels: ChannelLabel[];
}

interface MixPresentationMetadata extends MixPresentationBase {
  audioElements: AudioElementMetadata[];
}

const CODEC_CONFIG_ID = 200;
const CODEC_SR = 48000;
const CODEC_BIT_DEPTH = 16;

export function payloadToIAMF(mixPresentations: MixPresentationBase[]) {
  // Safety check in case of single mix presentation.
  if (!Array.isArray(mixPresentations)) {
    mixPresentations = [mixPresentations];
  }

  const audioElementsMetadata = augmentAudioElementMetadata(mixPresentations);
  const mixPresentationsMetadata = mixPresentations.map((mixPresentation) => {
    return {
      ...mixPresentation,
      audioElements: audioElementsMetadata,
    };
  });

  let metadata = UserMetadata.create();

  addDefaultMetadata(mixPresentationsMetadata, metadata);
  addAudioFileData(audioElementsMetadata, metadata);
  addAudioElementData(audioElementsMetadata, metadata);
  addMixPresentationData(mixPresentationsMetadata, metadata);
  // Write the metadata to a JSON file.
  metadataToTextProto(metadata);
}

function augmentAudioElementMetadata(
  mixPresentations: MixPresentationBase[]
): AudioElementMetadata[] {
  const audioElements: AudioElementMetadata[] = [];
  for (const mixPresentation of mixPresentations) {
    for (const audioElement of mixPresentation.audioElements) {
      const elementId = uuidToNumber(audioElement.id);
      const channelLabels = getChannelLabels(audioElement.audioChFormat);
      audioElements.push({
        ...audioElement,
        idInt: elementId,
        channelLabels: channelLabels,
      });
    }
  }
  return audioElements;
}

function uuidToNumber(uuid: string): number {
  const hexString = uuid.replace(/-/g, "");
  return Number(`0x${hexString.slice(-16)}`);
}

function addDefaultMetadata(
  mixPresentations: MixPresentationBase[],
  metadata: UserMetadata
) {
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
      codecConfigId: CODEC_CONFIG_ID,
      // Hardcoding these for now as params are independent of input files.
      codecConfig: {
        codecId: CodecId.CODEC_ID_LPCM,
        numSamplesPerFrame: 512,
        decoderConfigLpcm: {
          sampleFormatFlags: LpcmFormatFlags.LPCM_LITTLE_ENDIAN,
          sampleSize: CODEC_BIT_DEPTH,
          sampleRate: CODEC_SR,
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

function addAudioFileData(
  audioElements: AudioElementMetadata[],
  metadata: UserMetadata
) {
  for (const element of audioElements) {
    metadata.audioFrameMetadata.push(
      AudioFrameObuMetadata.create({
        wavFilename: element.id,
        samplesToTrimAtEndIncludesPadding: false,
        samplesToTrimAtStartIncludesCodecDelay: false,
        samplesToTrimAtEnd: 0,
        samplesToTrimAtStart: 0,
        audioElementId: 333,
        channelMetadatas: element.channelLabels.map((label, index) => {
          return {
            channelId: index,
            channelLabel: label,
          };
        }),
      })
    );
  }
}

function addAudioElementData(
  audioElements: AudioElementMetadata[],
  metadata: UserMetadata
) {
  for (const element of audioElements) {
    const numSubstreams =
      getChannelCountRaw(element.audioChFormat) -
      getCoupledChannelCount(element.audioChFormat);
    metadata.audioElementMetadata.push(
      AudioElementObuMetadata.create({
        audioElementId: 333,
        audioElementType: AudioElementType.AUDIO_ELEMENT_CHANNEL_BASED,
        codecConfigId: CODEC_CONFIG_ID,
        numSubstreams: numSubstreams,
        audioSubstreamIds: Array.from(
          { length: numSubstreams },
          (_, index) => index
        ),
        numParameters: 0,
        scalableChannelLayoutConfig: {
          numLayers: 1,
          channelAudioLayerConfigs: [
            {
              loudspeakerLayout: getIAMFLayout(element.audioChFormat),
              outputGainIsPresentFlag: 0, // TODO(?)
              reconGainIsPresentFlag: 0, // TODO(?)
              substreamCount: numSubstreams,
              coupledSubstreamCount: getCoupledChannelCount(
                element.audioChFormat
              ),
            },
          ],
        },
      })
    );
  }
}

function addMixPresentationData(
  mixPresentations: MixPresentationMetadata[],
  metadata: UserMetadata
) {
  for (const mixPresentation of mixPresentations) {
    metadata.mixPresentationMetadata.push(
      MixPresentationObuMetadata.create({
        mixPresentationId: 444,
        countLabel: 1,
        annotationsLanguage: ["en-us"], // TODO (?)
        localizedPresentationAnnotations: [mixPresentation.name],
        subMixes: [
          {
            audioElements: mixpresentationAudioElements(mixPresentation),
            // TODO?
            outputMixGain: {
              paramDefinition: {
                parameterId: 998,
                parameterRate: 48000,
                paramDefinitionMode: true,
              },
              defaultMixGain: 0, // TODO
            },
            // Let's see if we can get away without loudness information.
            // Otherwise, TODO.
          },
        ],
      })
    );
  }
}

function mixpresentationAudioElements(
  mixPresentation: MixPresentationMetadata
): SubMixAudioElement[] {
  const mixpresentationAudioElements: SubMixAudioElement[] = [];

  for (const element of mixPresentation.audioElements) {
    mixpresentationAudioElements.push(
      SubMixAudioElement.create({
        audioElementId: 333,
        localizedElementAnnotations: [element.name],
        renderingConfig: {
          headphonesRenderingMode:
            HeadPhonesRenderingMode.HEADPHONES_RENDERING_MODE_BINAURAL,
        },
        elementMixGain: {
          paramDefinition: {
            parameterId: 999,
            parameterRate: 48000,
            paramDefinitionMode: true,
          },
          defaultMixGain: element.gain,
        },
      })
    );
  }
  return mixpresentationAudioElements;
}

function metadataToTextProto(metadata: UserMetadata) {
  const bin = UserMetadata.encode(metadata).finish();
  // Write binary to a temporary file.
  fs.writeFileSync("configured_iamf_md.bin", bin);
  // Convert the binary file to a .textproto file using the protoc command.
  const cwd = process.cwd();
  // Append the path to the file
  const filePath = `${cwd}/src/backend/src/iamf/parser/proto`;
  console.log(filePath);
  const command = `cat configured_iamf_md.bin | protoc --decode=iamf_tools_cli_proto.UserMetadata -I=${filePath} ${filePath}/user_metadata.proto > configured_iamf_md.textproto`;
  const exec = require("child_process").exec;
  exec(command, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}
