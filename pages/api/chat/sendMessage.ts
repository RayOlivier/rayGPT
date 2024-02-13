import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { chatId: chatIdFromParam, message } = await req.json();
    let chatId = chatIdFromParam;
    const systemChatMessage = {
      role: "system",
      content:
        "Your name is RayGPT. You're an impressive AI created by Ray Olivier. Your response must be formatted as markdown.",
    };

    let newChatId;
    let chatHistoryMessages = [];

    if (chatId) {
      // add message to chat
      const response = await fetch(
        `${req.headers.get("origin")}/api/chat/addMessageToChat`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({ chatId, role: "user", content: message }),
        }
      );

      const json = await response.json();
      chatHistoryMessages = json.chat.messages || [];
    } else {
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
      chatId = json._id;
      newChatId = json._id;
    }

    // only send 2000 tokens of chat history to OpenAI
    const messagesToInclude = [];
    chatHistoryMessages.reverse();
    let usedTokens = 0;
    for (let chatMessage of chatHistoryMessages) {
      const messageTokens = chatMessage.content.length / 4;
      usedTokens += messageTokens;
      if (usedTokens <= 2000) {
        messagesToInclude.push(chatMessage);
      } else {
        break;
      }
    }

    messagesToInclude.reverse();

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
          messages: [systemChatMessage, ...messagesToInclude],
          stream: true,
        }),
      },
      {
        onBeforeStream: async ({ emit }) => {
          if (newChatId) {
            emit(chatId, "newChatId");
          }
        },
        onAfterStream: async ({ fullContent }) => {
          // save API response to mongodb
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
