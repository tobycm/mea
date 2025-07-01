/**
 * 
 - tunnel: cobalt is proxying and/or remuxing/transcoding the file for you.
 - local-processing: cobalt is proxying the files for you, but you have to remux/transcode them locally.
 - redirect: cobalt will redirect you to the direct service URL.
 - picker: there are multiple items to choose from, a picker should be shown.
 - error: something went wrong, here's an error code.
 */

type StatusCode = "tunnel" | "local-processing" | "redirect" | "picker" | "error";

// accurate as of June 2025
type OriginService =
  | "bilibili"
  | "bluesky"
  | "dailymotion"
  | "facebook"
  | "instagram"
  | "loom"
  | "ok"
  | "pinterest"
  | "reddit"
  | "rutube"
  | "snapchat"
  | "soundcloud"
  | "streamable"
  | "tiktok"
  | "tumblr"
  | "twitch clips"
  | "twitter"
  | "vimeo"
  | "vk"
  | "xiaohongshu"
  | "youtube";

interface OutputObject {
  type: string; // mime type of the output
  filename: string; // filename of the output
  metadata: OutputMetadata;
  subtitles: boolean; // whether tunnels include a subtitle file
}

interface OutputMetadata {
  album?: string;
  composer?: string;
  genre?: string;
  copyright?: string;
  title?: string;
  artist?: string;
  album_artist?: string;
  track?: string;
  date?: string;
  sublanguage?: string;
}

interface AudioObject {
  copy: boolean;
  format: string;
  bitrate: string;
  cover?: boolean;
  cropCover?: boolean;
}

interface ResponseBase {
  status: StatusCode;
}

interface TunnelResponse extends ResponseBase {
  status: "tunnel";
  url: string; // url for the cobalt tunnel, or redirect to an external link
  filename: string; // cobalt-generated filename for the file being downloaded
}

// same as tunnel idk why
interface RedirectResponse extends ResponseBase {
  status: "redirect";
  url: string;
  filename: string;
}

interface LocalProcessingResponse extends ResponseBase {
  status: "local-processing";
  type: "merge" | "mute" | "audio" | "gif" | "remux";
  service: OriginService; // the service that the file is from
  tunnel: string[]; // array of tunnel URLs
  output: OutputObject;
  audio?: AudioObject;
  isHLS?: boolean; // whether the file is HLS format
}

interface PickerResponse extends ResponseBase {
  status: "picker";
  audio?: string; // returned when an image slideshow (such as on tiktok) has a general background audio
  audioFilename?: string; // cobalt-generated filename
  picker: PickerObject[];
}

interface PickerObject {
  type: "photo" | "video" | "gif"; // Assuming 'type' can only be one of these string literals
  url: string;
  thumb?: string;
}

interface ErrorContext {
  service?: string;
  limit?: number;
}

interface ErrorObject {
  code: string;
  context?: ErrorContext;
}

interface ErrorResponse extends ResponseBase {
  status: "error"; // Assuming the status for an error response is always "error"
  error: ErrorObject;
}

export type CobaltResponse = TunnelResponse | RedirectResponse | LocalProcessingResponse | PickerResponse | ErrorResponse;

interface CobaltObject {
  version: string;
  url: string;
  startTime: string; // Unix milliseconds as a string
  turnstileSitekey?: string;
  services: string[];
}

interface GitObject {
  commit: string;
  branch: string;
  remote: string;
}

export interface HelloResponse {
  cobalt: CobaltObject;
  git: GitObject;
}
