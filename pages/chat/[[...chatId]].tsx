import Head from "next/head";
import { ChatSidebar } from "../../components/ChatSidebar";
import { FormEvent, use, useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { TChatMessage } from "../../utils/types";
import { v4 as uuid } from "uuid";
import { Message } from "../../components/Message";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default function ChatPage({ chatId, title, messages = [] }) {
  console.log("props", title, messages);
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [newChatMessages, setNewChatMessages] = useState<TChatMessage[] | []>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fullAIMessage, setFullAIMessage] = useState<string>("");

  const router = useRouter();

  // when our chatId changes, we want to reset the newChatMessages state
  useEffect(() => {
    setNewChatMessages([]);
  }, [chatId]);

  // save the newly streamed message
  useEffect(() => {
    if (!isLoading && fullAIMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        { _id: uuid(), role: "assistant", content: fullAIMessage },
      ]);
    }
  }, [isLoading, fullAIMessage]);

  // navigated to newly created chat
  useEffect(() => {
    if (!isLoading && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setNewChatMessages((prev) => {
      const newChatMessages: TChatMessage[] = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");

    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ chatId, message: messageText }),
    });

    const data = response.body; // edge function
    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
      console.log(message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((state) => `${state}${message.content}`);
        content = content + message.content;
      }
    });

    setFullAIMessage(content);
    setIncomingMessage("");
    setIsLoading(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]  text-white">
        <ChatSidebar chatId={chatId}></ChatSidebar>
        <div className="flex flex-col overflow-hidden bg-zinc-700">
          <div className="flex-1 overflow-scroll text-white">
            {allMessages.map((message) => {
              return (
                <Message
                  key={message._id}
                  role={message.role}
                  content={message.content}
                />
              );
            })}
            {incomingMessage && (
              <Message role={"assistant"} content={incomingMessage} />
            )}
          </div>
          <footer className="bg-zinc-800 p-10">
            <form onSubmit={(e) => handleSubmit(e)}>
              <fieldset className="flex gap-2" disabled={isLoading}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isLoading ? "" : "Send a message..."}
                  className="w-full resize-none rounded-md bg-zinc-700 p-2 text-white focus:border-emerald-500 focus:bg-zinc-600 focus:outline focus:outline-emerald-500"
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const chatId = context.params?.chatId?.[0] || null;
  if (chatId) {
    const { user } = await getSession(context.req, context.res);
    const client = await clientPromise;

    const db = client.db("NextChat");
    const chat = await db.collection("chats").findOne({
      _id: new ObjectId(chatId),
      userId: user.sub,
    });
    return {
      props: {
        chatId,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
