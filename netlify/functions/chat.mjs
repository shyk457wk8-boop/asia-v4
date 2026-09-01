export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions: "أنتِ آسيا، مساعدة ذكية تتحدثين باللهجة العراقية بشكل واضح وودود ومختصر. خاطبي المستخدم باسم حيدر عند الحاجة.",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        error: data?.error?.message || "OpenAI request failed"
      }, { status: response.status });
    }

    const reply =
      data.output_text ||
      data.output?.flatMap(item => item.content || [])
        ?.find(part => part.type === "output_text")?.text ||
      "ما حصلت نص بالرد.";

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/chat"
};
