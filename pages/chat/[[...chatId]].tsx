import Head from "next/head";
import { ChatSidebar } from "../../components/ChatSidebar";
import { FormEvent, use, useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { TChatMessage } from "../../utils/types";
import { v4 as uuid } from "uuid";
import { Message } from "../../components/Message";
import { useRouter } from "next/router";

export default function ChatPage({ chatId }) {
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [newChatMessages, setNewChatMessages] = useState<TChatMessage[] | []>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

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

    // const json = await response.json(); //serverless function

    // console.log("json", json);

    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });

    const data = response.body; // edge function
    if (!data) {
      return;
    }

    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log(message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((state) => `${state}${message.content}`);
      }
    });

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]  text-white">
        <ChatSidebar chatId={chatId}></ChatSidebar>
        <div className="flex flex-col overflow-hidden bg-zinc-700">
          <div className="flex-1 overflow-scroll text-white">
            {newChatMessages.map((message) => {
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
  return {
    props: {
      chatId,
    },
  };
};
