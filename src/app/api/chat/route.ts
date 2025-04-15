import { parallelCodeReview } from "./agent";

export async function POST(request: Request) {
  // Отправляю запрос на пулл
  // Получаю чанк отправляю его в 
  const body = await request.json();
  const { code } = body;
  // const code = `
  //  function test(a, b) {
  //   return a + b + 1;
  //  }
  // `;

  const text = await parallelCodeReview(code);
  console.log(code);

  return new Response(JSON.stringify(text));
}
