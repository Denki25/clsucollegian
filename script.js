const siteData = window.CLSU_COLLEGIAN_DATA || { articles: [], trending: [], tickerItems: [] };

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

    if (featured) {
        heroCategory.textContent = featured.category;
        heroTitle.textContent = featured.title;
        heroSummary.textContent = featured.summary;
        heroLink.href = getArticleUrl(featured.slug);

        heroImageWrapper.innerHTML = featured.image
            ? `<img src="${featured.image}" alt="${featured.imageAlt || featured.title}">`
            : `<div class="hero-placeholder"></div>`;
    }

    const seenCategories = new Set();

    grid.innerHTML = siteData.articles.map((article) => {
        const categoryId = article.category.toLowerCase();
        const articleId = seenCategories.has(categoryId) ? article.slug : categoryId;
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
                            <span>${formatDate(article.date)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join("");

    const trendingTable = document.getElementById("trendingTable");
    if (trendingTable) {
        const trendingItems = siteData.trending.length > 0 ? siteData.trending : siteData.articles.slice(0, 5).map((article) => ({
            title: article.title,
            tag: article.category,
            slug: article.slug
        }));

        trendingTable.innerHTML = trendingItems.map((item, index) => `
            <a class="trending-row" href="${getArticleUrl(item.slug)}" aria-label="Read ${item.title}">
                <span class="trending-rank">${String(index + 1).padStart(2, "0")}</span>
                <span class="trending-topic">${item.title}</span>
                <span class="trending-tag">${item.tag}</span>
            </a>
        `).join("");
    }
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
    document.getElementById("articleAuthor").textContent = article.authorLine || `By ${article.author}`;
    document.getElementById("articleDate").textContent = formatDate(article.date);
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
    const animatedElements = document.querySelectorAll(".article-card, .board-member, .position-card, .value-card");
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
renderArticlePage();

// Mobile menu toggle
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

// Close mobile menu when clicking on a link
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

// Sticky navbar functionality
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

// Form submission handler (frontend only)
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

// Share button functionality (UI only)
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

// Smooth scrolling for anchor links
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
    .article-card, .board-member, .position-card, .value-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .article-card.animate-in, .board-member.animate-in, .position-card.animate-in, .value-card.animate-in {
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
