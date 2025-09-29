import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passage = (body?.passage || "").toString().trim();
    if (!passage) {
      return new Response(JSON.stringify({ error: "Missing passage" }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
    }

    const system = "You are a helpful reading assistant. Explain the contextual meaning of the selected text from a book in simple terms. Keep it concise and focused on what the selection means in this context.";
    const user = `Selected text:\n\n"""${passage}"""\n\nExplain the contextual meaning, definitions of key words if helpful, and any implied subtext.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return new Response(JSON.stringify({ error: `OpenAI error: ${res.status} ${err}` }), { status: 502 });
    }
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content || JSON.stringify(json, null, 2);

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500 });
  }
}


