interface EventBase {
  type: string;
  payload: any;
  timestamp?: Date;
}

export const UserEvents = {
  PAYLOADUPLOAD: "PAYLOADUPLOAD" as const,
} as const;
