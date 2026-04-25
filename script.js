const siteConfig = window.CLSU_SITE_CONFIG || {};
const siteArticles = Array.isArray(window.CLSU_ARTICLES) ? [...window.CLSU_ARTICLES] : [];
const siteMultimedia = Array.isArray(window.CLSU_MULTIMEDIA) ? [...window.CLSU_MULTIMEDIA] : [];

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

    const sourceLink = item.sourceUrl
        ? `<a class="multimedia-link" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">Open on ${item.platform || "source"}</a>`
        : "";

    return `
        <article class="multimedia-card">
            <div class="${aspectRatioClass}">
                <iframe
                    src="${item.embedUrl}"
                    title="${item.title}"
                    scrolling="no"
                    allowfullscreen="true"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                </iframe>
            </div>
            <div class="multimedia-card-content">
                <h3>${item.title}</h3>
                <p class="multimedia-caption">${item.caption || ""}</p>
                <p class="multimedia-meta"><strong>Host</strong> ${item.host || "CLSU Collegian"}</p>
                <p class="multimedia-meta"><strong>Editor</strong> ${item.editor || "Multimedia Desk"}</p>
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

    if (featured && heroCategory && heroTitle && heroSummary && heroLink && heroImageWrapper) {
        heroCategory.textContent = featured.category;
        heroTitle.textContent = featured.title;
        heroSummary.textContent = featured.summary;
        heroLink.href = getArticleUrl(featured.slug);
        heroImageWrapper.innerHTML = featured.image
            ? `<img src="${featured.image}" alt="${featured.imageAlt || featured.title}">`
            : `<div class="hero-placeholder"></div>`;
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

    document.title = `${article.title} | CLSU Collegian`;
    document.getElementById("articleCategory").textContent = article.category;
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleAuthor").textContent = getAuthorLine(article);
    document.getElementById("articleDate").textContent = formatDate(article.date);
    document.getElementById("articleReadTime").textContent = article.readTime || "10 min read";
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
    const animatedElements = document.querySelectorAll(".article-card, .board-member, .position-card, .value-card, .news-card, .multimedia-card");
    if (animatedElements.length === 0 || !("IntersectionObserver" in window)) {
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-in");
            }
        });
    }, observerOptions);

    animatedElements.forEach((element) => observer.observe(element));
}

renderTicker();
renderHomePage();
renderSectionPage();
renderArticlePage();
renderMultimedia();

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

const joinForm = document.getElementById("joinForm");
if (joinForm) {
    joinForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        let isValid = true;
        const requiredFields = ["name", "email", "studentId", "course", "year", "position", "motivation"];

        requiredFields.forEach((field) => {
            if (!data[field] || data[field].trim() === "") {
                isValid = false;
                showError(field, "This field is required");
            } else {
                clearError(field);
            }
        });

        if (data.email && !isValidEmail(data.email)) {
            isValid = false;
            showError("email", "Please enter a valid email address");
        }

        if (isValid) {
            showSuccess("Thank you for your application! We will review your submission and get back to you within 2-3 weeks.");
            this.reset();
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(field, message) {
    const fieldElement = document.getElementById(field);
    const existingError = fieldElement.parentNode.querySelector(".error-message");

    if (existingError) {
        existingError.textContent = message;
    } else {
        const errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.textContent = message;
        errorElement.style.color = "#d32f2f";
        errorElement.style.fontSize = "0.875rem";
        errorElement.style.marginTop = "0.25rem";
        fieldElement.parentNode.appendChild(errorElement);
    }

    fieldElement.style.borderColor = "#d32f2f";
}

function clearError(field) {
    const fieldElement = document.getElementById(field);
    const errorElement = fieldElement.parentNode.querySelector(".error-message");

    if (errorElement) {
        errorElement.remove();
    }

    fieldElement.style.borderColor = "#ddd";
}

function showSuccess(message) {
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    successElement.style.backgroundColor = "#e8f5e8";
    successElement.style.color = "#2e7d32";
    successElement.style.padding = "1rem";
    successElement.style.borderRadius = "4px";
    successElement.style.marginTop = "1rem";
    successElement.style.border = "1px solid #4caf50";

    const form = document.getElementById("joinForm");
    form.appendChild(successElement);

    setTimeout(() => {
        successElement.remove();
    }, 5000);
}

const shareButtons = document.querySelectorAll(".share-btn");
shareButtons.forEach((button) => {
    button.addEventListener("click", function() {
        const platform = this.getAttribute("data-platform");
        const url = window.location.href;
        const title = document.title;

        let shareUrl = "";

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case "email":
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
                break;
        }

        if (shareUrl) {
            if (platform === "email") {
                window.location.href = shareUrl;
            } else {
                window.open(shareUrl, "_blank", "width=600,height=400");
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
    .article-card, .board-member, .position-card, .value-card, .news-card, .multimedia-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .article-card.animate-in, .board-member.animate-in, .position-card.animate-in, .value-card.animate-in, .news-card.animate-in, .multimedia-card.animate-in {
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
