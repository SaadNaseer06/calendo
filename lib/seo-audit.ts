import type { SeoCheck, SeoPageAudit, SeoSiteAudit } from "@/types/analytics";

function extractMeta(html: string, name: string): string | null {
  const byName = html.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, "i")
  );
  if (byName?.[1]) return byName[1].trim();

  const byNameAlt = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, "i")
  );
  return byNameAlt?.[1]?.trim() ?? null;
}

function extractPropertyMeta(html: string, property: string): string | null {
  const match = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i")
  );
  if (match?.[1]) return match[1].trim();

  const alt = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i")
  );
  return alt?.[1]?.trim() ?? null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

function countMatches(html: string, pattern: RegExp): number {
  return (html.match(pattern) ?? []).length;
}

function check(
  id: string,
  label: string,
  status: SeoCheck["status"],
  message: string,
  recommendation?: string
): SeoCheck {
  return { id, label, status, message, recommendation };
}

function scoreFromChecks(checks: SeoCheck[]): number {
  if (checks.length === 0) return 0;
  const points = checks.reduce((sum, c) => {
    if (c.status === "pass") return sum + 100;
    if (c.status === "warn") return sum + 60;
    return sum + 20;
  }, 0);
  return Math.round(points / checks.length);
}

export async function fetchPageHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Calendo-SEO-Audit/1.0 (+https://calendo.app)",
      Accept: "text/html",
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Could not fetch ${url} (${res.status})`);
  }

  return res.text();
}

export function auditHtml(url: string, html: string): SeoPageAudit {
  const checks: SeoCheck[] = [];
  const title = extractTitle(html);
  const description = extractMeta(html, "description");
  const viewport = extractMeta(html, "viewport");
  const robots = extractMeta(html, "robots");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null;
  const ogTitle = extractPropertyMeta(html, "og:title");
  const ogDescription = extractPropertyMeta(html, "og:description");
  const ogImage = extractPropertyMeta(html, "og:image");
  const h1Count = countMatches(html, /<h1[\s>]/gi);
  const imgCount = countMatches(html, /<img[\s>]/gi);
  const imgWithAlt = countMatches(html, /<img[^>]+alt=["'][^"']+["']/gi);
  const hasLang = /<html[^>]+lang=["'][a-z-]+["']/i.test(html);

  checks.push(
    title
      ? title.length >= 30 && title.length <= 60
        ? check("title", "Page title", "pass", `Title is ${title.length} chars: "${title.slice(0, 50)}…"`)
        : check(
            "title",
            "Page title",
            title.length < 30 ? "warn" : "warn",
            `Title is ${title.length} chars (ideal: 30–60)`,
            "Use a descriptive title between 30 and 60 characters."
          )
      : check("title", "Page title", "fail", "Missing <title> tag", "Add a unique title to every page.")
  );

  checks.push(
    description
      ? description.length >= 120 && description.length <= 160
        ? check("description", "Meta description", "pass", `Description is ${description.length} chars`)
        : check(
            "description",
            "Meta description",
            "warn",
            `Description is ${description.length} chars (ideal: 120–160)`,
            "Write a compelling meta description around 120–160 characters."
          )
      : check(
          "description",
          "Meta description",
          "fail",
          "Missing meta description",
          "Add <meta name=\"description\" content=\"...\">"
        )
  );

  checks.push(
    h1Count === 1
      ? check("h1", "H1 heading", "pass", "Exactly one H1 found")
      : check(
          "h1",
          "H1 heading",
          h1Count === 0 ? "fail" : "warn",
          h1Count === 0 ? "No H1 found" : `${h1Count} H1 tags found (should be 1)`,
          "Use a single H1 that describes the page topic."
        )
  );

  checks.push(
    viewport
      ? check("viewport", "Mobile viewport", "pass", "Viewport meta tag present")
      : check(
          "viewport",
          "Mobile viewport",
          "fail",
          "Missing viewport meta tag",
          "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        )
  );

  checks.push(
    hasLang
      ? check("lang", "Language attribute", "pass", "HTML lang attribute set")
      : check("lang", "Language attribute", "warn", "Missing html lang attribute", "Set lang=\"en\" on <html>.")
  );

  checks.push(
    canonical
      ? check("canonical", "Canonical URL", "pass", `Canonical: ${canonical}`)
      : check(
          "canonical",
          "Canonical URL",
          "warn",
          "No canonical link found",
          "Add <link rel=\"canonical\" href=\"...\"> to avoid duplicate content issues."
        )
  );

  checks.push(
    ogTitle && ogDescription
      ? check("open-graph", "Open Graph", ogImage ? "pass" : "warn", ogImage ? "OG title, description, and image set" : "OG tags present but missing og:image")
      : check(
          "open-graph",
          "Open Graph",
          "warn",
          "Incomplete Open Graph tags",
          "Add og:title, og:description, and og:image for social sharing."
        )
  );

  checks.push(
    imgCount === 0
      ? check("images", "Image alt text", "pass", "No images on page")
      : imgWithAlt / imgCount >= 0.8
        ? check("images", "Image alt text", "pass", `${imgWithAlt}/${imgCount} images have alt text`)
        : check(
            "images",
            "Image alt text",
            "warn",
            `${imgWithAlt}/${imgCount} images have alt text`,
            "Add descriptive alt attributes to all content images."
          )
  );

  checks.push(
    robots?.toLowerCase().includes("noindex")
      ? check("robots", "Indexability", "warn", `Robots: ${robots}`, "Page is set to noindex — fine for private app areas.")
      : check("robots", "Indexability", "pass", robots ? `Robots: ${robots}` : "Page is indexable")
  );

  return {
    url,
    score: scoreFromChecks(checks),
    checks,
    fetchedAt: new Date().toISOString(),
  };
}

export async function auditPage(url: string): Promise<SeoPageAudit> {
  const html = await fetchPageHtml(url);
  return auditHtml(url, html);
}

export async function auditSite(baseUrl: string, paths: readonly string[]): Promise<SeoSiteAudit> {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const pages: SeoPageAudit[] = [];

  for (const path of paths) {
    const target = path.startsWith("http")
      ? path
      : `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
    try {
      pages.push(await auditPage(target));
    } catch (e) {
      pages.push({
        url: target,
        score: 0,
        checks: [
          check(
            "fetch",
            "Page reachable",
            "fail",
            e instanceof Error ? e.message : "Could not fetch page",
            "Ensure the URL is public and returns HTML."
          ),
        ],
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  const summary = pages.reduce(
    (acc, page) => {
      for (const c of page.checks) {
        acc[c.status] += 1;
      }
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 }
  );

  const overallScore =
    pages.length === 0 ? 0 : Math.round(pages.reduce((sum, p) => sum + p.score, 0) / pages.length);

  return {
    baseUrl: normalizedBase,
    overallScore,
    pages,
    summary,
    auditedAt: new Date().toISOString(),
  };
}

export async function auditExternalWebsite(websiteUrl: string): Promise<SeoSiteAudit> {
  const base = websiteUrl.replace(/\/$/, "");
  let paths: string[] = [base];

  try {
    const html = await fetchPageHtml(base);
    const linkMatches = Array.from(html.matchAll(/href=["']([^"'#]+)["']/gi));
    const discovered = new Set<string>([base]);
    for (const match of linkMatches) {
      const href = match[1]?.trim();
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        continue;
      }
      try {
        const resolved = new URL(href, base).href.replace(/\/$/, "");
        if (resolved.startsWith(base) && !resolved.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip)$/i)) {
          discovered.add(resolved);
        }
      } catch {
        // ignore invalid URLs
      }
    }
    paths = Array.from(discovered).slice(0, 8);
  } catch {
    paths = [base];
  }

  return auditSite(base, paths);
}

export async function auditCalendoApp(): Promise<SeoSiteAudit> {
  const { getSiteBaseUrl } = await import("@/lib/site-routes");
  const { APP_SITE_ROUTES } = await import("@/lib/site-routes");
  return auditSite(getSiteBaseUrl(), APP_SITE_ROUTES);
}
