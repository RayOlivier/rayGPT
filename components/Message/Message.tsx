import { useUser } from "@auth0/nextjs-auth0/client";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Image from "next/image";
import ReactMarkdown from "react-markdown";

type TMessageProps = {
  content: string;
  role: "user" | "assistant" | "notice";
};

export const Message: React.FC<TMessageProps> = ({
  role,
  content,
  ...rest
}) => {
  const { user } = useUser();
  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${
        role === "assistant"
          ? "bg-zinc-600"
          : role === "notice"
          ? "bg-red-900"
          : ""
      }`}
      {...rest}
    >
      <div>
        {role === "user" && user ? (
          <Image
            src={user.picture}
            width={30}
            height={30}
            alt="user avatar"
            className="rounded-sm shadow-md shadow-black/50"
          />
        ) : (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-zinc-800 px-1 shadow-md shadow-black/50">
            <FontAwesomeIcon icon={faRobot} className="text-emerald-200" />
          </div>
        )}
      </div>
      <div className="prose prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
