import { DownloadOptions } from "./request";
import { CobaltResponse, HelloResponse } from "./response";

// example fetch wrapper for type
async function f<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await globalThis.fetch(input, init);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

interface CobaltAPIOptions {
  fetch?: typeof f;
}

export class CobaltAPI {
  /**
   * API Docs: https://github.com/imputnet/cobalt/blob/main/docs/api.md
   */

  baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string, options: CobaltAPIOptions = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    if (options.fetch) this.fetch = options.fetch;
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
