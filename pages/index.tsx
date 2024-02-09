import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";

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
          {!user ? (
            <>
              <Link href={"/api/auth/login"} className="btn">
                Login
              </Link>
              <Link href={"/api/auth/signup"} className="btn">
                Sign Up
              </Link>
            </>
          ) : (
            <Link href={"/api/auth/logout"}>Logout</Link>
          )}
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
