import { NextResponse } from "next/server";
import { GoogleAPIClient } from "@/lib/google-api";

export async function GET() {
  try {
    const googleClient = await GoogleAPIClient.createFromSession();
    const data = await googleClient.getUserInfo();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
