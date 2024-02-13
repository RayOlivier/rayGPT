import {
  faMessage,
  faPlus,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar: React.FC<{ chatId: string | null }> = ({
  chatId,
}) => {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch("/api/chat/getChatList", { method: "POST" });
      const json = await response.json();
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);

  return (
    <div className="flex flex-col overflow-hidden bg-zinc-900 text-white">
      <Link
        className="side-menu-item bg-emerald-500 hover:bg-emerald-600"
        href="/chat"
      >
        <FontAwesomeIcon icon={faPlus} />
        New Chat
      </Link>
      <div className="flex-1 overflow-auto bg-zinc-950">
        {chatList.map((chat) => {
          return (
            <Link
              className={`side-menu-item ${
                chatId === chat._id ? "bg-zinc-700 hover:bg-zinc-700" : ""
              }`}
              key={chat._id}
              href={`/chat/${chat._id}`}
            >
              <FontAwesomeIcon icon={faMessage} />
              <span
                title={chat.title}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {chat.title}
              </span>
            </Link>
          );
        })}
      </div>
      <Link className="side-menu-item" href="/api/auth/logout">
        <FontAwesomeIcon icon={faRightFromBracket} />
        Logout
      </Link>
    </div>
  );
};
