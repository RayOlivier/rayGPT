import Head from "next/head";
import { ChatSidebar } from "../../components/ChatSidebar";
import { FormEvent, useState } from "react";
import { streamReader } from "openai-edge-stream";

export default function ChatPage() {
  const [incomingMessage, setIncomingMessage] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log(message);
      setIncomingMessage((state) => `${state}${message.content}`);
    });
  };

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]  text-white">
        <ChatSidebar></ChatSidebar>
        <div className="flex flex-col bg-neutral-700">
          <div className="flex-1 text-white">{incomingMessage}</div>
          <footer className="bg-neutral-800 p-10">
            <form onSubmit={(e) => handleSubmit(e)}>
              <fieldset className="flex gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full resize-none rounded-md bg-neutral-700 p-2 text-white focus:border-emerald-500 focus:bg-neutral-600 focus:outline focus:outline-emerald-500"
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
