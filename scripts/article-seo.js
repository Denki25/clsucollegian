const SITE_NAME = "CLSU Collegian";
const SITE_BASE_URL = "https://clsucollegian.vercel.app";

function normalizeText(value, fallback = "") {
    if (typeof value !== "string") {
        return fallback;
    }

    const trimmed = value.trim();
    return trimmed || fallback;
}

function escapeHtml(value) {
    return normalizeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(value, baseUrl = SITE_BASE_URL) {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) {
        return "";
    }

    try {
        return new URL(normalizedValue, baseUrl).toString();
    } catch (error) {
        return normalizedValue;
    }
}

function getArticleSlug(article) {
    return normalizeText(article && article.slug);
}

function getArticlePreviewUrl(article) {
    const slug = getArticleSlug(article);
    if (!slug) {
        return `${SITE_BASE_URL}/article.html`;
    }

    return encodeURI(`${SITE_BASE_URL}/share/${slug}.html`);
}

function getArticleCanonicalUrl(article) {
    const slug = getArticleSlug(article);
    if (!slug) {
        return `${SITE_BASE_URL}/article.html`;
    }

    return `${SITE_BASE_URL}/article.html?slug=${encodeURIComponent(slug)}`;
}

function getSocialImage(article) {
    return toAbsoluteUrl(article && (article.socialImage || article.image || "logo.png"));
}

function getSocialImageAlt(article) {
    return normalizeText(article && (article.socialImageAlt || article.imageAlt || article.title), SITE_NAME);
}

function buildArticleSeo(article) {
    const title = normalizeText(article && article.title, "CLSU Collegian Article");
    const summary = normalizeText(article && article.summary, "Campus stories from CLSU Collegian.");
    const previewUrl = getArticlePreviewUrl(article);
    const canonicalUrl = getArticleCanonicalUrl(article);
    const image = getSocialImage(article);
    const imageAlt = getSocialImageAlt(article);

    return {
        title,
        summary,
        previewUrl,
        canonicalUrl,
        image,
        imageAlt,
        siteName: SITE_NAME,
        ogType: "article",
        twitterCard: "summary_large_image",
        imageWidth: "1200",
        imageHeight: "630"
    };
}

function buildSharePageHtml(article) {
    const seo = buildArticleSeo(article);
    const pageTitle = `${seo.title} | ${seo.siteName}`;

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(seo.summary)}">
    <meta name="robots" content="noindex,nofollow">
    <link rel="canonical" href="${seo.previewUrl}">
    <meta property="og:type" content="${seo.ogType}">
    <meta property="og:site_name" content="${escapeHtml(seo.siteName)}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(seo.summary)}">
    <meta property="og:url" content="${seo.previewUrl}">
    <meta property="og:image" content="${seo.image}">
    <meta property="og:image:secure_url" content="${seo.image}">
    <meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}">
    <meta property="og:image:width" content="${seo.imageWidth}">
    <meta property="og:image:height" content="${seo.imageHeight}">
    <meta name="twitter:card" content="${seo.twitterCard}">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(seo.summary)}">
    <meta name="twitter:image" content="${seo.image}">
    <meta name="twitter:image:secure_url" content="${seo.image}">
    <meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}">
</head>
<body>
    <main style="max-width: 720px; margin: 48px auto; font-family: Arial, sans-serif; padding: 0 20px;">
        <p style="text-transform: uppercase; letter-spacing: .12em; color: #fe5d13; font-weight: 700; margin-bottom: 12px;">CLSU Collegian</p>
        <h1 style="font-size: 2rem; line-height: 1.15; margin: 0 0 12px;">${escapeHtml(seo.title)}</h1>
        <p style="font-size: 1.05rem; line-height: 1.6; color: #444; margin: 0 0 24px;">${escapeHtml(seo.summary)}</p>
        <img src="${seo.image}" alt="${escapeHtml(seo.imageAlt)}" style="width: 100%; height: auto; border-radius: 16px; display: block; margin-bottom: 20px;">
        <p><a href="${seo.canonicalUrl}" style="display: inline-block; background: #fe5d13; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">Open the article</a></p>
    </main>
</body>
</html>
`;
}

module.exports = {
    SITE_NAME,
    SITE_BASE_URL,
    normalizeText,
    escapeHtml,
    toAbsoluteUrl,
    getArticleSlug,
    getArticlePreviewUrl,
    getArticleCanonicalUrl,
    getSocialImage,
    getSocialImageAlt,
    buildArticleSeo,
    buildSharePageHtml
};
