const siteConfig = window.CLSU_SITE_CONFIG || {};
const siteArticles = Array.isArray(window.CLSU_ARTICLES) ? [...window.CLSU_ARTICLES] : [];
const siteMultimedia = Array.isArray(window.CLSU_MULTIMEDIA) ? [...window.CLSU_MULTIMEDIA] : [];
const siteIssues = Array.isArray(window.CLSU_ISSUES) ? [...window.CLSU_ISSUES] : [];

siteArticles.sort((left, right) => {
    const leftTime = left.date ? new Date(`${left.date}T00:00:00`).getTime() : 0;
    const rightTime = right.date ? new Date(`${right.date}T00:00:00`).getTime() : 0;
    return rightTime - leftTime;
});

const siteData = {
    articles: siteArticles,
    trending: Array.isArray(siteConfig.trending) ? siteConfig.trending : [],
    tickerItems: Array.isArray(siteConfig.tickerItems) ? siteConfig.tickerItems : [],
    featuredSlug: siteConfig.featuredSlug || ""
};

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

function getArticleBySlug(slug) {
    return siteData.articles.find((article) => article.slug === slug) || null;
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

function updateArticleSocialMeta(article) {
    if (!article) {
        return;
    }

    const articleUrl = toAbsoluteUrl(getArticleUrl(article.slug));
    const articleImage = article.image ? toAbsoluteUrl(article.image) : toAbsoluteUrl("logo.png");
    const articleTitle = `${article.title} | CLSU Collegian`;
    const articleDescription = (article.summary || "Campus stories from CLSU Collegian.").trim();
    const articleImageAlt = (article.imageAlt || article.title || "CLSU Collegian article image").trim();

    document.title = articleTitle;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
        descriptionMeta.setAttribute("content", articleDescription);
    }

    setMetaContent("canonicalUrl", articleUrl, "href");
    setMetaContent("ogTitle", articleTitle);
    setMetaContent("ogDescription", articleDescription);
    setMetaContent("ogUrl", articleUrl);
    setMetaContent("ogImage", articleImage);
    setMetaContent("ogImageAlt", articleImageAlt);
    setMetaContent("twitterTitle", articleTitle);
    setMetaContent("twitterDescription", articleDescription);
    setMetaContent("twitterImage", articleImage);
}

function getAuthorLine(article) {
    const fallbackAuthorLine = `By ${article.author}, CLSU Collegian`;

    if (!article.authorLine) {
        return fallbackAuthorLine;
    }

    const normalizedAuthor = (article.author || "").trim().toLowerCase();
    const normalizedAuthorLine = article.authorLine.trim().toLowerCase();

    if (normalizedAuthor && !normalizedAuthorLine.includes(normalizedAuthor)) {
        return fallbackAuthorLine;
    }

    return article.authorLine;
}

function normalizeCreditValue(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^(by|via)\s+/i, "");
}

function pushCredit(items, label, value) {
    const normalizedValue = normalizeCreditValue(value);
    if (!normalizedValue) {
        return;
    }

    items.push({ label, value: normalizedValue });
}

function getPhotoCreditLabel(value) {
    const normalizedValue = normalizeCreditValue(value).toLowerCase();
    const hasMultipleNames = normalizedValue.includes(" and ")
        || normalizedValue.includes("&")
        || normalizedValue.includes(",");

    return hasMultipleNames ? "Photos by:" : "Photo by:";
}

function getArticleCredits(article) {
    const credits = article && typeof article.credits === "object" && article.credits !== null
        ? article.credits
        : {};
    const items = [];

    pushCredit(items, "Report by:", credits.by || getAuthorLine(article));

    const photoCredit = credits.photosBy || article.photosBy;
    if (normalizeCreditValue(photoCredit)) {
        pushCredit(items, getPhotoCreditLabel(photoCredit), photoCredit);
    }

    pushCredit(items, "Layout by:", credits.layoutBy || article.layoutBy);
    pushCredit(items, "Illustrated by:", credits.illustratedBy || article.illustratedBy);

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
    return getArticleBySlug(siteData.featuredSlug) || siteData.articles[0] || null;
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

function renderTicker() {
    const ticker = document.getElementById("breakingTicker");
    if (!ticker) {
        return;
    }

    const items = siteData.tickerItems.length > 0 ? siteData.tickerItems : ["Latest updates from CLSU Collegian"];
    ticker.innerHTML = `<span>BREAKING:</span> ${items.join(" • ")}`;
}

function createCardImage(article) {
    if (article.image) {
        return `<img src="${article.image}" alt="${article.imageAlt || article.title}">`;
    }

    return `<div class="article-thumb-placeholder">${article.category}</div>`;
}

function createSectionCard(article) {
    const imageMarkup = article.image
        ? `<img src="${article.image}" alt="${article.imageAlt || article.title}" class="news-thumb">`
        : `<div class="news-thumb-placeholder">${article.category}</div>`;
    const readTime = article.readTime || "10 min read";

    return `
        <article class="news-card">
            <a class="news-card-link" href="${getArticleUrl(article.slug)}" aria-label="Read ${article.title}">
                ${imageMarkup}
                <div class="news-content">
                    <span class="category">${article.category}</span>
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
        tag: article.category,
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

function createMultimediaCard(item) {
    const aspectRatioClass = item.aspectRatio === "landscape"
        ? "video-container landscape"
        : "video-container portrait";
    const platformLabel = item.platform || "Multimedia";

    const sourceLink = item.sourceUrl
        ? `<a class="multimedia-link" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">Open on ${item.platform || "source"}</a>`
        : "";

    return `
        <article class="multimedia-card">
            <div class="multimedia-frame">
                <div class="${aspectRatioClass}">
                    <iframe
                        src="${item.embedUrl}"
                        title="${item.title}"
                        scrolling="no"
                        allowfullscreen="true"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                    </iframe>
                </div>
            </div>
            <div class="multimedia-card-content">
                <p class="multimedia-eyebrow">${platformLabel}</p>
                <h3>${item.title}</h3>
                <p class="multimedia-caption">${item.caption || ""}</p>
                <div class="multimedia-meta-grid">
                    <p class="multimedia-meta"><strong>Host</strong> ${item.host || "CLSU Collegian"}</p>
                    <p class="multimedia-meta"><strong>Editor</strong> ${item.editor || "Multimedia Desk"}</p>
                </div>
                ${sourceLink}
            </div>
        </article>
    `;
}

function renderMultimedia() {
    const homeGrid = document.getElementById("homeMultimediaGrid");
    const multimediaPageGrid = document.getElementById("multimediaPageGrid");

    if (homeGrid) {
        homeGrid.innerHTML = siteMultimedia.slice(0, 3).map((item) => createMultimediaCard(item)).join("");
    }

    if (multimediaPageGrid) {
        multimediaPageGrid.innerHTML = siteMultimedia.length > 0
            ? siteMultimedia.map((item) => createMultimediaCard(item)).join("")
            : `<div class="news-empty">No multimedia entries are available yet.</div>`;
    }

    observeAnimatedElements();
}

function createIssueCard(issue) {
    const issueLinks = Array.isArray(issue.links)
        ? issue.links.map((link) => `
            <a class="issue-link-pill" href="${link.url}" target="_blank" rel="noopener noreferrer">
                ${link.label}
            </a>
        `).join("")
        : "";

    const fullTitle = (issue.title || "").trim();
    let headingLineOne = fullTitle;
    let headingLineTwo = (issue.titleLineTwo || "").trim();

    if (!headingLineTwo && fullTitle) {
        const volumeMatch = fullTitle.match(/\s+(VOL\.?\s+.+)$/i);
        if (volumeMatch) {
            headingLineOne = fullTitle.slice(0, volumeMatch.index).trim();
            headingLineTwo = volumeMatch[1].trim();
        } else {
            const titleParts = fullTitle.split(/\s+/);
            if (titleParts.length > 1) {
                headingLineOne = titleParts[0];
                headingLineTwo = titleParts.slice(1).join(" ");
            }
        }
    }
    const issueSummary = issue.summary || "Read the latest digital issue of the CLSU Collegian.";
    const issueSubtitle = issue.subtitle ? `<p class="issue-subtitle">${issue.subtitle}</p>` : "";
    const issueLabel = issue.label ? `<p class="issue-eyebrow">${issue.label}</p>` : "";
    const issueHeading = headingLineTwo
        ? `
            <div class="issue-heading">
                <h3>${headingLineOne}</h3>
                <p class="issue-title-line-two">${headingLineTwo}</p>
            </div>
        `
        : `<h3>${headingLineOne}</h3>`;

    return `
        <article class="issue-card">
            <div class="issue-visual-shell">
                <div class="issue-visual-glow" aria-hidden="true"></div>
                <div class="issue-cover-frame">
                    <img src="${issue.image}" alt="${issue.imageAlt || issue.title}" class="issue-cover-image">
                </div>
            </div>
            <div class="issue-content">
                ${issueLabel}
                ${issueHeading}
                ${issueSubtitle}
                <p class="issue-summary">${issueSummary}</p>
                <div class="issue-actions">
                    ${issueLinks}
                </div>
            </div>
        </article>
    `;
}

function renderIssues() {
    const homeIssuesGrid = document.getElementById("homeIssuesGrid");
    const issuesPageGrid = document.getElementById("issuesPageGrid");
    const emptyMarkup = `<div class="news-empty">No issues are available yet.</div>`;

    if (homeIssuesGrid) {
        homeIssuesGrid.innerHTML = siteIssues.length > 0
            ? siteIssues.slice(0, 1).map((issue) => createIssueCard(issue)).join("")
            : emptyMarkup;
    }

    if (issuesPageGrid) {
        issuesPageGrid.innerHTML = siteIssues.length > 0
            ? siteIssues.map((issue) => createIssueCard(issue)).join("")
            : emptyMarkup;
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
    const heroLink = document.getElementById("heroLink");
    const heroImageWrapper = document.getElementById("heroImageWrapper");
    const heroSlideMedia = document.getElementById("heroSlideMedia");
    const heroCarouselDots = document.getElementById("heroCarouselDots");
    const heroPrevButton = document.getElementById("heroPrevButton");
    const heroNextButton = document.getElementById("heroNextButton");

    if (featured && heroCategory && heroTitle && heroSummary && heroLink && heroImageWrapper && heroSlideMedia) {
        heroCategory.textContent = featured.category;
        heroTitle.textContent = featured.title;
        heroSummary.textContent = featured.summary;
        heroLink.href = getArticleUrl(featured.slug);

        const heroArticles = siteData.articles
            .filter((article) => article.image)
            .slice(0, 5);
        const carouselItems = heroArticles.length > 0 ? heroArticles : [featured];
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
        seenCategories.add(categoryId);

        return `
            <article class="article-card" id="${articleId}">
                <a class="article-card-link" href="${getArticleUrl(article.slug)}" aria-label="Read ${article.title}">
                    ${createCardImage(article)}
                    <div class="card-content">
                        <span class="category">${article.category}</span>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <div class="card-meta">
                            <span>By ${article.author}</span>
                            <span>&bull;</span>
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
    const yearFilter = document.getElementById("section-year-filter");
    const sortFilter = document.getElementById("section-sort-filter");
    const sectionArticles = getArticlesByCategory(category);
    const years = [...new Set(sectionArticles
        .map((article) => article.date ? new Date(`${article.date}T00:00:00`).getFullYear() : null)
        .filter(Boolean))]
        .sort((left, right) => right - left);

    if (yearFilter && !yearFilter.dataset.initialized) {
        yearFilter.innerHTML = [`<option value="all">All years</option>`]
            .concat(years.map((year) => `<option value="${year}">${year}</option>`))
            .join("");
        yearFilter.dataset.initialized = "true";
    }

    if (sortFilter && !sortFilter.dataset.initialized) {
        sortFilter.dataset.initialized = "true";
    }

    const renderList = () => {
        const selectedYear = yearFilter ? yearFilter.value : "all";
        const selectedSort = sortFilter ? sortFilter.value : "latest";

        const filteredArticles = sectionArticles
            .filter((article) => {
                if (selectedYear === "all") {
                    return true;
                }

                return String(new Date(`${article.date}T00:00:00`).getFullYear()) === selectedYear;
            })
            .sort((left, right) => {
                const leftTime = left.date ? new Date(`${left.date}T00:00:00`).getTime() : 0;
                const rightTime = right.date ? new Date(`${right.date}T00:00:00`).getTime() : 0;
                return selectedSort === "oldest" ? leftTime - rightTime : rightTime - leftTime;
            });

        list.classList.add("news-feed");
        list.innerHTML = filteredArticles.length > 0
            ? filteredArticles.map((article) => createSectionCard(article)).join("")
            : `<div class="news-empty">No ${emptyLabel.toLowerCase()} articles are available yet.</div>`;
        observeAnimatedElements();
    };

    if (yearFilter && !yearFilter.dataset.bound) {
        yearFilter.addEventListener("change", renderList);
        yearFilter.dataset.bound = "true";
    }

    if (sortFilter && !sortFilter.dataset.bound) {
        sortFilter.addEventListener("change", renderList);
        sortFilter.dataset.bound = "true";
    }

    renderList();
}

function renderArticlePage() {
    const articleBody = document.getElementById("articleBody");
    if (!articleBody) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedSlug = params.get("slug");
    const article = getArticleBySlug(selectedSlug) || getFeaturedArticle();

    if (!article) {
        articleBody.innerHTML = "<p>No articles are available yet.</p>";
        return;
    }

    updateArticleSocialMeta(article);
    document.getElementById("articleCategory").textContent = article.category;
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleDate").textContent = formatDate(article.date);
    document.getElementById("articleReadTime").textContent = article.readTime || "10 min read";
    renderArticleCredits(article);
    articleBody.innerHTML = article.body;

    const articleFigure = document.getElementById("articleFigure");
    articleFigure.innerHTML = article.image
        ? `<img src="${article.image}" alt="${article.imageAlt || article.title}"><figcaption id="articleCaption"></figcaption>`
        : `<div class="hero-placeholder"></div><figcaption id="articleCaption"></figcaption>`;

    const relatedList = document.getElementById("relatedList");
    relatedList.innerHTML = getRelatedArticles(article).map((related) => `
        <a class="related-card" href="${getArticleUrl(related.slug)}" aria-label="Read ${related.title}">
            ${related.image ? `<img src="${related.image}" alt="${related.imageAlt || related.title}">` : `<div class="related-thumb-placeholder">${related.category}</div>`}
            <div class="related-content">
                <h4>${related.title}</h4>
                <p>${related.summary}</p>
            </div>
        </a>
    `).join("");
}

function observeAnimatedElements() {
    const animatedElements = document.querySelectorAll(".article-card, .board-member, .value-card, .news-card, .multimedia-card, .issue-card");
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

renderTicker();
renderHomePage();
renderSectionPage();
renderArticlePage();
renderMultimedia();
renderIssues();

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

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

shareButtons.forEach((button) => {
    button.addEventListener("click", async function() {
        const platform = this.getAttribute("data-platform");
        const url = window.location.href;
        const title = document.title;

        setShareFeedback("");

        if (platform === "facebook") {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(shareUrl, "_blank", "width=600,height=500");
            return;
        }

        if (platform === "twitter") {
            const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            window.open(shareUrl, "_blank", "width=600,height=500");
            return;
        }

        if (platform === "instagram") {
            try {
                const copied = await copyTextToClipboard(url);
                if (copied) {
                    setShareFeedback("Article link copied. You can now paste it on Instagram.");
                } else {
                    setShareFeedback("Copy the article link from the address bar, then paste it on Instagram.");
                }
            } catch (error) {
                setShareFeedback("Copy the article link from the address bar, then paste it on Instagram.");
            }

            window.open("https://www.instagram.com/", "_blank");
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
