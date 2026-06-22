interface RedditChild {
  data: { title: string };
}

interface RedditResponse {
  data?: { children?: RedditChild[] };
}

export async function getGoogleTrends(geo = "US"): Promise<string[]> {
  try {
    const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const matches = xml.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g) ?? [];
    return matches
      .map((m) => m.replace(/<title><!\[CDATA\[/, "").replace(/\]\]><\/title>/, ""))
      .slice(1, 11);
  } catch {
    return [];
  }
}

const nicheToSubreddit: Record<string, string> = {
  fashion: "femalefashionadvice",
  tech: "technology",
  food: "food",
  fitness: "fitness",
  realestate: "realestate",
  beauty: "beauty",
  travel: "travel",
  business: "entrepreneur",
  gaming: "gaming",
  finance: "personalfinance",
};

export async function getRedditTrends(niche: string): Promise<string[]> {
  try {
    const key = niche.toLowerCase().replace(/\s+/g, "");
    const subreddit = nicheToSubreddit[key] ?? "socialmedia";
    const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=5&t=week`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Calendo/1.0; +https://localhost)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return [];

    const json = (await res.json()) as RedditResponse;
    return json?.data?.children?.map((p) => p.data.title) ?? [];
  } catch {
    return [];
  }
}
