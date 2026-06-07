const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const articlesDir = path.join(projectRoot, "data", "articles");
const outputDir = path.join(projectRoot, "share");
const siteOrigin = "https://clsucollegian.vercel.app";

function readArticlesFromFile(filePath) {
    const source = fs.readFileSync(filePath, "utf8");
    const sandbox = { window: { CLSU_ARTICLES: [] } };

    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: path.basename(filePath) });

    return sandbox.window.CLSU_ARTICLES || [];
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(value) {
    try {
        return new URL(value, siteOrigin).toString();
    } catch (error) {
        return `${siteOrigin}/${String(value || "").replace(/^\/+/, "")}`;
    }
}

function buildSharePage(article) {
    const articleUrl = `${siteOrigin}/article.html?slug=${encodeURIComponent(article.slug)}`;
    const shareUrl = `${siteOrigin}/share/${encodeURIComponent(article.slug)}.html`;
    const imageUrl = article.image ? toAbsoluteUrl(article.image) : `${siteOrigin}/logo.png`;
    const imageAlt = article.imageAlt || article.title || "CLSU Collegian article image";
    const title = `${article.title} | CLSU Collegian`;
    const description = (article.summary || "Campus stories from CLSU Collegian.").trim();
    const redirectUrl = `${articleUrl}`;

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(redirectUrl)}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="robots" content="noindex,nofollow">
    <link rel="canonical" href="${escapeHtml(articleUrl)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CLSU Collegian">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(shareUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <script>
        window.location.replace(${JSON.stringify(redirectUrl)});
    </script>
</head>
<body>
    <p>Redirecting to the article. <a href="${escapeHtml(redirectUrl)}">Open the article</a>.</p>
</body>
</html>`;
}

function main() {
    const articleFiles = fs.readdirSync(articlesDir)
        .filter((fileName) => fileName.endsWith(".js"))
        .filter((fileName) => fileName !== "column.js");

    const articles = [];

    for (const fileName of articleFiles) {
        const filePath = path.join(articlesDir, fileName);
        try {
            articles.push(...readArticlesFromFile(filePath));
        } catch (error) {
            console.warn(`Skipping ${fileName}: ${error.message}`);
        }
    }

    fs.mkdirSync(outputDir, { recursive: true });

    for (const article of articles) {
        if (!article || !article.slug) {
            continue;
        }

        const outputPath = path.join(outputDir, `${article.slug}.html`);
        fs.writeFileSync(outputPath, buildSharePage(article), "utf8");
    }

    console.log(`Generated ${articles.filter((article) => article && article.slug).length} share pages.`);
}

main();
