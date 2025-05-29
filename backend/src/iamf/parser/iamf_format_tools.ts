import { AudioChFormat } from "src/@types/AudioFormats";
import { ChannelLabel } from "./protoc/audio_frame";
import { LoudspeakerLayout } from "./protoc/audio_element";
import { SoundSystem } from "./protoc/mix_presentation";

export function getChannelLabels(chFormat: AudioChFormat) {
  switch (chFormat) {
    case AudioChFormat.MONO:
      return [ChannelLabel.CHANNEL_LABEL_MONO];
    case AudioChFormat.STEREO:
      return [ChannelLabel.CHANNEL_LABEL_L_2, ChannelLabel.CHANNEL_LABEL_R_2];
    case AudioChFormat.K3P1P2:
      return [
        ChannelLabel.CHANNEL_LABEL_L_3,
        ChannelLabel.CHANNEL_LABEL_R_3,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LTF_3,
        ChannelLabel.CHANNEL_LABEL_RTF_3,
      ];
    case AudioChFormat.K5P1:
      return [
        ChannelLabel.CHANNEL_LABEL_L_5,
        ChannelLabel.CHANNEL_LABEL_R_5,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LS_5,
        ChannelLabel.CHANNEL_LABEL_RS_5,
      ];
    case AudioChFormat.K5P1P2:
      return [
        ChannelLabel.CHANNEL_LABEL_L_5,
        ChannelLabel.CHANNEL_LABEL_R_5,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LS_5,
        ChannelLabel.CHANNEL_LABEL_RS_5,
        ChannelLabel.CHANNEL_LABEL_LTF_2,
        ChannelLabel.CHANNEL_LABEL_RTF_2,
      ];
    case AudioChFormat.K5P1P4:
      return [
        ChannelLabel.CHANNEL_LABEL_L_5,
        ChannelLabel.CHANNEL_LABEL_R_5,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LS_5,
        ChannelLabel.CHANNEL_LABEL_RS_5,
        ChannelLabel.CHANNEL_LABEL_LTF_4,
        ChannelLabel.CHANNEL_LABEL_RTF_4,
        ChannelLabel.CHANNEL_LABEL_LTB_4,
        ChannelLabel.CHANNEL_LABEL_RTB_4,
      ];
    case AudioChFormat.K7P1:
      return [
        ChannelLabel.CHANNEL_LABEL_L_7,
        ChannelLabel.CHANNEL_LABEL_R_7,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LSS_7,
        ChannelLabel.CHANNEL_LABEL_RSS_7,
        ChannelLabel.CHANNEL_LABEL_LRS_7,
        ChannelLabel.CHANNEL_LABEL_RRS_7,
      ];
    case AudioChFormat.K7P1P2:
      return [
        ChannelLabel.CHANNEL_LABEL_L_7,
        ChannelLabel.CHANNEL_LABEL_R_7,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LSS_7,
        ChannelLabel.CHANNEL_LABEL_RSS_7,
        ChannelLabel.CHANNEL_LABEL_LRS_7,
        ChannelLabel.CHANNEL_LABEL_RRS_7,
        ChannelLabel.CHANNEL_LABEL_LTF_2,
        ChannelLabel.CHANNEL_LABEL_RTF_2,
      ];
    case AudioChFormat.K7P1P4:
      return [
        ChannelLabel.CHANNEL_LABEL_L_7,
        ChannelLabel.CHANNEL_LABEL_R_7,
        ChannelLabel.CHANNEL_LABEL_CENTRE,
        ChannelLabel.CHANNEL_LABEL_LFE,
        ChannelLabel.CHANNEL_LABEL_LSS_7,
        ChannelLabel.CHANNEL_LABEL_RSS_7,
        ChannelLabel.CHANNEL_LABEL_LRS_7,
        ChannelLabel.CHANNEL_LABEL_RRS_7,
        ChannelLabel.CHANNEL_LABEL_LTF_4,
        ChannelLabel.CHANNEL_LABEL_RTF_4,
        ChannelLabel.CHANNEL_LABEL_LTB_4,
        ChannelLabel.CHANNEL_LABEL_RTB_4,
      ];
    default:
      throw new Error(`getChLabels(): Unknown channel format: ${chFormat}`);
  }
}

export function getCoupledChannelCount(chFormat: AudioChFormat): number {
  switch (chFormat) {
    case AudioChFormat.MONO:
      return 0;
    case AudioChFormat.STEREO:
      return 1;
    case AudioChFormat.K3P1P2:
      return 2;
    case AudioChFormat.K5P1:
      return 2;
    case AudioChFormat.K5P1P2:
      return 3;
    case AudioChFormat.K5P1P4:
      return 4;
    case AudioChFormat.K7P1:
      return 3;
    case AudioChFormat.K7P1P2:
      return 4;
    case AudioChFormat.K7P1P4:
      return 5;
    default:
      throw new Error(
        `getCoupledChannelCount(): Unknown channel format: ${chFormat}`
      );
  }
}

export function getIAMFLayout(chFormat: AudioChFormat): any {
  switch (chFormat) {
    case AudioChFormat.MONO:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_MONO;
    case AudioChFormat.STEREO:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_STEREO;
    case AudioChFormat.K3P1P2:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_3_1_2_CH;
    case AudioChFormat.K5P1:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_5_1_CH;
    case AudioChFormat.K5P1P2:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_5_1_2_CH;
    case AudioChFormat.K5P1P4:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_5_1_4_CH;
    case AudioChFormat.K7P1:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_7_1_CH;
    case AudioChFormat.K7P1P2:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_7_1_2_CH;
    case AudioChFormat.K7P1P4:
      return LoudspeakerLayout.LOUDSPEAKER_LAYOUT_7_1_4_CH;
    default:
      throw new Error(`getIAMFLayout(): Unknown channel format: ${chFormat}`);
  }
}

export function getIAMFSoundSystem(chFormat: AudioChFormat) {
  switch (chFormat) {
    case AudioChFormat.MONO:
      return SoundSystem.SOUND_SYSTEM_A_0_2_0;
    case AudioChFormat.STEREO:
      return SoundSystem.SOUND_SYSTEM_A_0_2_0;
    case AudioChFormat.K3P1P2:
      return SoundSystem.SOUND_SYSTEM_C_2_5_0;
    case AudioChFormat.K5P1:
      return SoundSystem.SOUND_SYSTEM_B_0_5_0;
    case AudioChFormat.K5P1P2:
      return SoundSystem.SOUND_SYSTEM_C_2_5_0;
    case AudioChFormat.K5P1P4:
      return SoundSystem.SOUND_SYSTEM_D_4_5_0;
    case AudioChFormat.K7P1:
      return SoundSystem.SOUND_SYSTEM_I_0_7_0;
    case AudioChFormat.K7P1P2:
      return SoundSystem.SOUND_SYSTEM_J_4_7_0;
    case AudioChFormat.K7P1P4:
      return SoundSystem.SOUND_SYSTEM_J_4_7_0;
    default:
      throw new Error(
        `getIAMFSoundSystem(): Unknown channel format: ${chFormat}`
      );
  }
}
