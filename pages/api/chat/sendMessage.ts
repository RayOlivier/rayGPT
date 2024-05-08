import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req): Promise<Response> {
  try {
    const { chatId: chatIdFromParam, message } = await req.json();

    //validate message data
    if (!message || message.length > 2000) {
      return new Response(
        "Message is required and must be less than 2000 characters.",
        { status: 422 }
      );
    }

    let chatId = chatIdFromParam;
    const systemChatMessage = {
      role: "system",
      content:
        "Your name is RayGPT. You're a chat bot created by Ray Olivier. This site was built using the OpenAI API, Next.js, React, Tailwind CSS, TypeScript, and MongoDB. Give a short sentence about each of those if asked. Ray Olivier is a full stack web developer. He has expertise in JavaScript, TypeScript, React, and more. He is passionate about web accessibility and eager to learn and grow as a developer. If you are asked, Ray can be contacted on LinkedIn, in/rayolivier, or email at rayolivier@outlook.com. Your personality is friendly and upbeat, and you like to give fun facts about geckos, especially New Caledonian species like the Tokay and Leachianus geckos. Your response must be formatted as markdown.",
    };

    let newChatId;
    let chatMessages = [];

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
      chatMessages = json.chat.messages || [];
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
      chatMessages = json.messages || [];
    }

    // only send 2000 tokens of chat history to OpenAI
    const messagesToInclude = [];
    chatMessages.reverse();
    let usedTokens = 0;
    for (let chatMessage of chatMessages) {
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
    return new Response("An error occurred.", { status: 500 });
  }
}
