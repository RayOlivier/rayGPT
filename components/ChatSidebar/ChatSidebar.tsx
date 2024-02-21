import {
  faBars,
  faHistory,
  faMessage,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar: React.FC<{
  chatId: string | null;
  className?: string;
}> = ({ chatId, className, ...rest }) => {
  const [chatList, setChatList] = useState([]);
  const [mobileSlideOutOpen, setMobileSlideOutOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch("/api/chat/getChatList", { method: "POST" });
      const json = await response.json();
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);

  return (
    <div
      className={
        "flex flex-col overflow-hidden bg-zinc-900 text-white " + className
      }
      {...rest}
    >
      <Link
        className="side-menu-item hidden bg-emerald-500 hover:bg-emerald-600 sm:flex"
        href="/chat"
      >
        <FontAwesomeIcon icon={faPenToSquare} />
        <span className="hidden sm:block">New Chat</span>
      </Link>
      {/* Chat list */}
      <div className="hidden flex-1 overflow-auto bg-zinc-950 sm:block">
        {chatList.map((chat) => {
          return (
            <Link
              className={`side-menu-item  ${
                chatId === chat._id ? "bg-zinc-700 hover:bg-zinc-700" : ""
              }`}
              key={chat._id}
              href={`/chat/${chat._id}`}
            >
              <FontAwesomeIcon icon={faMessage} className="text-white/50" />
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
      <button
        className={`side-menu-item my-0 justify-center transition-all sm:hidden ${
          mobileSlideOutOpen ? "mx-0 rounded-none bg-zinc-950" : ""
        }`}
        onClick={() => setMobileSlideOutOpen(!mobileSlideOutOpen)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      {/* Chat list SLIDE OUT */}

      <div
        className={`absolute left-16 z-20 h-[calc(100vh-48px)] flex-1 overflow-auto bg-zinc-950 transition-all sm:hidden ${
          mobileSlideOutOpen ? "left-16 w-60" : "w-0"
        }`}
      >
        <Link
          className="side-menu-item  bg-emerald-500 hover:bg-emerald-600"
          href="/chat"
          onClick={() => setMobileSlideOutOpen(false)}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>New Chat</span>
        </Link>
        {chatList.map((chat) => {
          return (
            <Link
              className={`side-menu-item  ${
                chatId === chat._id ? "bg-zinc-700 hover:bg-zinc-700" : ""
              }`}
              key={chat._id}
              onClick={() => setMobileSlideOutOpen(false)}
              href={`/chat/${chat._id}`}
            >
              <FontAwesomeIcon icon={faMessage} className="text-white/50" />
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
      <div
        className={`absolute left-16 top-0 z-10 h-screen w-screen${
          !mobileSlideOutOpen ? "hidden" : ""
        }`}
        onClick={() => setMobileSlideOutOpen(false)}
      ></div>
      {/* Mobile Slide out end */}
      <Link
        className="side-menu-item justify-center sm:justify-start"
        href="/api/auth/logout"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        <span className="hidden sm:block">Logout</span>
      </Link>
    </div>
  );
};
