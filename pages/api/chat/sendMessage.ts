import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();
    const systemChatMessage = {
      role: "system",
      content:
        "Your name is RayGPT. You're an impressive AI created by Ray Olivier. Your response must be formatted as markdown.",
    };

    const response = await fetch(
      `${req.headers.get("origin")}/api/chat/createNewChat`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({ message: message }),
      }
    );

    const json = await response.json();
    const chatId = json._id;

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
          messages: [systemChatMessage, { content: message, role: "user" }],
          stream: true,
        }),
      },
      {
        onBeforeStream: async ({ emit }) => {
          emit(chatId, "newChatId");
        },
        onAfterStream: async ({ fullContent }) => {
          // save response to mongodb

          await fetch(
            `${req.headers.get("origin")}/api/chat/addMessageToChat`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                cookie: req.headers.get("cookie"),
              },
              body: JSON.stringify({
                chatId,
                role: "assistant",
                content: fullContent,
              }),
            }
          );
        },
      }
    );

    return new Response(stream);
  } catch (err) {
    console.log("sendMessage error: ", err);
  }
}
