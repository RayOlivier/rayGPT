import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

const NavBar = ({ toggle }: { toggle: () => void }) => {
  return (
    <>
      <div className="sticky top-0 z-30 h-12 w-full bg-zinc-900 text-white">
        <div className="container mx-auto h-full px-4">
          <div className="flex h-full items-center justify-between">
            <Link href="/">
              <FontAwesomeIcon
                icon={faRobot}
                className="text-xl text-emerald-200"
              />
            </Link>
            <ul className="flex gap-x-6 text-white md:flex">
              <li>
                <Link href="/about">
                  <p>About</p>
                </Link>
              </li>

              <li>
                <Link href="/chat">
                  <p>Chat</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
