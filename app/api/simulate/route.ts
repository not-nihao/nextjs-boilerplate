import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const agentUrl = process.env.AGENT_API_URL;

  if (!agentUrl) {
    return NextResponse.json(
      { error: "AGENT_API_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A message string is required" },
        { status: 400 }
      );
    }

    const response = await fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        input: { message },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SimuShop] Agent API error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Agent API returned ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SimuShop] Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to agent API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
