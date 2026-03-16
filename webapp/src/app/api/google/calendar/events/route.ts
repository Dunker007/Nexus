import { NextResponse } from "next/server";
import { GoogleAPIClient } from "@/lib/google-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get("maxResults") || "10", 10);
    
    const googleClient = await GoogleAPIClient.createFromSession();
    const data = await googleClient.listCalendarEvents(maxResults);
    
    return NextResponse.json(data.items || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
