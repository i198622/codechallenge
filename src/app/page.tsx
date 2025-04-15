'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import Markdown from 'react-markdown';
import { useCallback } from 'react';
import axios from 'axios';
import { Container, Spinner } from 'react-bootstrap';

export default function Page() {
  const { object, submit, isLoading } = useObject({
    api: '/api/chat',
    schema: z.object({
      summary: z.string(),
    }),
  });

  const getPulls = useCallback(async () => {
    const result = await axios.post('/api/pulls', {
      owner: "jina-ai",
      repo: "serve",
      user: "JoanFM",
      start_date: "2025-08-01",
      end_date: "2020-01-01",
    });
    submit({pulls: result.data});
  }, []);

  return (
    <Container fluid className='vh-100'>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      <button onClick={getPulls}>
        Get Data
      </button>
      
      {isLoading && (<Spinner />)}
      <Markdown>{object?.summary}</Markdown>
    </Container>
  );
}