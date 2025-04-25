export type StorageReturn =
  | { success: true; url: string }
  | { success: false; error: string }
  | { success: boolean };

export interface Storage {
  create(file: Express.Multer.File): Promise<StorageReturn>;
  exists(fileID: string): Promise<StorageReturn>;
  delete(fileID: string): Promise<StorageReturn>;
}
