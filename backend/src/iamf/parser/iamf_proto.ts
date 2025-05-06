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
  LayoutType,
  MixPresentationObuMetadata,
  SoundSystem,
  SubMixAudioElement,
} from "./protoc/mix_presentation";
import { TemporalDelimiterObuMetadata } from "./protoc/temporal_delimiter";
import { UserMetadata } from "./protoc/user_metadata";
import type { MixPresentationBase } from "src/@types/MixPresentation";
import type { AudioElementBase } from "src/@types/AudioElement";
import { getChannelCountRaw } from "src/@common/AudioFormatsTools";
import {
  getCoupledChannelCount,
  getChannelLabels,
  getIAMFLayout,
} from "./iamf_format_tools";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

interface AudioElementMetadata extends AudioElementBase {
  idInt: number;
  channelLabels: ChannelLabel[];
}

interface MixPresentationMetadata extends MixPresentationBase {
  audioElements: AudioElementMetadata[];
}

const CODEC_CONFIG_ID = 200;
const CODEC_BIT_DEPTH = 24;

export async function payloadToIAMF(
  mixPresentations: MixPresentationBase[]
): Promise<string> {
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
  return metadataToTextProto(metadata);
}

function augmentAudioElementMetadata(
  mixPresentations: MixPresentationBase[]
): AudioElementMetadata[] {
  const audioElements: AudioElementMetadata[] = [];
  for (const mixPresentation of mixPresentations) {
    for (const audioElement of mixPresentation.audioElements) {
      // Only add the audio element if it is not already present.
      if (audioElements.some((el) => el.id === audioElement.id)) {
        continue;
      }
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

// For unit tests where we use strings to easily identify audio source files rather than UUIDs.
function stringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  // Convert to 32bit unsigned integer
  return hash >>> 0;
}

function uuidToNumber(uuid: string): number {
  const hexString = uuid.replace(/-/g, "");
  if (hexString.length === 32 && /^[0-9a-fA-F]+$/.test(hexString)) {
    const last8Hex = hexString.slice(-8);
    const integerValue = parseInt(last8Hex, 16);
    return integerValue >>> 0;
  } else {
    return stringToNumber(uuid);
  }
}

function addDefaultMetadata(
  mixPresentations: MixPresentationBase[],
  metadata: UserMetadata
) {
  // Test vector field
  metadata.testVectorMetadata = TestVectorMetadata.create({
    isValid: true,
    fileNamePrefix: "boo",
    humanReadableDescription: "This IAMF file generated from ia-tools",
  });

  // Sequence header field
  metadata.iaSequenceHeaderMetadata.push(
    IASequenceHeaderObuMetadata.create({
      primaryProfile: ProfileVersion.PROFILE_VERSION_BASE,
      additionalProfile: ProfileVersion.PROFILE_VERSION_BASE,
    })
  );

  // Codec config field
  metadata.codecConfigMetadata.push(
    CodecConfigObuMetadata.create({
      codecConfigId: CODEC_CONFIG_ID,
      // TODO Hardcoding these for now but these must become common between input files.
      codecConfig: {
        codecId: CodecId.CODEC_ID_LPCM,
        numSamplesPerFrame: 512,
        decoderConfigLpcm: {
          sampleFormatFlags: LpcmFormatFlags.LPCM_LITTLE_ENDIAN,
          sampleSize: CODEC_BIT_DEPTH,
          sampleRate: 44100,
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
        audioElementId: element.idInt,
        // TODO: This syntax is incorrect (bunch of arrays of single values).
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
  let substreamIdentifier = 0;
  for (const element of audioElements) {
    const numSubstreams =
      getChannelCountRaw(element.audioChFormat) -
      getCoupledChannelCount(element.audioChFormat);
    metadata.audioElementMetadata.push(
      AudioElementObuMetadata.create({
        audioElementId: element.idInt,
        audioElementType: AudioElementType.AUDIO_ELEMENT_CHANNEL_BASED,
        codecConfigId: CODEC_CONFIG_ID,
        numSubstreams: numSubstreams,
        audioSubstreamIds: Array.from(
          { length: numSubstreams },
          (_, index) => index + substreamIdentifier
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
    substreamIdentifier += numSubstreams;
  }
}

function addMixPresentationData(
  mixPresentations: MixPresentationMetadata[],
  metadata: UserMetadata
) {
  for (const mixPresentation of mixPresentations) {
    metadata.mixPresentationMetadata.push(
      MixPresentationObuMetadata.create({
        mixPresentationId: uuidToNumber(mixPresentation.id),
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
            // Looks like I can just hardcode stereo loudness stuff for now(?)
            layouts: [
              {
                loudnessLayout: {
                  layoutType: LayoutType.LAYOUT_TYPE_LOUDSPEAKERS_SS_CONVENTION,
                  ssLayout: { soundSystem: SoundSystem.SOUND_SYSTEM_A_0_2_0 }, // TODO
                },
              },
            ],
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
        audioElementId: element.idInt,
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

async function metadataToTextProto(metadata: UserMetadata) {
  const bin = UserMetadata.encode(metadata).finish();
  // Write binary to a temporary file.
  fs.writeFileSync("configured_iamf_md.bin", bin);
  // Convert the binary file to a .textproto file using the protoc command.
  const cwd = process.cwd();
  // We need to indicate where the source proto files are located.
  const filePath = `${cwd}/src/iamf/parser/proto`;
  const command = `cat configured_iamf_md.bin | protoc --decode=iamf_tools_cli_proto.UserMetadata -I=${filePath} ${filePath}/user_metadata.proto > iamf_md.textproto`;
  const promisedExec = promisify(exec);
  try {
    const { stdout, stderr } = await promisedExec(command);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }

  // Delete the binary file.
  fs.unlinkSync("configured_iamf_md.bin");

  return `iamf_md.textproto`;
}
