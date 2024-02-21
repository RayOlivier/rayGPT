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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function ChatPage({ chatId, title, messages = [] }) {
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [newChatMessages, setNewChatMessages] = useState<TChatMessage[] | []>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fullAIMessage, setFullAIMessage] = useState<string>("");
  const [submittedMessageChatId, setSubmittedMessageChatId] =
    useState<string>(chatId);

  const router = useRouter();

  const routeHasChanged = chatId !== submittedMessageChatId;

  // when our chatId changes, we want to reset the newChatMessages state
  useEffect(() => {
    setNewChatMessages([]);
    // setIncomingMessage("");
    setNewChatId(null);
  }, [chatId]);

  // save the newly streamed message
  useEffect(() => {
    if (!routeHasChanged && !isLoading && fullAIMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        { _id: uuid(), role: "assistant", content: fullAIMessage },
      ]);
    }
    setFullAIMessage("");
  }, [isLoading, fullAIMessage, routeHasChanged]);

  // navigate to newly created chat
  useEffect(() => {
    if (!isLoading && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmittedMessageChatId(chatId);

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
      <div className="grid h-[calc(100vh-48px)] grid-cols-[64px_1fr] text-white  sm:grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId}></ChatSidebar>

        <div className="flex flex-col overflow-hidden bg-zinc-700">
          <div className="flex flex-1 flex-col-reverse overflow-scroll text-white">
            {!allMessages.length && !incomingMessage && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  />
                  <h1 className="my-2 text-4xl font-bold text-emerald-200/75">
                    Ask RayGPT a question!
                  </h1>
                  <p>Hint: Try the following questions.</p>
                  <ul>
                    <li>{`What is your name?`}</li>
                    <li>{`What was used to build this site?`}</li>
                  </ul>
                </div>
              </div>
            )}
            {!!allMessages.length && (
              <div className="mb-auto">
                {[...messages, ...newChatMessages].map((message) => {
                  return (
                    <Message
                      key={message._id}
                      role={message.role}
                      content={message.content}
                    />
                  );
                })}
                {!!incomingMessage && !routeHasChanged && (
                  <>
                    <Message role={"assistant"} content={incomingMessage} />
                  </>
                )}
                {incomingMessage && routeHasChanged && (
                  <>
                    <Message
                      role="notice"
                      content="Please wait for the last response to complete before sending a new one."
                    />
                  </>
                )}
              </div>
            )}
          </div>
          <footer className="bg-zinc-800 px-10 py-6">
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
            <p className="px-2 pt-1 text-sm opacity-70">
              {`AI isn't foolproof. Consider fact checking important information and reading our `}{" "}
              <Link href={"/about"} className="link">
                about page
              </Link>
              .
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const chatId = context.params?.chatId?.[0] || null;
  if (chatId) {
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      // redirect if chatId is not a valid ObjectId
      return {
        redirect: { destination: "/chat" },
      };
    }

    const { user } = await getSession(context.req, context.res);
    const client = await clientPromise;

    const db = client.db("NextChat");
    const chat = await db.collection("chats").findOne({
      _id: new ObjectId(chatId),
      userId: user.sub,
    });

    if (!chat) {
      // redirect if chat does not exist
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
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
