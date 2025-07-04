import { DownloadOptions } from "./request";
import { CobaltResponse, HelloResponse } from "./response";

export class CobaltAPI {
  /**
   * API Docs: https://github.com/imputnet/cobalt/blob/main/docs/api.md
   */

  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
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
