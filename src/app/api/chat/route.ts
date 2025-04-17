import { IPull } from "@/type";
import dump from '../../../../dump.json';
import { parallelCodeReview } from "./agent";

export async function POST(request: Request) {
  const body = await request.json();
  const { pulls } = body;
  
  const text = await parallelCodeReview(pulls as IPull[]);
  return new Response(JSON.stringify(text));
}
