export type StorageReturn = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * We use an ID to identify a file.
 * This ID is generated indepdendently of the interface.
 * This ID acts as the handle to the file.
 */
export interface Storage {
  create(file: Express.Multer.File, fileID: string): Promise<StorageReturn>;
  exists(fileID: string): Promise<StorageReturn>;
  delete(fileID: string): Promise<StorageReturn>;
}
