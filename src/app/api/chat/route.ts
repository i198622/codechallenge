import { IPull } from "@/type";
import { parallelCodeReview } from "./agent";
import { AgentPrompts } from "@/prompts/prompts";

export async function POST(request: Request) {
  const body = await request.json();
  const { pulls } = body;
  
  const text = await parallelCodeReview(pulls as IPull[]);
  return new Response(JSON.stringify(text));
}
