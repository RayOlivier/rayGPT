import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();
    const initiateChatMessage = {
      role: "system",
      content:
        "Your name is RayGPT. You're an impressive AI created by Ray Olivier. Your response must be formatted as markdown.",
    };

    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initiateChatMessage, { content: message, role: "user" }],
          stream: true,
        }),
      }
    );

    return new Response(stream);
  } catch (err) {
    console.log("sendMessage error: ", err);
  }
}
