const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { buildSharePageHtml } = require("./article-seo");

const ROOT_DIR = path.resolve(__dirname, "..");
const SHARE_DIR = path.join(ROOT_DIR, "share");
const ARTICLE_FILES = [
    path.join(ROOT_DIR, "data", "articles", "editorial.js"),
    path.join(ROOT_DIR, "data", "articles", "column.js"),
    path.join(ROOT_DIR, "data", "articles", "literary.js"),
    path.join(ROOT_DIR, "data", "articles", "features.js"),
    path.join(ROOT_DIR, "data", "articles", "opinion.js"),
    path.join(ROOT_DIR, "data", "articles", "devcom.js"),
    path.join(ROOT_DIR, "data", "articles", "sports.js"),
    path.join(ROOT_DIR, "data", "articles", "komiks.js"),
    path.join(ROOT_DIR, "data", "articles", "news.js")
];

function loadArticlesFromFile(filePath) {
    const code = fs.readFileSync(filePath, "utf8");
    const context = {
        window: {
            CLSU_ARTICLES: []
        }
    };

    vm.runInNewContext(code, context, { filename: filePath });
    return Array.isArray(context.window.CLSU_ARTICLES) ? context.window.CLSU_ARTICLES : [];
}

function loadAllArticles() {
    return ARTICLE_FILES.flatMap(loadArticlesFromFile);
}

function main() {
    const articles = loadAllArticles();
    const writtenFiles = [];

    fs.mkdirSync(SHARE_DIR, { recursive: true });

    articles.forEach((article) => {
        if (!article || typeof article.slug !== "string" || !article.slug.trim()) {
            return;
        }

        const fileName = `${article.slug.trim()}.html`;
        const targetPath = path.join(SHARE_DIR, fileName);
        const html = buildSharePageHtml(article);
        fs.writeFileSync(targetPath, html, "utf8");
        writtenFiles.push(fileName);
    });

    console.log(`Generated ${writtenFiles.length} share preview pages.`);
}

main();
