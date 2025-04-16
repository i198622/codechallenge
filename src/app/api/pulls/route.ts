import { cache, IRepo } from "@/utils/cache";
import { getDiff, getPullRequests } from "@/utils/github";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import objectHash from "object-hash";

dayjs.extend(isBetween);

export async function POST(request: Request) {
  const body = await request.json();
  const { owner, repo, user, start_date, end_date, page = 0 } = body;

  const cKey = objectHash({ owner, repo, user, start_date, end_date, page });

  if (cache.get(cKey) === undefined) {
    try {
      const result = await getPullRequests({ owner, repo, page: page });
      // Get all diffs
      await Promise.all(
        result.data.map(async (p) => {
          const diffData = await getDiff(p.diff_url);
          cache.set(p.diff_url, diffData.data);
        })
      );

      cache.set(cKey, result.data);
    } catch (e) {
      // error
      return new Response("error", {
        status: 500,
      });
    }
  }

  const foundItems = cache
    .get(cKey)!
    .filter((e: IRepo) => e.user.login == user)
    .filter((e: IRepo) => dayjs(e.created_at).isBetween(start_date, end_date))
    .map((e: IRepo) => {
      return {
        id: e.number,
        html_url: e.html_url,
        title: e.title,
        body: e.body_text,
        is_merged: e.merged_at != null,
        diff: cache.get(e.diff_url),
      };
    });

  console.log(cache.get(cKey));
  
  return new Response(JSON.stringify(foundItems), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
