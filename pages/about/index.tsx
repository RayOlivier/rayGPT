import React from "react";

export default function About() {
  return (
    <div className=" flex min-h-[calc(100vh-48px)] w-full flex-col items-center justify-around px-12 py-10">
      <h1 className="pb-4 text-3xl">About RayGPT</h1>
      <section>
        <h2 className="pb-2 text-xl text-emerald-300">What is RayGPT?</h2>
        <p className="px-2 pb-2">
          {`This is a portfolio piece built by me, Ray Olivier, as a small way to
          showcase my skills. It's basically a personalized chatGPT clone built with the OpenAI API.`}
        </p>
        <p className="px-2">
          To learn more about the OpenAI API,{" "}
          <a
            href="https://platform.openai.com/docs/guides/text-generation"
            className="link"
          >
            visit their docs
          </a>
          . This app uses the text generation model, gpt-3.5-turbo.
        </p>
        <div className="p-4 text-emerald-100">
          <h3 className="underline">Tech stack used:</h3>
          <ul className="list-inside list-disc">
            <li>Next.js</li>
            <li>React</li>
            <li>TypeScript (JavaScript)</li>
            <li>MongoDB</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 className="pb-2 text-xl text-emerald-300">
          Can I trust information from RayGPT?
        </h2>
        <p className="px-2 pb-2">{`As with any large language model, it's possible for ai generated responses to be inaccurate or unreliable. It's recommended to fact check important information.`}</p>
        <p className="px-2">
          {`Though I've given my chat bot information about myself and my skills, I can't guarantee accuracy. It may decide to make something up, like that my birthday is in April or I'm a PHP expert. If you'd like to know more about me or my skills, you can check out `}
          <a
            target="_blank"
            href="https://www.linkedin.com/in/rayolivier/"
            className="link"
          >
            my LinkedIn
          </a>
          {` or `}{" "}
          <a href="mailto:rayolivier@outlook.com" className="link">
            reach out via email
          </a>
          {` for my resume.`}
        </p>
      </section>
    </div>
  );
}
