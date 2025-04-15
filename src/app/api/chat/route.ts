import { parallelCodeReview } from "./agent";

export async function POST(req: Request) {
  // const ollama = createOllama({
  //   baseURL: "https://neuralhelper.ru/ollama/api/",
  //   headers: {
  //     Authorization: "Basic ZnJwc191c2VyOmVqcmozOHU5Mm5ram5iZitlb2RqXzNuMzlk",
  //   },
  // });

  // const { text } = await generateText({
  //   model: ollama("qwen2.5-coder:32b"),
  //   prompt: "What is love?",
  // });
  const code = `
   function test(a, b) {
    return a + b + 1;
   }
  `;
  
  const text = await parallelCodeReview(code);

  return new Response(JSON.stringify(text));
}
