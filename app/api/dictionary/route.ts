import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const word = (searchParams.get("word") || "").trim();
    if (!word) {
      return new Response(JSON.stringify({ error: "Missing word" }), {
        status: 400,
      });
    }

    const apiKey =
      process.env.MW_DICTIONARY_KEY || process.env.MERRIAM_WEBSTER_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Merriam-Webster API key" }),
        { status: 500 },
      );
    }

    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Merriam-Webster error: ${res.status}` }),
        { status: 502 },
      );
    }
    const json = await res.json();

    // Try to extract concise definitions
    let text = "";
    if (Array.isArray(json) && json.length > 0 && typeof json[0] === "object") {
      const entry = json[0];
      const headword = (entry?.hwi?.hw || word).replaceAll("*", "");
      const fl = entry?.fl ? ` (${entry.fl})` : "";
      const shortdefs: string[] = entry?.shortdef || [];
      if (shortdefs.length > 0) {
        text =
          `${headword}${fl}\n\n` +
          shortdefs.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n");
      }
    }
    if (!text) {
      text = JSON.stringify(json, null, 2);
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Unexpected error" }),
      { status: 500 },
    );
  }
}
