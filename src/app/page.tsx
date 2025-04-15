'use client';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import Markdown from 'react-markdown';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/chat',
    schema: z.object({
      summary: z.string(),
    }),
  });

  return (
    <div>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>
      <Markdown>{object?.summary}</Markdown>
    </div>
  );
}