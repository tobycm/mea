import { AttachmentPayload, Message } from "discord.js";
import Constants from "modules/constants";
import { DownloadOptions } from "./cobalt/request";
import { CobaltResponse } from "./cobalt/response";
import { ffmpegDownload, niceBytes } from "./utils";

export interface AutodownloadConfig {
  deleteOriginal?: boolean;
  prompt?: boolean;
  prefix?: string;

  cobaltOptions: Omit<DownloadOptions, "url">;
}

export function inferExtension({
  audioFormat,
  downloadMode,
  youtubeVideoContainer,
}: {
  downloadMode: DownloadOptions["downloadMode"];
  audioFormat: DownloadOptions["audioFormat"];
  youtubeVideoContainer: DownloadOptions["youtubeVideoContainer"];
}): string {
  if (downloadMode === "audio") {
    if (audioFormat && audioFormat !== "best") return audioFormat;
    return "mp3";
  }

  if (youtubeVideoContainer && youtubeVideoContainer !== "auto") return youtubeVideoContainer;

  return "mp4";
}

export class DownloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DownloadError";
  }
}

export class InvalidUrlError extends DownloadError {
  url: string;

  constructor(url: string) {
    super(`Invalid URL provided for cobalt: ${url}`);
    this.url = url;
    this.name = "InvalidUrlError";
  }
}

export class TooLargeError extends DownloadError {
  size: number;

  constructor(size: number) {
    super(`File size exceeds the maximum limit for this server. (${niceBytes(size)})`);
    this.size = size;
    this.name = "TooLargeError";
  }
}

export async function download(
  result: CobaltResponse,
  {
    endTime,
    startTime,
    maxFileSize,
    extension,
    audio = false,
  }: {
    endTime?: string | null;
    startTime?: string | null;
    maxFileSize: number;
    extension?: string;
    audio?: boolean;
  }
): Promise<AttachmentPayload[] | undefined> {
  if (result.status == "tunnel" || result.status == "redirect") {
    const filename = result.filename || `download-${Date.now()}.${extension}`;

    if (startTime || endTime) {
      // auto delete file after consuming buffer btw
      const file = await ffmpegDownload({
        input: result.url,
        filename: filename,
        startTime,
        endTime,
      });

      if (file.buffer.byteLength > maxFileSize) throw new TooLargeError(file.buffer.byteLength);

      return [{ name: filename, attachment: file.buffer }];
    }

    const file = await fetch(result.url, { signal: AbortSignal.timeout(30000) });

    const contentLength = file.headers.get("content-length") || file.headers.get("estimated-content-length");

    if (!contentLength) throw new DownloadError("Failed to determine file size from headers.");

    let size = parseInt(contentLength, 10);

    if (audio) size /= 8; // cobalt estimation is not very good for audio file

    if (size > maxFileSize) throw new TooLargeError(size);

    if (!file.ok) throw new DownloadError(`Failed to fetch file: ${file.status} ${file.statusText}`);

    const blob = await file.blob();

    if (blob.size > maxFileSize) throw new TooLargeError(blob.size);

    return [{ name: filename, attachment: Buffer.from(await blob.arrayBuffer()) }];
  }

  if (result.status == "picker") {
    const jobs = result.picker.map(async (item) => {
      const file = await fetch(item.url);

      if (!file.ok) throw new DownloadError(`Failed to fetch file: ${file.status} ${file.statusText}`);

      const blob = await file.blob();

      if (blob.size > maxFileSize) throw new TooLargeError(blob.size);

      const ext = item.type === "photo" ? "png" : item.type === "video" ? "mp4" : "gif";

      return {
        name: `download-${Date.now()}.${ext}`,
        attachment: Buffer.from(await blob.arrayBuffer()),
      };
    });

    return await Promise.all(jobs);
  }
}

export async function handleErrors(message: Message, error: unknown) {
  message.reactions.removeAll();

  if (error instanceof TooLargeError) {
    message.react(Constants.emojis.toolarge);
    return;
  }
  if (error instanceof InvalidUrlError) return;

  message.react(Constants.emojis.error);
  console.error("Download error:", JSON.stringify(error));
}
