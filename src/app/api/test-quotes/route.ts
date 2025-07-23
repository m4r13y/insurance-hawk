import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Call local Firebase emulator function
    const response = await axios.post(
      "http://localhost:5001/medicareally/us-central1/getMedigapQuotes",
      { data: body }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({
      error: error?.response?.data || error.message,
      message: "Failed to fetch Medigap quote."
    }, { status: 500 });
  }
}
