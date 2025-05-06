export enum AudioChFormat {
  NONE = "none",
  MONO = "Mono",
  STEREO = "Stereo",
  K3P1P2 = "3.1.2",
  K5P1 = "5.1",
  K5P1P2 = "5.1.2",
  K5P1P4 = "5.1.4",
  K7P1 = "7.1",
  K7P1P2 = "7.1.2",
  K7P1P4 = "7.1.4",
}

export enum ChannelGrouping {
  S1,
  S2,
  S3,
  S5,
  S7,
  TF2,
  T2,
  T4,
}

// Map and AudioChFormat to ChannelGrouping
type ChannelGroupings = {
  [format in AudioChFormat]: { surr: ChannelGrouping; tops?: ChannelGrouping };
};

export const channelGroupings: ChannelGroupings = {
  [AudioChFormat.NONE]: { surr: ChannelGrouping.S1 },
  [AudioChFormat.MONO]: { surr: ChannelGrouping.S1 },
  [AudioChFormat.STEREO]: { surr: ChannelGrouping.S2 },
  [AudioChFormat.K3P1P2]: {
    surr: ChannelGrouping.S3,
    tops: ChannelGrouping.TF2,
  },
  [AudioChFormat.K5P1]: { surr: ChannelGrouping.S5 },
  [AudioChFormat.K5P1P2]: {
    surr: ChannelGrouping.S5,
    tops: ChannelGrouping.T2,
  },
  [AudioChFormat.K5P1P4]: {
    surr: ChannelGrouping.S5,
    tops: ChannelGrouping.T4,
  },
  [AudioChFormat.K7P1]: { surr: ChannelGrouping.S7 },
  [AudioChFormat.K7P1P2]: {
    surr: ChannelGrouping.S7,
    tops: ChannelGrouping.T2,
  },
  [AudioChFormat.K7P1P4]: {
    surr: ChannelGrouping.S7,
    tops: ChannelGrouping.T4,
  },
};
