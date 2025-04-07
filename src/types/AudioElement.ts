import { v4 as uuidv4 } from "uuid";

export interface AudioElement {
  name: string;
  id: string;
  audioFile: File;
}
