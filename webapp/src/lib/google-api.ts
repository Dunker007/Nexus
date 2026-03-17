import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export class GoogleAPIClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static async createFromSession() {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      throw new Error("User is not authenticated with Google");
    }
    return new GoogleAPIClient(session.accessToken as string);
  }

  private async fetchGoogleAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://www.googleapis.com${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Google API Error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async getUserInfo() {
    return this.fetchGoogleAPI("/oauth2/v2/userinfo");
  }

  async listCalendarEvents(maxResults = 10) {
    const timeMin = new Date().toISOString();
    return this.fetchGoogleAPI(
      `/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`
    );
  }

  async listDriveFiles(maxResults = 10) {
    return this.fetchGoogleAPI(
      `/drive/v3/files?pageSize=${maxResults}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`
    );
  }
}
