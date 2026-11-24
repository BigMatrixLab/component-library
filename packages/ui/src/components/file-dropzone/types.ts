export type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

/** What a file row shows besides its name and size. Return it from `fileStatus`. */
export interface FileStatusInfo {
  status?: FileStatus;
  /** 0 to 100, shown as a progress bar while `status` is `uploading`. Leave out for an unknown duration. */
  progress?: number;
  /** Text for `error`, e.g. "Upload failed. Try again." */
  message?: string;
}
