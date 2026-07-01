const siteConfig = window.CLSU_SITE_CONFIG || {};
const siteArticles = Array.isArray(window.CLSU_ARTICLES) ? [...window.CLSU_ARTICLES] : [];
const siteMultimedia = Array.isArray(window.CLSU_MULTIMEDIA)
    ? [...window.CLSU_MULTIMEDIA].sort((left, right) => {
        return compareMultimediaDates(left.date, right.date);
    })
    : [];
const siteIssues = Array.isArray(window.CLSU_ISSUES) ? [...window.CLSU_ISSUES] : [];

siteArticles.sort((left, right) => {
    const leftTime = left.date ? new Date(`${left.date}T00:00:00`).getTime() : 0;
    const rightTime = right.date ? new Date(`${right.date}T00:00:00`).getTime() : 0;
    return rightTime - leftTime;
});

siteIssues.sort((left, right) => {
    const leftTime = left.date ? new Date(`${left.date}T00:00:00`).getTime() : 0;
    const rightTime = right.date ? new Date(`${right.date}T00:00:00`).getTime() : 0;
    return rightTime - leftTime;
});

const siteData = {
    articles: siteArticles,
    trending: Array.isArray(siteConfig.trending) ? siteConfig.trending : [],
    tickerItems: Array.isArray(siteConfig.tickerItems) ? siteConfig.tickerItems : [],
    featuredSlug: siteConfig.featuredSlug || "",
    featuredCategory: siteConfig.featuredCategory || "News",
    featuredCount: Number(siteConfig.featuredCount) || 5
};

const themeStorageKey = "clsu-theme";
let themeSwitchTimerId = null;

function injectVercelAnalytics() {
    if (document.getElementById("vercel-analytics-script")) {
        return;
    }

    // Vercel Web Analytics bootstrap for this static HTML site.
    window.va = window.va || function () {
        (window.vaq = window.vaq || []).push(arguments);
    };

    const script = document.createElement("script");
    script.id = "vercel-analytics-script";
    script.defer = true;
    script.src = "https://va.vercel-scripts.com/v1/script.js";
    document.head.appendChild(script);
}

injectVercelAnalytics();

function injectVercelSpeedInsights() {
    if (document.getElementById("vercel-speed-insights-script")) {
        return;
    }

    // Vercel Speed Insights bootstrap for this static HTML site.
    window.si = window.si || function () {
        (window.siq = window.siq || []).push(arguments);
    };

    const script = document.createElement("script");
    script.id = "vercel-speed-insights-script";
    script.defer = true;
    script.src = "https://va.vercel-scripts.com/v1/speed-insights/script.js";
    document.head.appendChild(script);
}

injectVercelSpeedInsights();

function getPreferredTheme() {
    try {
        const savedTheme = window.localStorage.getItem(themeStorageKey);
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch (error) {
        // Ignore storage access failures.
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme, persist = true) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const root = document.documentElement;
    document.documentElement.dataset.theme = normalizedTheme;
    root.style.colorScheme = normalizedTheme;

    if (persist) {
        try {
            window.localStorage.setItem(themeStorageKey, normalizedTheme);
        } catch (error) {
            // Ignore storage access failures.
        }
    }

    root.classList.add("theme-switching");
    if (themeSwitchTimerId) {
        window.clearTimeout(themeSwitchTimerId);
    }
    themeSwitchTimerId = window.setTimeout(() => {
        root.classList.remove("theme-switching");
        themeSwitchTimerId = null;
    }, 420);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        const isDark = normalizedTheme === "dark";
        button.setAttribute("aria-pressed", isDark ? "true" : "false");
        button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        button.innerHTML = isDark
            ? `
                <span class="theme-toggle-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M20.1 15.3A8.3 8.3 0 0 1 8.7 3.9a1 1 0 0 0-1.24-1.24A10.5 10.5 0 1 0 21.34 16.54a1 1 0 0 0-1.24-1.24Z"/>
                    </svg>
                </span>
            `
            : `
                <span class="theme-toggle-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <circle cx="12" cy="12" r="4.25" fill="currentColor"/>
                        <g stroke="currentColor" stroke-linecap="round" stroke-width="1.8" fill="none">
                            <path d="M12 2.5v2.2"/>
                            <path d="M12 19.3v2.2"/>
                            <path d="M2.5 12h2.2"/>
                            <path d="M19.3 12h2.2"/>
                            <path d="M5.1 5.1l1.56 1.56"/>
                            <path d="M17.34 17.34l1.56 1.56"/>
                            <path d="M18.9 5.1l-1.56 1.56"/>
                            <path d="M6.66 17.34l-1.56 1.56"/>
                        </g>
                    </svg>
                </span>
            `;
    });
}

function setupThemeToggle() {
    const navTools = document.querySelector(".nav-tools");
    const headerSearch = document.querySelector(".header-search");
    const hamburger = document.querySelector(".hamburger");

    if (!navTools || navTools.querySelector("[data-theme-toggle]")) {
        return;
    }

    const themeToggle = document.createElement("button");
    themeToggle.type = "button";
    themeToggle.className = "theme-toggle";
    themeToggle.setAttribute("data-theme-toggle", "true");

    if (headerSearch && headerSearch.nextSibling) {
        navTools.insertBefore(themeToggle, hamburger || null);
    } else if (hamburger) {
        navTools.insertBefore(themeToggle, hamburger);
    } else {
        navTools.appendChild(themeToggle);
    }

    applyTheme(document.documentElement.dataset.theme || getPreferredTheme(), false);

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

applyTheme(getPreferredTheme(), false);

function ensurePageTransitionLoader() {
    let loader = document.getElementById("pageTransitionLoader");
    if (loader) {
        return loader;
    }

    loader = document.createElement("div");
    loader.id = "pageTransitionLoader";
    loader.className = "page-transition-loader";
    loader.hidden = true;
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = `
        <div class="page-transition-loader-wave" aria-hidden="true"></div>
    `;
    document.body.appendChild(loader);
    return loader;
}

function showPageTransitionLoader() {
    const loader = ensurePageTransitionLoader();
    loader.hidden = false;
    loader.classList.add("is-visible");
}

function hidePageTransitionLoader() {
    const loader = document.getElementById("pageTransitionLoader");
    if (!loader) {
        return;
    }

    loader.classList.remove("is-visible");
    loader.hidden = true;
}

function isArticleNavigationLink(anchor) {
    if (!anchor || anchor.tagName !== "A") {
        return false;
    }

    const href = anchor.getAttribute("href") || "";
    return href.includes("article.html?slug=");
}

function setupArticleNavigationTransition() {
    document.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const anchor = event.target.closest && event.target.closest("a");
        if (!isArticleNavigationLink(anchor)) {
            return;
        }

        const target = anchor.getAttribute("target");
        if (target && target !== "_self") {
            return;
        }

        const href = anchor.getAttribute("href");
        if (!href) {
            return;
        }

        event.preventDefault();
        showPageTransitionLoader();

        window.setTimeout(() => {
            window.location.href = href;
        }, 180);
    }, true);

    window.addEventListener("pageshow", hidePageTransitionLoader);
    window.addEventListener("beforeunload", () => {
        const loader = document.getElementById("pageTransitionLoader");
        if (loader) {
            loader.hidden = false;
            loader.classList.add("is-visible");
        }
    });
}

setupArticleNavigationTransition();

let articleProgressRafId = null;

function ensureArticleReadingProgress() {
    const articleMain = document.querySelector(".article-main");
    if (!articleMain) {
        return null;
    }

    let progressShell = document.getElementById("articleReadingProgress");
    if (progressShell) {
        return progressShell;
    }

    progressShell = document.createElement("div");
    progressShell.id = "articleReadingProgress";
    progressShell.className = "article-reading-progress";
    progressShell.setAttribute("aria-hidden", "true");
    progressShell.innerHTML = `
        <div class="article-reading-progress-bar" aria-hidden="true">
            <span id="articleReadingProgressFill"></span>
        </div>
    `;

    document.body.appendChild(progressShell);
    return progressShell;
}

function ensureArticleScrollTopButton() {
    const articleMain = document.querySelector(".article-main");
    if (!articleMain) {
        return null;
    }

    let scrollTopButton = document.getElementById("articleScrollTopButton");
    if (scrollTopButton) {
        return scrollTopButton;
    }

    scrollTopButton = document.createElement("button");
    scrollTopButton.id = "articleScrollTopButton";
    scrollTopButton.className = "article-scroll-top-button";
    scrollTopButton.type = "button";
    scrollTopButton.setAttribute("aria-label", "Scroll to top of article");
    scrollTopButton.hidden = true;
    scrollTopButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5.5 4.5 13l1.06 1.06L11.25 8.4V18h1.5V8.4l5.69 5.66L19.5 13 12 5.5Z"></path>
        </svg>
    `;

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    document.body.appendChild(scrollTopButton);
    return scrollTopButton;
}

function updateArticleScrollTopButton() {
    const scrollTopButton = document.getElementById("articleScrollTopButton");
    if (!scrollTopButton) {
        return;
    }

    const scrollTop = Math.max(window.scrollY || document.documentElement.scrollTop || 0, 0);
    const revealThreshold = Math.max(120, Math.min(window.innerHeight * 0.18, 180));
    scrollTopButton.hidden = scrollTop < revealThreshold;
}

function updateArticleReadingProgress() {
    const progressShell = document.getElementById("articleReadingProgress");
    const progressFill = document.getElementById("articleReadingProgressFill");
    const articleMain = document.querySelector(".article-main");
    const articleFigure = document.querySelector(".featured-image");
    const articleBody = document.querySelector(".article-body");
    const tickerWrap = document.querySelector(".breaking-news");
    if (!progressShell || !progressFill || !articleMain || !articleBody) {
        return;
    }

    const scrollTop = Math.max(window.scrollY || document.documentElement.scrollTop || 0, 0);
    const viewportBottom = scrollTop + window.innerHeight;
    const articleStartElement = articleFigure || articleMain;
    const articleStart = articleStartElement.getBoundingClientRect().top + scrollTop;
    const articleEnd = articleBody.getBoundingClientRect().bottom + scrollTop;
    const readingRange = Math.max(articleEnd - articleStart, 1);
    const tickerBottom = tickerWrap ? tickerWrap.getBoundingClientRect().bottom + scrollTop : 0;
    const hasPassedTicker = !tickerWrap || scrollTop > tickerBottom + 8;
    const hasReachedPhoto = viewportBottom >= articleStart;
    const progress = hasReachedPhoto
        ? Math.min(100, Math.max(0, ((viewportBottom - articleStart) / readingRange) * 100))
        : 0;
    const rounded = Math.round(progress);

    progressShell.hidden = !(hasPassedTicker && hasReachedPhoto);
    progressFill.style.width = `${rounded}%`;
    progressShell.dataset.endReached = progress >= 98 ? "true" : "false";
}

function setupArticleReadingProgress() {
    const articleMain = document.querySelector(".article-main");
    if (!articleMain) {
        return;
    }

    ensureArticleReadingProgress();
    ensureArticleScrollTopButton();

    const scheduleUpdate = () => {
        if (articleProgressRafId) {
            return;
        }

        articleProgressRafId = window.requestAnimationFrame(() => {
            articleProgressRafId = null;
            updateArticleReadingProgress();
            updateArticleScrollTopButton();
        });
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("pageshow", scheduleUpdate);

    scheduleUpdate();
}

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function getArticleUrl(slug) {
    return `article.html?slug=${encodeURIComponent(slug)}`;
}

function getArticleShareUrl(slug) {
    if (!slug) {
        return window.location.href;
    }

    try {
        const baseUrl = window.location.origin && window.location.origin !== "null"
            ? window.location.origin
            : window.location.href;
        return new URL(`share/${slug}.html`, baseUrl).toString();
    } catch (error) {
        return `share/${slug}.html`;
    }
}

function normalizeSlugValue(slug) {
    if (typeof slug !== "string") {
        return "";
    }

    return slug
        .trim()
        .toLowerCase()
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[“”„‟]/g, '"');
}

function getArticleBySlug(slug) {
    const normalizedSlug = normalizeSlugValue(slug);
    return siteData.articles.find((article) => normalizeSlugValue(article.slug) === normalizedSlug) || null;
}

function getArticleDisplayCategory(article) {
    if (!article || typeof article !== "object") {
        return "Article";
    }

    const customLabel = typeof article.displayCategory === "string"
        ? article.displayCategory.trim()
        : "";

    return customLabel || article.category || "Article";
}

function getRecentArticlesByCategory(category, limit = 5) {
    if (!category) {
        return [];
    }

    return siteData.articles
        .filter((article) => article.category === category)
        .slice(0, Math.max(0, limit));
}

function getIssueUrl(issue) {
    const issueSlug = issue && issue.slug ? issue.slug : "";
    return issueSlug ? `issues.html#${encodeURIComponent(issueSlug)}` : "issues.html";
}

function getSortedIssuesByNewest() {
    return sortItemsByNewest(siteIssues);
}

function toAbsoluteUrl(value) {
    if (!value) {
        return "";
    }

    try {
        return new URL(value, window.location.origin).toString();
    } catch (error) {
        return value;
    }
}

function setMetaContent(id, content, attribute = "content") {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    element.setAttribute(attribute, content || "");
}

function normalizeArticleImageItem(image, fallbackAlt = "") {
    if (!image) {
        return null;
    }

    if (typeof image === "string") {
        const src = image.trim();
        return src ? { src, alt: fallbackAlt, caption: "" } : null;
    }

    if (typeof image !== "object") {
        return null;
    }

    const src = (image.src || image.image || image.url || "").trim();
    if (!src) {
        return null;
    }

    return {
        src,
        alt: (image.alt || image.imageAlt || fallbackAlt || "").trim(),
        caption: (image.caption || image.description || "").trim(),
        showCaption: image.showCaption !== false
    };
}

function getArticleImages(article) {
    if (!article) {
        return [];
    }

    if (Array.isArray(article.images) && article.images.length > 0) {
        return article.images
            .map((image) => normalizeArticleImageItem(image, article.title || ""))
            .filter(Boolean);
    }

    const fallbackImage = normalizeArticleImageItem(article.image ? {
        src: article.image,
        alt: article.imageAlt || article.title || ""
    } : null, article.title || "");

    return fallbackImage ? [fallbackImage] : [];
}

function getPrimaryArticleImage(article) {
    return getArticleImages(article)[0] || null;
}

function updateArticleSocialMeta(article) {
    // Keep these values aligned with scripts/article-seo.js, which generates the
    // server-rendered /share/*.html preview pages used by Facebook and X/Twitter.
    if (!article) {
        return;
    }

    const canonicalUrl = toAbsoluteUrl(getArticleUrl(article.slug));
    const shareUrl = toAbsoluteUrl(getArticleShareUrl(article.slug));
    const primaryImage = getPrimaryArticleImage(article);
    const articleImage = primaryImage ? toAbsoluteUrl(primaryImage.src) : toAbsoluteUrl("PHOTOS/NEWS/news3.jpg");
    const articleTitle = `${article.title} | CLSU Collegian`;
    const articleDescription = (article.summary || "Campus stories from CLSU Collegian.").trim();
    const articleImageAlt = (primaryImage?.alt || article.title || "CLSU Collegian article image").trim();

    document.title = articleTitle;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
        descriptionMeta.setAttribute("content", articleDescription);
    }

    setMetaContent("canonicalUrl", canonicalUrl, "href");
    setMetaContent("ogTitle", articleTitle);
    setMetaContent("ogDescription", articleDescription);
    setMetaContent("ogUrl", shareUrl);
    setMetaContent("ogImage", articleImage);
    setMetaContent("ogImageAlt", articleImageAlt);
    setMetaContent("ogImageWidth", "1200");
    setMetaContent("ogImageHeight", "630");
    setMetaContent("twitterTitle", articleTitle);
    setMetaContent("twitterDescription", articleDescription);
    setMetaContent("twitterImage", articleImage);
    setMetaContent("twitterImageAlt", articleImageAlt);
}

function getAuthorLine(article) {
    const author = (article?.author || "").trim();
    const fallbackAuthorLine = author ? `By ${author}, CLSU Collegian` : "";

    if (!article.authorLine) {
        return fallbackAuthorLine;
    }

    const normalizedAuthor = author.toLowerCase();
    const normalizedAuthorLine = article.authorLine.trim().toLowerCase();

    if (normalizedAuthor && !normalizedAuthorLine.includes(normalizedAuthor)) {
        return fallbackAuthorLine;
    }

    return article.authorLine;
}

function shouldShowByline(article) {
    return (article?.category || "").trim() !== "Editorial";
}

function normalizeCreditValue(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^(by|via|written by|isinulat ni\/na|iginuhit ni\/na|animasyon ni\/na|larawan ni\/na|inianyo ni\/na)\s+/i, "");
}

function getCreditLabelPreset(article) {
    const preset = (article?.credits?.labelPreset || article?.creditLabelPreset || "").trim().toLowerCase();
    if (preset === "via" || preset === "written" || preset === "filipino") {
        return preset;
    }

    return article?.category === "Literary" ? "written" : "via";
}

function getCreditLabels(article) {
    const preset = getCreditLabelPreset(article);
    const customLabels = article?.credits?.labels && typeof article.credits.labels === "object"
        ? article.credits.labels
        : {};
    const customPhotoLabel = customLabels.photo || customLabels.photos || customLabels.photoBy || customLabels.photosBy || "";
    const customPhotosLabel = customLabels.photos || customLabels.photosBy || customLabels.photoBy || "";
    const baseLabels = preset === "filipino"
        ? {
            by: "Isinulat ni/na:",
            illustratedBy: "Iginuhit ni/na:",
            animationBy: "Animasyon ni/na:",
            photo: "Larawan ni/na:",
            photos: "Larawan ni/na:",
            layoutBy: "Inianyo ni/na:"
        }
        : {
            by: preset === "written" ? "Written by:" : "Via:",
            illustratedBy: "Illustrated by:",
            animationBy: "Animation by:",
            photo: "Photo by:",
            photos: "Photos by:",
            layoutBy: "Layout by:"
        };

    return {
        by: customLabels.by || baseLabels.by,
        illustratedBy: customLabels.illustratedBy || baseLabels.illustratedBy,
        animationBy: customLabels.animationBy || baseLabels.animationBy,
        photo: customPhotoLabel || baseLabels.photo,
        photos: customPhotosLabel || customPhotoLabel || baseLabels.photos,
        layoutBy: customLabels.layoutBy || baseLabels.layoutBy
    };
}

function pushCredit(items, label, value) {
    const normalizedValue = normalizeCreditValue(value);
    if (!normalizedValue) {
        return;
    }

    items.push({ label, value: normalizedValue });
}

function getPhotoCreditLabel(value, article) {
    const labels = getCreditLabels(article);
    const normalizedValue = normalizeCreditValue(value).toLowerCase();
    const hasMultipleNames = normalizedValue.includes(" and ")
        || normalizedValue.includes("&")
        || normalizedValue.includes(",");

    return hasMultipleNames ? labels.photos : labels.photo;
}

function getArticleCredits(article) {
    const credits = article && typeof article.credits === "object" && article.credits !== null
        ? article.credits
        : {};
    const labels = getCreditLabels(article);
    const items = [];

    if (shouldShowByline(article)) {
        pushCredit(items, labels.by, credits.by || getAuthorLine(article));
    }

    const photoCredit = credits.photosBy || article.photosBy;
    if (normalizeCreditValue(photoCredit)) {
        pushCredit(items, getPhotoCreditLabel(photoCredit, article), photoCredit);
    }

    pushCredit(items, labels.layoutBy, credits.layoutBy || article.layoutBy);
    pushCredit(items, labels.illustratedBy, credits.illustratedBy || article.illustratedBy);
    pushCredit(items, labels.animationBy, credits.animationBy || article.animationBy);

    const extraCredits = Array.isArray(credits.extra)
        ? credits.extra
        : (Array.isArray(article.extraCredits) ? article.extraCredits : []);

    extraCredits.forEach((credit) => {
        if (!credit || typeof credit !== "object") {
            return;
        }

        pushCredit(items, credit.label || "", credit.value || "");
    });

    return items;
}

function renderArticleCredits(article) {
    const creditsRoot = document.getElementById("articleCredits");
    if (!creditsRoot) {
        return;
    }

    const creditItems = getArticleCredits(article);

    creditsRoot.innerHTML = creditItems
        .map((credit) => `
            <p class="article-credit-line">
                ${credit.label ? `<span class="article-credit-label">${credit.label}</span>` : ""}
                <span class="article-credit-value">${credit.value}</span>
            </p>
        `)
        .join("");
}

let animationObserver = null;
let heroCarouselIntervalId = null;

function setupAnimationObserver() {
    if (!("IntersectionObserver" in window)) {
        return null;
    }

    if (!animationObserver) {
        animationObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-in");
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });
    }

    return animationObserver;
}

function getFeaturedArticle() {
    const featuredArticles = getRecentArticlesByCategory(siteData.featuredCategory, siteData.featuredCount);
    return featuredArticles[0] || getArticleBySlug(siteData.featuredSlug) || siteData.articles[0] || null;
}

function getRelatedArticles(currentArticle) {
    return siteData.articles
        .filter((article) => article.slug !== currentArticle.slug)
        .sort((left, right) => {
            const leftScore = left.category === currentArticle.category ? 1 : 0;
            const rightScore = right.category === currentArticle.category ? 1 : 0;
            return rightScore - leftScore;
        })
        .slice(0, 3);
}

function getArticlesByCategory(category) {
    return siteData.articles.filter((article) => article.category === category);
}

function getOpinionArticles() {
    return siteData.articles.filter((article) => article.category === "Editorial" || article.category === "Column");
}

const SECTION_PAGE_SIZE = 5;

function clampPageNumber(page, totalPages) {
    const nextPage = Number(page) || 1;
    return Math.min(Math.max(1, nextPage), Math.max(1, totalPages));
}

function getPaginatedItems(items, page, pageSize = SECTION_PAGE_SIZE) {
    const totalItems = Array.isArray(items) ? items.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
    const currentPage = clampPageNumber(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
        currentPage,
        totalPages,
        pageItems: (items || []).slice(startIndex, startIndex + pageSize)
    };
}

function buildPaginationSequence(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

    return Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((left, right) => left - right)
        .reduce((sequence, page, index, array) => {
            if (index > 0 && page - array[index - 1] > 1) {
                sequence.push("ellipsis");
            }

            sequence.push(page);
            return sequence;
        }, []);
}

function createPaginationMarkup(currentPage, totalPages, ariaLabel = "Pagination") {
    if (totalPages <= 1) {
        return "";
    }

    const pageSequence = buildPaginationSequence(currentPage, totalPages);

    return `
        <div class="section-pagination-wrap">
            <nav class="section-pagination" aria-label="${ariaLabel}">
                <div class="section-pagination-steps" aria-label="Page numbers">
                    ${pageSequence.map((page) => page === "ellipsis"
                        ? `<span class="section-pagination-ellipsis" aria-hidden="true">...</span>`
                        : `<button type="button" class="section-pagination-button section-pagination-step${page === currentPage ? " active" : ""}" data-page="${page}" ${page === currentPage ? 'aria-current="page"' : ""}>${page}</button>`
                    ).join("")}
                </div>
                <button type="button" class="section-pagination-button section-pagination-nav" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
                    Next &raquo;
                </button>
            </nav>
        </div>
    `;
}

function bindPaginationControls(container, onPageChange) {
    if (!container) {
        return;
    }

    container._onPageChange = onPageChange;

    if (container.dataset.paginationBound === "true") {
        return;
    }

    container.dataset.paginationBound = "true";
    container.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");
        if (!button || button.disabled) {
            return;
        }

        const nextPage = Number(button.dataset.page);
        if (Number.isNaN(nextPage) || typeof container._onPageChange !== "function") {
            return;
        }

        container._onPageChange(nextPage);
    });
}

function renderTicker() {
    const ticker = document.getElementById("breakingTicker");
    if (!ticker) {
        return;
    }

    const tickerWrap = ticker.closest(".breaking-news");
    const header = tickerWrap ? tickerWrap.closest("header") : null;
    if (tickerWrap && header && header.parentElement === document.body && header.previousElementSibling !== tickerWrap) {
        document.body.insertBefore(tickerWrap, header);
    }

    const items = siteData.tickerItems.length > 0 ? siteData.tickerItems : ["Latest updates from CLSU Collegian"];
    ticker.innerHTML = `<span>BREAKING:</span> ${items.join(" • ")}`;
}

function getArticleMedia(article, surface = "article") {
    if (!article) {
        return null;
    }

    const configuredMedia = article.literaryMedia && typeof article.literaryMedia === "object"
        ? article.literaryMedia
        : {};
    const surfaceMedia = configuredMedia[surface] && typeof configuredMedia[surface] === "object"
        ? configuredMedia[surface]
        : {};
    const mediaType = (surfaceMedia.type || article.literaryMediaType || "").trim();
    const embedUrl = (surfaceMedia.embedUrl || article.videoEmbedUrl || "").trim();

    if (mediaType !== "video" || !embedUrl) {
        return null;
    }

    return {
        type: mediaType,
        embedUrl
    };
}

function getLiteraryMedia(article, surface = "article") {
    return getArticleMedia(article, surface);
}

function isVideoMediaArticle(article, surface = "article") {
    return Boolean(getArticleMedia(article, surface));
}

function normalizeEmbedUrl(embedUrl) {
    if (typeof embedUrl !== "string") {
        return "";
    }

    return (embedUrl.match(/src="([^"]+)"/i)?.[1] || embedUrl).trim().replace(/,$/, "");
}

function createArticlePlaceholder(article, className = "article-thumb-placeholder") {
    const isVideo = isVideoMediaArticle(article);
    const placeholderClass = className;
    const displayCategory = getArticleDisplayCategory(article);
    const placeholderLabel = isVideo ? `${displayCategory} Animation` : displayCategory;

    return `<div class="${placeholderClass}">${placeholderLabel}</div>`;
}

function getMultimediaPresenter(item) {
    return item.presenter || item.anchor || item.host || "";
}

function getMultimediaBylineName(item) {
    return getMultimediaPresenter(item) || "Multimedia Desk";
}

function getMultimediaByline(item) {
    return `By ${getMultimediaBylineName(item)}`;
}

function getMultimediaPresenterLabel(item) {
    if (item.presenterLabel) {
        return item.presenterLabel;
    }

    if (item.anchor) {
        return "Anchor/s:";
    }

    if (item.presenter || item.host) {
        return "Host/s:";
    }

    return "";
}

function getMultimediaCreditLabel(item, key, fallbackLabel) {
    const customLabel = item?.[`${key}Label`];
    return typeof customLabel === "string" && customLabel.trim()
        ? customLabel.trim()
        : fallbackLabel;
}

function createEmbeddedVideoMarkup(embedUrl, title, containerClass = "video-container landscape") {
    const normalizedEmbedUrl = normalizeEmbedUrl(embedUrl);

    return `
        <div class="${containerClass}">
            <iframe
                src="${normalizedEmbedUrl}"
                title="${title}"
                scrolling="no"
                allowfullscreen="true"
                webkitallowfullscreen="true"
                mozallowfullscreen="true"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen">
            </iframe>
        </div>
    `;
}

function createStandaloneVideoMarkup(embedUrl, title, containerClass = "video-container landscape") {
    const normalizedEmbedUrl = normalizeEmbedUrl(embedUrl);

    return `
        <div class="featured-video-shell">
            <div class="${containerClass}">
                <button type="button" class="multimedia-fullscreen-button" data-multimedia-fullscreen aria-label="Open video fullscreen">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M7 3H3v4h2V5h2V3Zm12 0h-4v2h2v2h2V3ZM5 17H3v4h4v-2H5v-2Zm14 0v2h-2v2h4v-4h-2Z"/>
                    </svg>
                </button>
                <iframe
                    src="${normalizedEmbedUrl}"
                    title="${title}"
                    scrolling="no"
                    allowfullscreen="true"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen">
                </iframe>
            </div>
        </div>
    `;
}

function createArticleImageCarouselMarkup(images, title) {
    const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const slides = safeImages.map((image, index) => `
        <div class="article-image-slide${index === 0 ? " active" : ""}" data-slide-index="${index}" aria-hidden="${index === 0 ? "false" : "true"}">
            <img src="${image.src}" alt="${image.alt || title}">
            ${image.showCaption && image.caption ? `<div class="article-image-slide-caption">${image.caption}</div>` : ""}
        </div>
    `).join("");

    const dots = safeImages.length > 1
        ? safeImages.map((image, index) => `
            <button
                type="button"
                class="article-carousel-dot${index === 0 ? " active" : ""}"
                data-slide-index="${index}"
                aria-label="View image ${index + 1} of ${safeImages.length}"
                aria-pressed="${index === 0 ? "true" : "false"}"></button>
        `).join("")
        : "";

    const counter = safeImages.length > 1
        ? `<div class="article-carousel-counter"><span id="articleCarouselCurrent">1</span><span>/</span><span id="articleCarouselTotal">${safeImages.length}</span></div>`
        : "";

    return `
        <div class="article-image-carousel" data-carousel-total="${safeImages.length}">
            <div class="article-image-carousel-stage">
                ${slides}
            </div>
            ${safeImages.length > 1 ? `
                <button type="button" class="article-carousel-arrow article-carousel-arrow-left" data-carousel-prev aria-label="Previous image">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                    </svg>
                </button>
                <button type="button" class="article-carousel-arrow article-carousel-arrow-right" data-carousel-next aria-label="Next image">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"></path>
                    </svg>
                </button>
            ` : ""}
            ${counter}
            ${safeImages.length > 1 ? `<div class="article-carousel-dots" aria-label="Article images">${dots}</div>` : ""}
        </div>
    `;
}

function setupArticleImageCarousel(articleFigure) {
    const carousel = articleFigure.querySelector(".article-image-carousel");
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll(".article-image-slide"));
    const dots = Array.from(carousel.querySelectorAll(".article-carousel-dot"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const currentValue = carousel.querySelector("#articleCarouselCurrent");
    const totalValue = carousel.querySelector("#articleCarouselTotal");

    const totalSlides = slides.length;
    if (totalValue) {
        totalValue.textContent = String(totalSlides);
    }

    if (totalSlides <= 1) {
        return;
    }

    let activeIndex = 0;

    const applySlide = (nextIndex) => {
        activeIndex = (nextIndex + totalSlides) % totalSlides;

        slides.forEach((slide, index) => {
            const isActive = index === activeIndex;
            slide.classList.toggle("active", isActive);
            slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        });

        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        if (currentValue) {
            currentValue.textContent = String(activeIndex + 1);
        }
    };

    if (prevButton) {
        prevButton.addEventListener("click", () => applySlide(activeIndex - 1));
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => applySlide(activeIndex + 1));
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const nextIndex = Number(dot.dataset.slideIndex);
            if (!Number.isNaN(nextIndex)) {
                applySlide(nextIndex);
            }
        });
    });

    let touchStartX = 0;
    let touchDeltaX = 0;

    carousel.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0]?.clientX || 0;
        touchDeltaX = 0;
    }, { passive: true });

    carousel.addEventListener("touchmove", (event) => {
        touchDeltaX = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    }, { passive: true });

    carousel.addEventListener("touchend", () => {
        if (Math.abs(touchDeltaX) < 36) {
            return;
        }

        applySlide(touchDeltaX < 0 ? activeIndex + 1 : activeIndex - 1);
    });
}

function stripHtmlTags(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getTextExcerpt(value, limit = 180) {
    const cleaned = stripHtmlTags(value);
    if (cleaned.length <= limit) {
        return cleaned;
    }

    return `${cleaned.slice(0, limit).trimEnd()}...`;
}

function createMultimediaSearchSummary(item) {
    if (item.caption) {
        return item.caption;
    }

    if (item.platform) {
        return `Watch this ${item.platform.toLowerCase()} feature from the CLSU Collegian multimedia desk.`;
    }

    return "Watch this multimedia feature from the CLSU Collegian multimedia desk.";
}

function buildSearchIndex() {
    const articleItems = siteData.articles.map((article, index) => ({
        resultType: "article",
        key: `article-${article.slug || index}`,
        title: article.title || "",
        summary: article.summary || getTextExcerpt(article.body || "", 220),
        author: article.author || "",
        category: article.category || "Article",
        displayCategory: getArticleDisplayCategory(article),
        date: article.date || "",
        readTime: article.readTime || "",
        image: getPrimaryArticleImage(article)?.src || "",
        imageAlt: getPrimaryArticleImage(article)?.alt || article.title || "",
        slug: article.slug || "",
        url: getArticleUrl(article.slug),
        bodyText: stripHtmlTags(article.body || ""),
        literaryMedia: article.literaryMedia || null
    }));

    const multimediaItems = siteMultimedia.map((item, index) => ({
        resultType: "multimedia",
        key: `multimedia-${index}`,
        title: item.title || "",
        summary: item.caption || createMultimediaSearchSummary(item),
        author: getMultimediaPresenter(item),
        category: item.platform || "Multimedia",
        date: item.date || "",
        readTime: "",
        image: "",
        imageAlt: item.title || "Multimedia entry",
        slug: "",
        url: item.sourceUrl || "multimedia.html",
        embedUrl: item.embedUrl || "",
        aspectRatio: item.aspectRatio || "portrait",
        platform: item.platform || "Multimedia",
        presenter: getMultimediaPresenter(item),
        presenterLabel: getMultimediaPresenterLabel(item),
        editor: item.editor || "",
        editorLabel: getMultimediaCreditLabel(item, "editor", "Editor/s:"),
        technicalDirector: item.technicalDirector || "",
        technicalDirectorLabel: getMultimediaCreditLabel(item, "technicalDirector", "Technical Director/s:"),
        videographer: item.videographer || "",
        videographerLabel: getMultimediaCreditLabel(item, "videographer", "Videographer/s:"),
        caption: item.caption || "",
        external: Boolean(item.sourceUrl)
    }));

    const archiveItems = siteIssues.map((issue, index) => ({
        resultType: "archive",
        key: `archive-${issue.slug || index}`,
        title: [issue.title, issue.titleLineTwo].filter(Boolean).join(" "),
        summary: issue.summary || issue.subtitle || "Browse this CLSU Collegian archive release.",
        author: "",
        category: "Archive",
        date: issue.date || "",
        readTime: "",
        image: issue.image || "",
        imageAlt: issue.imageAlt || issue.title || "Archive cover",
        slug: issue.slug || "",
        url: getIssueUrl(issue),
        issueLabel: issue.label || "",
        issueSubtitle: issue.subtitle || "",
        external: false
    }));

    return articleItems.concat(multimediaItems, archiveItems).map((item, index) => {
        const searchableText = [
            item.title,
            item.summary,
            item.author,
            item.category,
            item.bodyText,
            item.platform,
            item.host,
            item.editor,
            item.caption,
            item.issueLabel,
            item.issueSubtitle
        ].filter(Boolean).join(" ").toLowerCase();

        return {
            ...item,
            searchableText,
            index
        };
    });
}

let cachedSearchIndex = null;

function getSearchIndex() {
    if (!cachedSearchIndex) {
        cachedSearchIndex = buildSearchIndex();
    }

    return cachedSearchIndex;
}

function scoreSearchResult(item, normalizedQuery, queryTokens) {
    if (!normalizedQuery || queryTokens.length === 0) {
        return 0;
    }

    if (!queryTokens.every((token) => item.searchableText.includes(token))) {
        return 0;
    }

    const title = (item.title || "").toLowerCase();
    const summary = (item.summary || "").toLowerCase();
    const author = (item.author || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const body = (item.bodyText || "").toLowerCase();
    const extra = [item.platform, item.host, item.editor, item.caption]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    let score = 0;

    if (title.includes(normalizedQuery)) {
        score += 120;
    }
    if (summary.includes(normalizedQuery)) {
        score += 60;
    }
    if (author.includes(normalizedQuery) || category.includes(normalizedQuery) || extra.includes(normalizedQuery)) {
        score += 40;
    }
    if (body.includes(normalizedQuery)) {
        score += 24;
    }

    queryTokens.forEach((token) => {
        if (title.includes(token)) {
            score += 24;
        }
        if (summary.includes(token)) {
            score += 12;
        }
        if (author.includes(token) || category.includes(token) || extra.includes(token)) {
            score += 8;
        }
        if (body.includes(token)) {
            score += 4;
        }
    });

    return score;
}

function searchSite(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTokens.length === 0) {
        return [];
    }

    return getSearchIndex()
        .map((item) => ({
            ...item,
            relevanceScore: scoreSearchResult(item, normalizedQuery, queryTokens)
        }))
        .filter((item) => item.relevanceScore > 0)
        .sort((left, right) => {
            if (right.relevanceScore !== left.relevanceScore) {
                return right.relevanceScore - left.relevanceScore;
            }

            const leftTime = left.date ? new Date(`${left.date}T00:00:00`).getTime() : 0;
            const rightTime = right.date ? new Date(`${right.date}T00:00:00`).getTime() : 0;
            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return left.index - right.index;
        });
}

function createSearchResultMedia(item) {
    if (item.resultType === "multimedia" && item.embedUrl) {
        const containerClass = item.aspectRatio === "landscape"
            ? "video-container landscape search-result-video"
            : "video-container portrait search-result-video";
        return createEmbeddedVideoMarkup(item.embedUrl, item.title, containerClass);
    }

    const articleMedia = getArticleMedia(item, "card");
    if (articleMedia) {
        return createEmbeddedVideoMarkup(articleMedia.embedUrl, item.title, "video-container portrait search-result-video");
    }

    if (item.image) {
        return `<img src="${item.image}" alt="${item.imageAlt || item.title}" class="search-result-image">`;
    }

    const placeholderLabel = item.resultType === "multimedia"
        ? "Multimedia"
        : (getArticleMedia(item, "card") ? `${item.displayCategory || item.category || "Article"} Animation` : (item.displayCategory || item.category || "Article"));
    return `<div class="search-result-placeholder">${placeholderLabel}</div>`;
}

function createSearchResultMeta(item) {
    if (item.resultType === "multimedia") {
        return [
            item.platform || "Multimedia",
            item.presenter ? `${item.presenterLabel || "Host/s"} ${item.presenter}` : "",
            item.editor ? `${item.editorLabel || "Editor/s:"} ${item.editor}` : ""
        ].filter(Boolean).join(" • ");
    }

    if (item.resultType === "archive") {
        return [
            item.issueLabel || "Kulê Archives",
            item.date ? formatDate(item.date) : ""
        ].filter(Boolean).join(" • ");
    }

    return [
        item.author ? `By ${item.author}` : "",
        item.date ? formatDate(item.date) : "",
        item.readTime || ""
    ].filter(Boolean).join(" • ");
}

function createSearchResultCard(item) {
    const categoryLabel = item.resultType === "multimedia"
        ? "Multimedia"
        : (item.resultType === "archive" ? "Kulê Archives" : (item.displayCategory || item.category || "Article"));
    const actionLabel = item.resultType === "multimedia"
        ? "Watch now"
        : (item.resultType === "archive" ? "View archive" : "Read article");
    const targetAttr = item.external ? ` target="_blank" rel="noopener noreferrer"` : "";

    return `
        <a class="search-result-card" href="${item.url}"${targetAttr} aria-label="${actionLabel}: ${item.title}">
            <div class="search-result-media">
                ${createSearchResultMedia(item)}
            </div>
            <div class="search-result-content">
                <span class="search-result-category">${categoryLabel}</span>
                <h3>${item.title}</h3>
                ${item.resultType === "multimedia" ? "" : `<p class="search-result-summary">${item.summary || getTextExcerpt(item.bodyText || "", 180)}</p>`}
                <div class="search-result-meta">${createSearchResultMeta(item)}</div>
                <span class="search-result-action">${actionLabel}</span>
            </div>
        </a>
    `;
}

function createCardImage(article) {
    const cardMedia = getArticleMedia(article, "card");
    if (cardMedia) {
        return createEmbeddedVideoMarkup(cardMedia.embedUrl, article.title, "video-container landscape article-card-video");
    }

    const primaryImage = getPrimaryArticleImage(article);
    if (primaryImage) {
        return `<img src="${primaryImage.src}" alt="${primaryImage.alt || article.title}">`;
    }

    return createArticlePlaceholder(article);
}

function createSectionCard(article) {
    const cardMedia = getArticleMedia(article, "card");
    const isEditorial = article.category === "Editorial";
    const primaryImage = getPrimaryArticleImage(article);
    const imageMarkup = cardMedia
        ? createEmbeddedVideoMarkup(cardMedia.embedUrl, article.title, "video-container landscape news-card-video")
        : (primaryImage
            ? `<img src="${primaryImage.src}" alt="${primaryImage.alt || article.title}" class="news-thumb">`
            : createArticlePlaceholder(article, "news-thumb-placeholder"));
    const readTime = article.readTime || "10 min read";
    const displayCategory = getArticleDisplayCategory(article);

    return `
        <article class="news-card${isEditorial ? " editorial-card" : ""}">
            <a class="news-card-link" href="${getArticleUrl(article.slug)}" aria-label="Read ${article.title}">
                ${imageMarkup}
                <div class="news-content">
                    <span class="category">${displayCategory}</span>
                    <h2>${article.title}</h2>
                    <p>${article.summary}</p>
                    <div class="news-meta">
                        <span>By ${article.author}</span>
                        <span>•</span>
                        <span>${formatDate(article.date)}</span>
                        <span>&bull;</span>
                        <span>${readTime}</span>
                    </div>
                </div>
            </a>
        </article>
    `;
}

function renderTrendingTable(targetId, items) {
    const target = document.getElementById(targetId);
    if (!target) {
        return;
    }

    const fallbackItems = siteData.articles.slice(0, 5).map((article) => ({
        title: article.title,
        tag: getArticleDisplayCategory(article),
        slug: article.slug
    }));

    const sourceItems = Array.isArray(items) && items.length > 0
        ? items
        : (siteData.trending.length > 0 ? siteData.trending : fallbackItems);

    target.innerHTML = sourceItems
        .filter((item) => item.slug)
        .map((item, index) => `
            <a class="trending-row" href="${getArticleUrl(item.slug)}" aria-label="Read ${item.title}">
                <span class="trending-rank">${String(index + 1).padStart(2, "0")}</span>
                <span class="trending-topic">${item.title}</span>
                <span class="trending-tag">${item.tag}</span>
            </a>
        `)
        .join("");
}

function createMultimediaCard(item, variant = "default") {
    const aspectRatioClass = item.aspectRatio === "landscape"
        ? "video-container landscape"
        : "video-container portrait";
    const platformLabel = item.platform || "Multimedia";
    const isFeatured = variant === "featured";
    const isHomeCompact = variant === "home-compact";
    const isGmaLayout = variant === "gma" || variant === "gma-featured";
    const isGmaFeatured = variant === "gma-featured";
    const cardClass = isFeatured ? "multimedia-card multimedia-card-featured" : "multimedia-card";
    const titleTag = isFeatured ? "h2" : "h3";
    const dateMarkup = item.date ? `<p class="multimedia-date">${formatDate(item.date)}</p>` : "";
    const captionMarkup = item.caption
        ? `<p class="multimedia-caption">${item.caption}</p>`
        : (isFeatured ? `<p class="multimedia-caption multimedia-caption-fallback">Fresh from the CLSU Collegian multimedia desk.</p>` : "");

    const sourceLink = item.sourceUrl
        ? `<a class="multimedia-link" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">Open on ${item.platform || "source"}</a>`
        : "";
    const multimediaCredits = [
        item.technicalDirector ? `<p class="multimedia-meta"><strong>${item.technicalDirectorLabel || "Technical Director/s:"}</strong> ${item.technicalDirector}</p>` : "",
        item.videographer ? `<p class="multimedia-meta"><strong>${item.videographerLabel || "Videographer/s:"}</strong> ${item.videographer}</p>` : "",
        item.editor ? `<p class="multimedia-meta"><strong>${item.editorLabel || "Editor/s:"}</strong> ${item.editor}</p>` : ""
    ].filter(Boolean).join("");
    const bylineMarkup = `<p class="multimedia-byline">${getMultimediaByline(item)}</p>`;

    if (isGmaLayout) {
        const hostName = getMultimediaBylineName(item);
        const hostDate = [hostName, item.date ? formatDate(item.date) : ""].filter(Boolean).join(", ");

        return `
            <article class="multimedia-card multimedia-card-gma${isGmaFeatured ? " multimedia-card-gma-featured" : ""}">
                <div class="multimedia-frame multimedia-frame-gma">
                    <button type="button" class="multimedia-fullscreen-button" data-multimedia-fullscreen aria-label="Open video fullscreen">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M7 3H3v4h2V5h2V3Zm12 0h-4v2h2v2h2V3ZM5 17H3v4h4v-2H5v-2Zm14 0v2h-2v2h4v-4h-2Z"/>
                        </svg>
                    </button>
                    <div class="${aspectRatioClass}">
                        <iframe
                            src="${item.embedUrl}"
                            title="${item.title}"
                            scrolling="no"
                            allowfullscreen="true"
                            webkitallowfullscreen="true"
                            mozallowfullscreen="true"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen">
                        </iframe>
                    </div>
                </div>
                <div class="multimedia-card-content multimedia-card-content-gma">
                    <h3 class="multimedia-title">${item.title}</h3>
                    <p class="multimedia-meta-line">${hostDate}</p>
                </div>
            </article>
        `;
    }

    if (isHomeCompact) {
        return `
            <article class="multimedia-card multimedia-card-home">
                <div class="multimedia-frame multimedia-frame-home">
                    <button type="button" class="multimedia-fullscreen-button" data-multimedia-fullscreen aria-label="Open video fullscreen">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M7 3H3v4h2V5h2V3Zm12 0h-4v2h2v2h2V3ZM5 17H3v4h4v-2H5v-2Zm14 0v2h-2v2h4v-4h-2Z"/>
                        </svg>
                    </button>
                    <div class="${aspectRatioClass}">
                        <iframe
                            src="${item.embedUrl}"
                            title="${item.title}"
                            scrolling="no"
                            allowfullscreen="true"
                            webkitallowfullscreen="true"
                            mozallowfullscreen="true"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen">
                        </iframe>
                    </div>
                </div>
                <div class="multimedia-card-content">
                    <p class="multimedia-eyebrow">${platformLabel}</p>
                    ${dateMarkup}
                    <${titleTag}>${item.title}</${titleTag}>
                    ${bylineMarkup}
                    ${captionMarkup}
                    <div class="multimedia-meta-grid multimedia-meta-grid-home">
                        ${multimediaCredits || `<p class="multimedia-meta"><strong>${item.editorLabel || "Editor/s:"}</strong> ${item.editor || "Multimedia Desk"}</p>`}
                    </div>
                    ${sourceLink}
                </div>
            </article>
        `;
    }

    return `
        <article class="${cardClass}">
            <div class="multimedia-frame">
                <button type="button" class="multimedia-fullscreen-button" data-multimedia-fullscreen aria-label="Open video fullscreen">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M7 3H3v4h2V5h2V3Zm12 0h-4v2h2v2h2V3ZM5 17H3v4h4v-2H5v-2Zm14 0v2h-2v2h4v-4h-2Z"/>
                    </svg>
                </button>
                <div class="${aspectRatioClass}">
                    <iframe
                        src="${item.embedUrl}"
                        title="${item.title}"
                        scrolling="no"
                        allowfullscreen="true"
                        webkitallowfullscreen="true"
                        mozallowfullscreen="true"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen">
                    </iframe>
                </div>
            </div>
            <div class="multimedia-card-content">
                <p class="multimedia-eyebrow">${platformLabel}</p>
                ${dateMarkup}
                <${titleTag}>${item.title}</${titleTag}>
                ${bylineMarkup}
                ${captionMarkup}
                <div class="multimedia-meta-grid${isFeatured ? " multimedia-meta-grid-featured" : ""}">
                    ${multimediaCredits || `<p class="multimedia-meta"><strong>${item.editorLabel || "Editor/s:"}</strong> ${item.editor || "Multimedia Desk"}</p>`}
                </div>
                ${sourceLink}
            </div>
        </article>
    `;
}

function getDateValue(dateString) {
    return dateString ? new Date(`${dateString}T00:00:00`) : null;
}

function getDateTimestamp(dateString) {
    const dateValue = getDateValue(dateString);
    const timestamp = dateValue ? dateValue.getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMultimediaDateSortValue(dateString) {
    const dateValue = getDateValue(dateString);
    const timestamp = dateValue ? dateValue.getTime() : Number.POSITIVE_INFINITY;
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function compareMultimediaDates(leftDate, rightDate) {
    const leftTime = getMultimediaDateSortValue(leftDate);
    const rightTime = getMultimediaDateSortValue(rightDate);

    if (leftTime === rightTime) {
        return 0;
    }

    return leftTime - rightTime;
}

function getMonthKey(dateString) {
    const dateValue = getDateValue(dateString);
    if (!dateValue || Number.isNaN(dateValue.getTime())) {
        return null;
    }

    return String(dateValue.getMonth() + 1).padStart(2, "0");
}

function formatMonthLabel(monthKey) {
    const dateValue = new Date(2000, Number(monthKey) - 1, 1);

    return new Intl.DateTimeFormat("en-US", {
        month: "long"
    }).format(dateValue);
}

function initializeMonthFilter(filterElement, items, sortOrder = "desc") {
    if (!filterElement || filterElement.dataset.initialized) {
        return;
    }

    const monthKeys = [...new Set(items
        .map((item) => getMonthKey(item.date))
        .filter(Boolean))]
        .sort((left, right) => sortOrder === "asc"
            ? Number(left) - Number(right)
            : Number(right) - Number(left));

    filterElement.innerHTML = [`<option value="all">All months</option>`]
        .concat(monthKeys.map((monthKey) => `<option value="${monthKey}">${formatMonthLabel(monthKey)}</option>`))
        .join("");
    filterElement.dataset.initialized = "true";
}

function filterItemsByMonth(items, selectedMonth) {
    if (selectedMonth === "all") {
        return items;
    }

    return items.filter((item) => getMonthKey(item.date) === selectedMonth);
}

function sortItemsByNewest(items) {
    return [...items].sort((left, right) => getDateTimestamp(right.date) - getDateTimestamp(left.date));
}

function renderMultimedia() {
    const homeGrid = document.getElementById("homeMultimediaGrid");
    const featuredGrid = document.getElementById("multimediaFeaturedGrid");
    const multimediaPageGrid = document.getElementById("multimediaPageGrid");
    const sortedMultimedia = sortItemsByNewest(siteMultimedia);

    if (homeGrid) {
        homeGrid.innerHTML = sortedMultimedia.slice(0, 3).map((item) => createMultimediaCard(item)).join("");
    }

    if (featuredGrid || multimediaPageGrid) {
        const featuredItems = sortedMultimedia.filter((item) => item.featured).slice(0, 2);
        const regularItems = sortedMultimedia.filter((item) => !item.featured);

        if (featuredGrid) {
            featuredGrid.innerHTML = featuredItems.length > 0
                ? featuredItems.map((item) => createMultimediaCard(item, "gma-featured")).join("")
                : `<div class="news-empty">No featured multimedia entries are available yet.</div>`;
        }

        if (multimediaPageGrid) {
            multimediaPageGrid.innerHTML = regularItems.length > 0
                ? regularItems.map((item) => createMultimediaCard(item, "gma")).join("")
                : `<div class="news-empty">No multimedia entries are available yet.</div>`;
        }

        observeAnimatedElements();
        return;
    }

    observeAnimatedElements();
}

function requestElementFullscreen(element) {
    if (!element) {
        return false;
    }

    const request = element.requestFullscreen
        || element.webkitRequestFullscreen
        || element.mozRequestFullScreen
        || element.msRequestFullscreen;

    if (!request) {
        return false;
    }

    const result = request.call(element);
    if (result && typeof result.catch === "function") {
        result.catch(() => {
            // Ignore fullscreen errors and let the fallback handle it.
        });
    }

    return true;
}

function setupMultimediaFullscreenControls() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest && event.target.closest("[data-multimedia-fullscreen]");
        if (!button) {
            return;
        }

        const frame = button.closest(".multimedia-frame, .video-container");
        if (!frame) {
            return;
        }

        const iframe = frame.querySelector("iframe");
        if (!iframe) {
            return;
        }

        const enteredFullscreen = requestElementFullscreen(iframe);
        if (enteredFullscreen) {
            return;
        }

        const fallbackUrl = iframe.getAttribute("src") || "";
        if (fallbackUrl) {
            window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        }
    });
}

function createIssueCard(issue, isFeatured = false) {
    const issueLinks = Array.isArray(issue.links)
        ? issue.links.map((link) => `
            <a class="archive-link-pill" href="${link.url}" target="_blank" rel="noopener noreferrer">
                ${link.label}
            </a>
        `).join("")
        : "";

    const archiveId = issue.slug ? ` id="${issue.slug}"` : "";
    const archiveClasses = ["archive-card"];

    if (isFeatured) {
        archiveClasses.push("archive-card--featured");
    }

    return `
        <article class="${archiveClasses.join(" ")}"${archiveId}>
            <a class="archive-cover-link" href="${getIssueUrl(issue)}" aria-label="View ${issue.title} in Kulê Archives">
                <div class="archive-cover-shell" aria-hidden="true"></div>
                <img src="${issue.image}" alt="${issue.imageAlt || issue.title}" class="archive-cover-image">
            </a>
            <div class="archive-content">
                <div class="archive-heading">
                    ${isFeatured ? '<span class="archive-badge">Latest Release</span>' : ""}
                    <h3>${issue.title}</h3>
                    ${issue.titleLineTwo ? `<p class="archive-title-line-two">${issue.titleLineTwo}</p>` : ""}
                </div>
                <div class="archive-actions">
                    ${issueLinks}
                </div>
            </div>
        </article>
    `;
}

function createFeaturedIssueHero(issue) {
    if (!issue) {
        return "";
    }

    const issueSummary = issue.summary || issue.subtitle || "Browse the latest CLSU Collegian archive release.";
    const issueDate = formatDate(issue.date);
    const issueButtons = Array.isArray(issue.links)
        ? issue.links.map((link) => `
            <a class="featured-archive-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
                ${link.label}
            </a>
        `).join("")
        : "";

    return `
        <article class="featured-archive-card">
            <a class="featured-archive-media" href="${getIssueUrl(issue)}" aria-label="Open ${issue.title} featured archive">
                <img src="${issue.image}" alt="${issue.imageAlt || issue.title}" class="featured-archive-image">
            </a>
            <div class="featured-archive-content">
                <span class="featured-archive-kicker">Latest Release</span>
                <h2>${issue.title}</h2>
                ${issue.titleLineTwo ? `<p class="featured-archive-subtitle">${issue.titleLineTwo}</p>` : ""}
                ${issueDate ? `<p class="featured-archive-date">${issueDate}</p>` : ""}
                <p class="featured-archive-summary">${issueSummary}</p>
                ${issueButtons ? `<div class="featured-archive-actions">${issueButtons}</div>` : ""}
            </div>
        </article>
    `;
}

function renderIssues() {
    const homeIssuesGrid = document.getElementById("homeIssuesGrid");
    const issuesPageGrid = document.getElementById("issuesPageGrid");
    const monthFilter = document.getElementById("section-month-filter");
    const featuredArchive = document.getElementById("featuredArchive");
    const emptyMarkup = `<div class="news-empty">No archive entries are available yet.</div>`;
    const sortedIssues = getSortedIssuesByNewest();
    const featuredIssue = sortedIssues[0] || null;

    if (featuredArchive) {
        featuredArchive.innerHTML = featuredIssue
            ? createFeaturedIssueHero(featuredIssue)
            : emptyMarkup;
    }

    if (homeIssuesGrid) {
        homeIssuesGrid.innerHTML = featuredIssue
            ? createIssueCard(featuredIssue, true)
            : emptyMarkup;
    }

    if (issuesPageGrid) {
        initializeMonthFilter(monthFilter, sortedIssues);

        const renderPageGrid = () => {
            const selectedMonth = monthFilter ? monthFilter.value : "all";
            const filteredIssues = sortItemsByNewest(filterItemsByMonth(sortedIssues, selectedMonth));
            const pageIssues = filteredIssues.filter((issue) => issue !== featuredIssue);

            issuesPageGrid.innerHTML = pageIssues.length > 0
                ? pageIssues.map((issue) => createIssueCard(issue)).join("")
                : emptyMarkup;

            observeAnimatedElements();
        };

        if (monthFilter && !monthFilter.dataset.bound) {
            monthFilter.addEventListener("change", renderPageGrid);
            monthFilter.dataset.bound = "true";
        }

        renderPageGrid();
        return;
    }

    observeAnimatedElements();
}

function renderHomePage() {
    const grid = document.getElementById("articlesGrid");
    if (!grid) {
        return;
    }

    const featured = getFeaturedArticle();
    const heroCategory = document.getElementById("heroCategory");
    const heroTitle = document.getElementById("heroTitle");
    const heroSummary = document.getElementById("heroSummary");
    const heroByline = document.getElementById("heroByline");
    const heroDate = document.getElementById("heroDate");
    const heroMetaSeparator = document.getElementById("heroMetaSeparator");
    const heroReadTime = document.getElementById("heroReadTime");
    const heroLink = document.getElementById("heroLink");
    const heroImageWrapper = document.getElementById("heroImageWrapper");
    const heroSlideMedia = document.getElementById("heroSlideMedia");
    const heroCarouselDots = document.getElementById("heroCarouselDots");
    const heroPrevButton = document.getElementById("heroPrevButton");
    const heroNextButton = document.getElementById("heroNextButton");

    if (featured && heroCategory && heroTitle && heroSummary && heroLink && heroImageWrapper && heroSlideMedia) {
        heroCategory.textContent = getArticleDisplayCategory(featured);
        heroTitle.textContent = featured.title;
        heroSummary.textContent = featured.summary;
        if (heroByline) {
            const heroBylineText = getAuthorLine(featured);
            heroByline.textContent = heroBylineText;
            heroByline.hidden = !heroBylineText;
        }
        if (heroDate) {
            const heroDateText = formatDate(featured.date);
            heroDate.textContent = heroDateText;
            heroDate.hidden = !heroDateText;
        }
        if (heroMetaSeparator) {
            const showSeparator = Boolean((heroDate && heroDate.textContent.trim()) && (heroByline && heroByline.textContent.trim()));
            heroMetaSeparator.hidden = !showSeparator;
        }
        if (heroReadTime) {
            heroReadTime.textContent = featured.readTime || "10 min";
        }
        heroLink.href = getArticleUrl(featured.slug);

        const heroArticles = getRecentArticlesByCategory(siteData.featuredCategory, siteData.featuredCount)
            .filter((article) => article.image);
        const fallbackCarouselItems = siteData.articles
            .filter((article) => article.image)
            .slice(0, siteData.featuredCount);
        const carouselItems = heroArticles.length > 0 ? heroArticles : (fallbackCarouselItems.length > 0 ? fallbackCarouselItems : [featured]);
        let activeIndex = 0;

        const startCarouselAutoplay = () => {
            if (heroCarouselIntervalId) {
                window.clearInterval(heroCarouselIntervalId);
            }

            if (carouselItems.length > 1) {
                heroCarouselIntervalId = window.setInterval(() => {
                    const nextIndex = (activeIndex + 1) % carouselItems.length;
                    applyHeroSlide(nextIndex);
                }, 4500);
            } else {
                heroCarouselIntervalId = null;
            }
        };

        const resetCarouselAutoplay = () => {
            startCarouselAutoplay();
        };

        const applyHeroSlide = (index) => {
            const nextArticle = carouselItems[index];
            if (!nextArticle) {
                return;
            }

            activeIndex = index;
            heroImageWrapper.classList.add("is-transitioning");

            window.setTimeout(() => {
                heroSlideMedia.innerHTML = nextArticle.image
                    ? `<img src="${nextArticle.image}" alt="${nextArticle.imageAlt || nextArticle.title}">`
                    : `<div class="hero-placeholder"></div>`;

                if (heroCarouselDots) {
                    heroCarouselDots.querySelectorAll(".hero-carousel-dot").forEach((dot, dotIndex) => {
                        dot.classList.toggle("active", dotIndex === activeIndex);
                        dot.setAttribute("aria-pressed", dotIndex === activeIndex ? "true" : "false");
                    });
                }

                window.requestAnimationFrame(() => {
                    heroImageWrapper.classList.remove("is-transitioning");
                });
            }, 180);
        };

        if (heroCarouselIntervalId) {
            window.clearInterval(heroCarouselIntervalId);
            heroCarouselIntervalId = null;
        }

        if (heroCarouselDots) {
            heroCarouselDots.innerHTML = carouselItems.length > 1
                ? carouselItems.map((article, index) => `
                    <button
                        type="button"
                        class="hero-carousel-dot${index === 0 ? " active" : ""}"
                        data-hero-index="${index}"
                        aria-label="Show ${article.title}">
                    </button>
                `).join("")
                : "";

            heroCarouselDots.querySelectorAll(".hero-carousel-dot").forEach((dot) => {
                dot.addEventListener("click", () => {
                    const nextIndex = Number(dot.dataset.heroIndex);
                    if (Number.isNaN(nextIndex) || nextIndex === activeIndex) {
                        return;
                    }

                    applyHeroSlide(nextIndex);
                    resetCarouselAutoplay();
                });
            });
        }

        if (heroPrevButton) {
            heroPrevButton.hidden = carouselItems.length <= 1;
            heroPrevButton.addEventListener("click", () => {
                const nextIndex = (activeIndex - 1 + carouselItems.length) % carouselItems.length;
                applyHeroSlide(nextIndex);
                resetCarouselAutoplay();
            });
        }

        if (heroNextButton) {
            heroNextButton.hidden = carouselItems.length <= 1;
            heroNextButton.addEventListener("click", () => {
                const nextIndex = (activeIndex + 1) % carouselItems.length;
                applyHeroSlide(nextIndex);
                resetCarouselAutoplay();
            });
        }

        applyHeroSlide(0);
        startCarouselAutoplay();
    }

    const seenCategories = new Set();

    grid.innerHTML = siteData.articles.slice(0, 6).map((article) => {
        const categoryId = article.category.toLowerCase();
        const articleId = seenCategories.has(categoryId) ? article.slug : categoryId;
        const readTime = article.readTime || "10 min read";
        const showByline = shouldShowByline(article);
        seenCategories.add(categoryId);

        return `
            <article class="article-card${article.category === "News" ? " news-article-card" : ""}" id="${articleId}">
                <a class="article-card-link" href="${getArticleUrl(article.slug)}" aria-label="Read ${article.title}">
                    ${createCardImage(article)}
                    <div class="card-content">
                        <span class="category">${getArticleDisplayCategory(article)}</span>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <div class="card-meta">
                            ${showByline ? `<span>By ${article.author}</span><span>&bull;</span>` : ""}
                            <span>${formatDate(article.date)}</span>
                            <span>&bull;</span>
                            <span>${readTime}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join("");

    renderTrendingTable("trendingTable");
    observeAnimatedElements();
}

function renderSectionPage() {
    const sectionRoot = document.querySelector("[data-section-category]");
    const list = document.getElementById("section-list");

    if (!sectionRoot || !list) {
        return;
    }

    const category = sectionRoot.dataset.sectionCategory || "";
    const emptyLabel = sectionRoot.dataset.sectionLabel || category || "section";
    const monthFilter = document.getElementById("section-month-filter");

    if (category === "Opinion") {
        const opinionArticles = getOpinionArticles();
        let currentOpinionPage = 1;
        initializeMonthFilter(monthFilter, opinionArticles);

        const renderOpinionList = () => {
            const selectedMonth = monthFilter ? monthFilter.value : "all";
            const filteredOpinionArticles = sortItemsByNewest(filterItemsByMonth(opinionArticles, selectedMonth));
            const paginationState = getPaginatedItems(filteredOpinionArticles, currentOpinionPage, SECTION_PAGE_SIZE);
            currentOpinionPage = paginationState.currentPage;
            const emptyMarkup = `<div class="news-empty">No ${emptyLabel.toLowerCase()} articles are available yet.</div>`;

            list.classList.add("news-feed");
            list.innerHTML = `
                ${paginationState.pageItems.length > 0
                    ? paginationState.pageItems.map((article) => createSectionCard(article)).join("")
                    : emptyMarkup}
                ${createPaginationMarkup(paginationState.currentPage, paginationState.totalPages, "Opinion pagination")}
            `;

            const paginationWrap = list.querySelector(".section-pagination-wrap");
            if (paginationWrap) {
                bindPaginationControls(paginationWrap, (page) => {
                    currentOpinionPage = page;
                    renderOpinionList();
                });
            }
            observeAnimatedElements();
        };

        if (monthFilter && !monthFilter.dataset.bound) {
            monthFilter.addEventListener("change", () => {
                currentOpinionPage = 1;
                renderOpinionList();
            });
            monthFilter.dataset.bound = "true";
        }

        renderOpinionList();
        return;
    }

    const sectionArticles = getArticlesByCategory(category);
    let currentSectionPage = 1;
    initializeMonthFilter(monthFilter, sectionArticles);

    const renderList = () => {
        const selectedMonth = monthFilter ? monthFilter.value : "all";
        const filteredArticles = sortItemsByNewest(filterItemsByMonth(sectionArticles, selectedMonth));
        const paginationState = getPaginatedItems(filteredArticles, currentSectionPage, SECTION_PAGE_SIZE);
        currentSectionPage = paginationState.currentPage;
        const emptyMarkup = `<div class="news-empty">No ${emptyLabel.toLowerCase()} articles are available yet.</div>`;

        list.classList.add("news-feed");
        list.innerHTML = `
            ${paginationState.pageItems.length > 0
                ? paginationState.pageItems.map((article) => createSectionCard(article)).join("")
                : emptyMarkup}
            ${createPaginationMarkup(paginationState.currentPage, paginationState.totalPages, `${emptyLabel} pagination`)}
        `;

        const paginationWrap = list.querySelector(".section-pagination-wrap");
        if (paginationWrap) {
            bindPaginationControls(paginationWrap, (page) => {
                currentSectionPage = page;
                renderList();
            });
        }
        observeAnimatedElements();
    };

    if (monthFilter && !monthFilter.dataset.bound) {
        monthFilter.addEventListener("change", () => {
            currentSectionPage = 1;
            renderList();
        });
        monthFilter.dataset.bound = "true";
    }

    renderList();
}

function renderArticlePage() {
    const articleBody = document.getElementById("articleBody");
    const root = document.documentElement;
    if (!articleBody) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedSlug = params.get("slug");
    const selectedArticle = selectedSlug ? getArticleBySlug(selectedSlug) : null;
    const article = selectedSlug ? selectedArticle : getFeaturedArticle();

    if (!article) {
        articleBody.innerHTML = selectedSlug
            ? "<p>The requested article could not be found.</p>"
            : "<p>No articles are available yet.</p>";
        root.classList.remove("article-loading");
        return;
    }

    updateArticleSocialMeta(article);
    window.__CLSU_ACTIVE_ARTICLE_SLUG = article.slug;
    document.body.dataset.articleCategory = article.category || "";
    document.getElementById("articleCategory").textContent = getArticleDisplayCategory(article);
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleDate").textContent = formatDate(article.date);
    document.getElementById("articleReadTime").textContent = article.readTime || "10 min read";
    renderArticleCredits(article);
    articleBody.innerHTML = article.body;

    const articleFigure = document.getElementById("articleFigure");
    const articleMedia = getArticleMedia(article, "article");
    const articleImages = getArticleImages(article);
    const newsImageCaption = article.category === "News"
        ? (article.imageCaption || article.caption || "")
        : "";
    articleFigure.innerHTML = articleMedia
        ? `${createStandaloneVideoMarkup(articleMedia.embedUrl, article.title, "video-container landscape literary-article-video")}<figcaption id="articleCaption"></figcaption>`
        : (articleImages.length > 1
            ? `${createArticleImageCarouselMarkup(articleImages, article.title)}<figcaption id="articleCaption"></figcaption>`
            : (articleImages.length === 1
                ? `<img src="${articleImages[0].src}" alt="${articleImages[0].alt || article.title}"><figcaption id="articleCaption"></figcaption>`
                : `<div class="hero-placeholder"></div><figcaption id="articleCaption"></figcaption>`));

    const renderedCaption = document.getElementById("articleCaption");
    if (renderedCaption) {
        renderedCaption.textContent = newsImageCaption;
        renderedCaption.hidden = !newsImageCaption;
    }

    setupArticleImageCarousel(articleFigure);

    const relatedList = document.getElementById("relatedList");
    const relatedHeading = document.querySelector(".related-articles h3");
    if (relatedHeading) {
        relatedHeading.textContent = "Read More";
    }
    relatedList.innerHTML = getRelatedArticles(article).map((related) => `
        <a class="related-card" href="${getArticleUrl(related.slug)}" aria-label="Read ${related.title}">
            ${getArticleMedia(related, "card")
                ? createEmbeddedVideoMarkup(getArticleMedia(related, "card").embedUrl, related.title, "video-container landscape related-card-video")
                : (getPrimaryArticleImage(related)
                ? `<img src="${getPrimaryArticleImage(related).src}" alt="${getPrimaryArticleImage(related).alt || related.title}">`
                : createArticlePlaceholder(related, "related-thumb-placeholder"))}
            <div class="related-content">
                <h4>${related.title}</h4>
                <p>${related.summary}</p>
            </div>
        </a>
    `).join("");

    setupArticleReadingProgress();
    root.classList.remove("article-loading");
}

function observeAnimatedElements() {
    const animatedElements = document.querySelectorAll(".article-card, .board-member, .value-card, .news-card, .multimedia-card, .archive-card, .search-result-card");
    if (animatedElements.length === 0) {
        return;
    }

    const observer = setupAnimationObserver();

    animatedElements.forEach((element) => {
        if (!observer) {
            element.classList.add("animate-in");
            return;
        }

        if (element.classList.contains("animate-in")) {
            return;
        }

        observer.observe(element);
    });
}

function ensureSearchResultsSection() {
    let searchSection = document.getElementById("siteSearchResults");
    if (searchSection) {
        return searchSection;
    }

    const pageHeader = document.querySelector("body > header");
    if (!pageHeader) {
        return null;
    }

    searchSection = document.createElement("section");
    searchSection.id = "siteSearchResults";
    searchSection.className = "search-results-shell";
    searchSection.hidden = true;
    searchSection.innerHTML = `
        <div class="container">
            <div class="search-results-header">
                <div>
                    <p class="search-results-kicker">Search Results</p>
                    <h2 id="siteSearchHeading">Search Results</h2>
                    <p class="search-results-summary-text" id="siteSearchSummary"></p>
                </div>
                <button type="button" class="search-results-close" id="siteSearchClose" aria-label="Close search results">Close</button>
            </div>
            <div class="search-results-list" id="siteSearchList"></div>
        </div>
    `;

    pageHeader.insertAdjacentElement("afterend", searchSection);

    const closeButton = document.getElementById("siteSearchClose");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            searchSection.hidden = true;
            document.body.classList.remove("search-results-visible");
        });
    }

    return searchSection;
}

function hideSearchResults() {
    const searchSection = document.getElementById("siteSearchResults");
    if (!searchSection) {
        document.body.classList.remove("search-results-visible");
        return;
    }

    searchSection.hidden = true;
    document.body.classList.remove("search-results-visible");
}

function renderSearchResults(query, options = {}) {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
        hideSearchResults();
        return;
    }

    const searchSection = ensureSearchResultsSection();
    const searchHeading = document.getElementById("siteSearchHeading");
    const searchSummary = document.getElementById("siteSearchSummary");
    const searchList = document.getElementById("siteSearchList");

    if (!searchSection || !searchHeading || !searchSummary || !searchList) {
        return;
    }

    const results = searchSite(trimmedQuery);
    searchHeading.textContent = `Results for "${trimmedQuery}"`;
    searchSummary.textContent = results.length > 0
        ? `${results.length} matching result${results.length === 1 ? "" : "s"} found across articles, multimedia, and archives.`
        : `No matching results found for "${trimmedQuery}".`;

    searchList.innerHTML = results.length > 0
        ? results.map((item) => createSearchResultCard(item)).join("")
        : `<div class="news-empty">No related articles or multimedia entries matched your search.</div>`;

    searchSection.hidden = false;
    document.body.classList.add("search-results-visible");
    observeAnimatedElements();

    if (options.scrollIntoView) {
        searchSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

renderTicker();
renderHomePage();
renderSectionPage();
renderArticlePage();
renderMultimedia();
setupMultimediaFullscreenControls();
renderIssues();

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navTools = document.querySelector(".nav-tools");
const headerSearch = document.querySelector(".header-search");
const headerSearchForms = document.querySelectorAll(".header-search");
const headerSearchInputs = document.querySelectorAll(".header-search-input");

setupThemeToggle();

function syncMobileSearchPlacement() {
    if (!navMenu || !headerSearch || !navTools) {
        return;
    }

    if (window.innerWidth <= 1100) {
        if (headerSearch.parentElement !== navMenu) {
            navMenu.insertBefore(headerSearch, navMenu.firstChild);
        }
        return;
    }

    if (headerSearch.parentElement !== navTools) {
        navTools.insertBefore(headerSearch, navTools.firstChild);
    }
}

syncMobileSearchPlacement();

function syncSearchInputValues(sourceInput) {
    headerSearchInputs.forEach((input) => {
        if (input !== sourceInput) {
            input.value = sourceInput.value;
        }
    });
}

headerSearchForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector(".header-search-input");
        if (!input) {
            return;
        }

        syncSearchInputValues(input);
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("search", input.value.trim());
        window.history.replaceState({}, "", nextUrl);
        renderSearchResults(input.value, { scrollIntoView: true });
    });
});

headerSearchInputs.forEach((input) => {
    input.addEventListener("input", () => {
        syncSearchInputValues(input);
        const nextUrl = new URL(window.location.href);
        if (input.value.trim()) {
            nextUrl.searchParams.set("search", input.value.trim());
        } else {
            nextUrl.searchParams.delete("search");
        }
        window.history.replaceState({}, "", nextUrl);
        renderSearchResults(input.value);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            input.value = "";
            syncSearchInputValues(input);
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.delete("search");
            window.history.replaceState({}, "", nextUrl);
            hideSearchResults();
        }
    });
});

const initialSearchQuery = new URLSearchParams(window.location.search).get("search");
if (initialSearchQuery) {
    headerSearchInputs.forEach((input) => {
        input.value = initialSearchQuery;
    });
    renderSearchResults(initialSearchQuery);
}

if (hamburger && navMenu) {
    const closeMenu = () => {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    };

    const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.classList.toggle("nav-open", isOpen);
    };

    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        const clickedInsideMenu = navMenu.contains(event.target);
        const clickedHamburger = hamburger.contains(event.target);

        if (!clickedInsideMenu && !clickedHamburger && navMenu.classList.contains("active")) {
            closeMenu();
        }
    });
}

const navLinks = document.querySelectorAll(".nav-menu a");
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (navMenu && hamburger) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open");
        }
    });
});

const navbar = document.querySelector(".navbar");
const sticky = navbar ? navbar.offsetTop : 0;

function stickyNavbar() {
    if (!navbar) {
        return;
    }

    if (window.pageYOffset > sticky) {
        navbar.classList.add("sticky");
    } else {
        navbar.classList.remove("sticky");
    }
}

window.addEventListener("scroll", stickyNavbar);

const shareButtons = document.querySelectorAll(".share-btn");
const shareFeedback = document.getElementById("shareFeedback");

function setShareFeedback(message) {
    if (shareFeedback) {
        shareFeedback.textContent = message;
    }
}


function isLikelyMobileDevice() {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
}

async function copyTextToClipboard(value) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
    }

    const helperInput = document.createElement("textarea");
    helperInput.value = value;
    helperInput.setAttribute("readonly", "");
    helperInput.style.position = "absolute";
    helperInput.style.left = "-9999px";
    document.body.appendChild(helperInput);
    helperInput.select();

    try {
        return document.execCommand("copy");
    } finally {
        document.body.removeChild(helperInput);
    }
}

async function shareViaNativeSheet(shareUrl, title, visibleUrl) {
    if (navigator.share) {
        await navigator.share({
            title,
            text: `${title}\n${visibleUrl}`,
            url: shareUrl
        });
        return true;
    }

    return false;
}

function buildShareCaption(title, articleUrl) {
    return `${title}\n${articleUrl}`;
}

function openShareUrl(shareUrl) {
    if (isLikelyMobileDevice()) {
        window.location.assign(shareUrl);
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=500");
}

shareButtons.forEach((button) => {
    button.addEventListener("click", async function() {
        const platform = this.getAttribute("data-platform");
        const currentSlug = window.__CLSU_ACTIVE_ARTICLE_SLUG || new URLSearchParams(window.location.search).get("slug") || "";
        const shareUrl = getArticleShareUrl(currentSlug);
        const articleUrl = toAbsoluteUrl(getArticleUrl(currentSlug));
        const title = document.title;
        const shareCaption = buildShareCaption(title, articleUrl);

        setShareFeedback("");

        if (platform === "copy") {
            try {
                const copied = await copyTextToClipboard(shareUrl);
                setShareFeedback(copied ? "Article link copied to your clipboard." : "Copy the article link from the address bar.");
            } catch (error) {
                setShareFeedback("Copy the article link from the address bar.");
            }
            return;
        }

        if (isLikelyMobileDevice()) {
            try {
                const shared = await shareViaNativeSheet(shareUrl, title, articleUrl);
                if (shared) {
                    setShareFeedback("Share sheet opened.");
                    return;
                }
            } catch (error) {
                
            }
        }

        if (platform === "facebook") {
            const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareCaption)}`;
            openShareUrl(facebookShareUrl);
            return;
        }

        if (platform === "twitter") {
            const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareCaption)}`;
            openShareUrl(twitterShareUrl);
            return;
        }

        if (platform === "instagram") {
            try {
                const copied = await copyTextToClipboard(shareUrl);
                if (copied) {
                    setShareFeedback("Article link copied. You can now paste it on Instagram.");
                } else {
                    setShareFeedback("Copy the article link from the address bar, then paste it on Instagram.");
                }
            } catch (error) {
                setShareFeedback("Copy the article link from the address bar, then paste it on Instagram.");
            }

            if (isLikelyMobileDevice()) {
                window.location.assign("https://www.instagram.com/");
            } else {
                window.open("https://www.instagram.com/", "_blank");
            }
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
        const targetSelector = this.getAttribute("href");
        const target = targetSelector ? document.querySelector(targetSelector) : null;
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

window.addEventListener("resize", () => {
    syncMobileSearchPlacement();

    if (window.innerWidth > 768 && navMenu && hamburger) {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    }
});

observeAnimatedElements();

const style = document.createElement("style");
style.textContent = `
    .article-card, .board-member, .value-card, .news-card, .multimedia-card, .issue-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .article-card.animate-in, .board-member.animate-in, .value-card.animate-in, .news-card.animate-in, .multimedia-card.animate-in, .issue-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .navbar.sticky {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .hamburger.active span:nth-child(1) {
        transform: translateX(-50%) rotate(45deg);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: translateX(-50%) rotate(-45deg);
    }
`;
document.head.appendChild(style);
