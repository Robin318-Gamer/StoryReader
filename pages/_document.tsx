import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="description" content="StoryReader - Google Cloud Text-to-Speech with AI-powered SSML storytelling" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
