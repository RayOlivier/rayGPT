import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import bg from "../assets/greenBG.jpg";
import Image from "next/image";

export default function Home() {
  const { isLoading, error, user } = useUser();

  if (isLoading)
    return (
      <div className="flex min-h-[calc(100vh-48px)] w-full flex-col items-center justify-center bg-zinc-800 text-center text-white">
        <div className="h-20 w-20 animate-spin rounded-full border-8 border-zinc-600 border-t-emerald-400" />
        <span className="mt-4 text-lg">Loading...</span>
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <Head>
        <title>RayGPT</title>
      </Head>
      <div className="flex min-h-[calc(100vh-48px)] w-full items-center justify-center bg-zinc-800 text-center text-white">
        <Image
          src={bg}
          alt=""
          fill
          className="z-0 object-cover object-center opacity-40"
        />
        <div className="z-10">
          <div>
            <FontAwesomeIcon
              icon={faRobot}
              className="mb-2 text-6xl text-emerald-200"
            />
          </div>
          <h1 className="text-4xl font-bold">Welcome to RayGPT</h1>
          <p className="mt-2 text-lg">Log in with Auth0 to get started</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href={"/api/auth/login"} className="btn">
              Login
            </Link>
            <Link href={"/api/auth/signup"} className="btn">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);
  if (!!session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};
