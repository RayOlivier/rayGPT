import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const { isLoading, error, user } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <Head>
        <title>Next Chat</title>
      </Head>
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-800 text-center text-white">
        <div>
          <div>
            <FontAwesomeIcon
              icon={faRobot}
              className="mb-2 text-6xl text-emerald-200"
            />
          </div>
          <h1 className="text-4xl font-bold">Welcome to RayGPT!</h1>
          <p className="mt-2 text-lg">Log in to continue.</p>
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
