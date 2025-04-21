interface EventBase {
  type: string;
  payload: any;
  timestamp?: Date;
}

// User events //

type PayloadUploadEvent = EventBase & {
  type: "PAYLOADUPLOAD";
  payload: any;
};

export const UserEvents = {
  PAYLOADUPLOAD: "PAYLOADUPLOAD" as const,
} as const;
