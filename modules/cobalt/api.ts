import { DownloadOptions } from "./request";
import { CobaltResponse, HelloResponse } from "./response";

export class CobaltAPI {
  /**
   * API Docs: https://github.com/imputnet/cobalt/blob/main/docs/api.md
   */

  baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mea/1.0",
        Authorization: this.apiKey ? `Api-Key ${this.apiKey}` : "",
        ...options?.headers, // Merge any additional headers provided in options
      },
    });

    // console.log(await response.text())

    return response.json();
  }

  async hello(): Promise<HelloResponse> {
    return this.fetch<HelloResponse>("/");
  }

  async download(options: DownloadOptions): Promise<CobaltResponse> {
    // console.log("CobaltAPI download options:", JSON.stringify(options));

    return this.fetch<CobaltResponse>("/", {
      body: JSON.stringify(options),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }
}
