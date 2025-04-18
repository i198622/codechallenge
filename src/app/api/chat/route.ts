import { IPull } from "@/type";
import dump from '../../../../dimp_64_gemini_flash.json';
import { parallelCodeReview } from "./agent";

export async function POST(request: Request) {
  const body = await request.json();
  const { pulls } = body;
  
  // const text = await parallelCodeReview(pulls as IPull[]);
  return new Response(JSON.stringify(dump));
}
