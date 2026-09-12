/* =========================================================
   JOBBOARD — MAIN JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector, parent = document) {
    return parent.querySelector(selector);
}

function $$(selector, parent = document) {
    return Array.from(
        parent.querySelectorAll(selector)
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeMainHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}


/* =========================================================
   FORMATTERS
   ========================================================= */

function formatMainLabel(value) {

    return String(value || "")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


function formatMainDate(value) {

    if (!value) {
        return "Recently posted";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently posted";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function stripMainHtml(value) {

    const element =
        document.createElement("div");

    element.innerHTML =
        String(value ?? "");

    return (
        element.textContent ||
        element.innerText ||
        ""
    ).replace(/\s+/g, " ").trim();
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initializeMobileNavigation() {

    const header =
        $(".site-header");

    const menuButton =
        $(".mobile-menu-button");

    const navigation =
        $(".main-navigation");

    if (
        !header ||
        !menuButton ||
        !navigation
    ) {
        return;
    }

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    menuButton.addEventListener(
        "click",
        () => {

            const active =
                header.classList.toggle(
                    "menu-active"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(active)
            );

            menuButton.setAttribute(
                "aria-label",
                active
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );
        }
    );

    $$(".main-navigation a").forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    header.classList.remove(
                        "menu-active"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuButton.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );
                }
            );
        }
    );
}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initializeActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";

    $$(".main-navigation a").forEach(
        (link) => {

            const href =
                link.getAttribute("href") ||
                "";

            const linkPage =
                href.split("?")[0]
                    .split("#")[0]
                    .split("/")
                    .pop();

            const isActive =
                linkPage === currentPage ||
                (
                    currentPage === "" &&
                    linkPage === "index.html"
                );

            link.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            }
        }
    );
}


/* =========================================================
   SEARCH REDIRECTION
   ========================================================= */

function redirectToJobsSearch(keyword = "", location = "") {

    const params =
        new URLSearchParams();

    if (keyword.trim()) {
        params.set(
            "keyword",
            keyword.trim()
        );
    }

    if (location.trim()) {
        params.set(
            "location",
            location.trim()
        );
    }

    const query =
        params.toString();

    window.location.href =
        query
            ? `jobs.html?${query}`
            : "jobs.html";
}


function initializeGlobalSearchForms() {

    $$(".search-form, #heroSearchForm, #searchForm").forEach(
        (form) => {

            if (
                form.dataset.searchInitialized ===
                "true"
            ) {
                return;
            }

            form.dataset.searchInitialized =
                "true";

            const keywordInput =
                form.querySelector(
                    'input[name="keyword"], input[name="q"], input[name="search"]'
                );

            const locationInput =
                form.querySelector(
                    'input[name="location"]'
                );

            form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();

                    redirectToJobsSearch(
                        keywordInput?.value || "",
                        locationInput?.value || ""
                    );
                }
            );
        }
    );
}


function initializePopularSearches() {

    $$(".popular-search, [data-search-keyword]").forEach(
        (element) => {

            element.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    const keyword =
                        element.dataset.searchKeyword ||
                        element.textContent.trim();

                    redirectToJobsSearch(
                        keyword,
                        ""
                    );
                }
            );
        }
    );
}


function initializeHeaderSearchButton() {

    const button =
        $(".header-search-button");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "jobs.html";
        }
    );
}


/* =========================================================
   BOOKMARKS
   ========================================================= */

function initializeBookmarkButtons() {

    $$(".bookmark-button[data-job-id]").forEach(
        (button) => {

            if (
                button.dataset.bookmarkInitialized ===
                "true"
            ) {
                return;
            }

            button.dataset.bookmarkInitialized =
                "true";

            const jobId =
                button.dataset.jobId;

            const storageKey =
                `jobboard_saved_job_${jobId}`;

            let saved =
                false;

            try {

                saved =
                    window.localStorage.getItem(
                        storageKey
                    ) === "true";

            } catch (error) {

                saved = false;
            }

            updateMainBookmarkButton(
                button,
                saved
            );

            button.addEventListener(
                "click",
                () => {

                    saved =
                        !saved;

                    try {

                        window.localStorage.setItem(
                            storageKey,
                            String(saved)
                        );

                    } catch (error) {

                        console.warn(
                            "Unable to save bookmark:",
                            error
                        );
                    }

                    updateMainBookmarkButton(
                        button,
                        saved
                    );
                }
            );
        }
    );
}


function updateMainBookmarkButton(button, saved) {

    button.textContent =
        saved
            ? "♥"
            : "♡";

    button.setAttribute(
        "aria-pressed",
        String(saved)
    );

    button.setAttribute(
        "aria-label",
        saved
            ? "Remove saved job"
            : "Save this job"
    );

    button.classList.toggle(
        "is-saved",
        saved
    );
}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function initializeCurrentYear() {

    const year =
        new Date().getFullYear();

    $$(".current-year, #currentYear").forEach(
        (element) => {
            element.textContent =
                year;
        }
    );
}


/* =========================================================
   HOMEPAGE HELPERS
   ========================================================= */

function isHomepage() {

    const page =
        window.location.pathname
            .split("/")
            .pop();

    return (
        page === "" ||
        page === "index.html"
    );
}


function getMainApiList(response) {

    if (
        window.JobBoardAPI &&
        typeof window.JobBoardAPI.normalizeList ===
        "function"
    ) {
        return window.JobBoardAPI.normalizeList(
            response
        );
    }

    if (Array.isArray(response)) {
        return response;
    }

    return (
        response?.items ||
        response?.results ||
        response?.jobs ||
        response?.companies ||
        response?.categories ||
        response?.data ||
        []
    );
}


function getMainJobId(job) {

    return (
        job.id ??
        job.job_id ??
        job.external_id ??
        job.slug ??
        ""
    );
}


function getMainJobTitle(job) {

    return (
        job.title ||
        job.job_title ||
        "Untitled job"
    );
}


function getMainCompanyName(job) {

    return (
        job.company_name ||
        job.company ||
        job.employer_name ||
        "Company not specified"
    );
}


function getMainJobLocation(job) {

    return (
        job.location ||
        job.city ||
        job.job_location ||
        "Location not specified"
    );
}


function getMainJobLogo(job) {

    return (
        job.company_logo ||
        job.logo_url ||
        job.company_logo_url ||
        ""
    );
}


function getMainJobType(job) {

    return (
        job.job_type ||
        job.employment_type ||
        job.type ||
        ""
    );
}


function getMainWorkMode(job) {

    return (
        job.work_mode ||
        job.remote_type ||
        job.remote ||
        ""
    );
}


function createMainJobCard(job) {

    const id =
        getMainJobId(job);

    const title =
        getMainJobTitle(job);

    const company =
        getMainCompanyName(job);

    const location =
        getMainJobLocation(job);

    const logo =
        getMainJobLogo(job);

    const jobType =
        getMainJobType(job);

    const workMode =
        getMainWorkMode(job);

    const source =
        job.source ||
        job.source_name ||
        "";

    const description =
        stripMainHtml(
            job.description ||
            job.summary ||
            ""
        );

    const slug =
        job.slug ||
        id;

    const logoMarkup =
        logo
            ? `
                <img
                    src="${escapeMainHtml(logo)}"
                    alt="${escapeMainHtml(company)} logo"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <span
                    class="company-logo-fallback"
                    aria-hidden="true"
                    style="display:none;"
                >
                    ${escapeMainHtml(
                        company.charAt(0).toUpperCase()
                    )}
                </span>
            `
            : `
                <span
                    class="company-logo-fallback"
                    aria-hidden="true"
                >
                    ${escapeMainHtml(
                        company.charAt(0).toUpperCase()
                    )}
                </span>
            `;

    return `
        <article class="job-card">

            <div class="job-card-top">

                <div class="job-company-logo">
                    ${logoMarkup}
                </div>

                <button
                    type="button"
                    class="bookmark-button"
                    data-job-id="${escapeMainHtml(id)}"
                    aria-label="Save ${escapeMainHtml(title)}"
                    aria-pressed="false"
                >
                    ♡
                </button>

            </div>

            <div class="job-card-content">

                <a
                    href="job-details.html?id=${encodeURIComponent(slug)}"
                    class="job-card-title"
                >
                    ${escapeMainHtml(title)}
                </a>

                <p class="job-card-company">
                    ${escapeMainHtml(company)}
                </p>

                <div class="job-card-meta">

                    <span>
                        📍
                        ${escapeMainHtml(location)}
                    </span>

                    ${
                        jobType
                            ? `
                                <span>
                                    💼
                                    ${escapeMainHtml(
                                        formatMainLabel(jobType)
                                    )}
                                </span>
                            `
                            : ""
                    }

                    ${
                        workMode
                            ? `
                                <span>
                                    🌐
                                    ${escapeMainHtml(
                                        formatMainLabel(workMode)
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

                ${
                    description
                        ? `
                            <p class="job-card-description">
                                ${escapeMainHtml(
                                    description.slice(0, 145)
                                )}${description.length > 145 ? "..." : ""}
                            </p>
                        `
                        : ""
                }

                <div class="job-card-tags">

                    ${
                        jobType
                            ? `
                                <span class="tag tag-primary">
                                    ${escapeMainHtml(
                                        formatMainLabel(jobType)
                                    )}
                                </span>
                            `
                            : ""
                    }

                    ${
                        workMode
                            ? `
                                <span class="tag tag-success">
                                    ${escapeMainHtml(
                                        formatMainLabel(workMode)
                                    )}
                                </span>
                            `
                            : ""
                    }

                    ${
                        source
                            ? `
                                <span class="tag">
                                    ${escapeMainHtml(source)}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;
}


function createMainCompanyCard(company) {

    const id =
        company.id ??
        company.company_id ??
        company.slug ??
        "";

    const name =
        company.name ||
        company.company_name ||
        "Company";

    const industry =
        company.industry ||
        company.industry_name ||
        "Various industries";

    const description =
        stripMainHtml(
            company.description ||
            company.summary ||
            "Explore opportunities from this company."
        );

    const logo =
        company.logo_url ||
        company.logo ||
        company.company_logo ||
        "";

    const jobCount =
        company.job_count ??
        company.jobs_count ??
        company.open_jobs ??
        0;

    const slug =
        company.slug ||
        id ||
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return `
        <article class="company-card">

            <div class="company-card-header">

                <div class="company-logo">

                    ${
                        logo
                            ? `
                                <img
                                    src="${escapeMainHtml(logo)}"
                                    alt="${escapeMainHtml(name)} logo"
                                    loading="lazy"
                                >
                            `
                            : `
                                <span
                                    class="company-logo-fallback"
                                    aria-hidden="true"
                                >
                                    ${escapeMainHtml(
                                        name.charAt(0).toUpperCase()
                                    )}
                                </span>
                            `
                    }

                </div>

                <div>

                    <h3 class="company-name">
                        ${escapeMainHtml(name)}
                    </h3>

                    <p class="company-industry">
                        ${escapeMainHtml(industry)}
                    </p>

                </div>

            </div>

            <p class="company-card-description">
                ${escapeMainHtml(
                    description.slice(0, 125)
                )}${description.length > 125 ? "..." : ""}
            </p>

            <div class="company-card-footer">

                <span class="company-job-count">
                    ${Number(jobCount).toLocaleString()}
                    ${Number(jobCount) === 1 ? "job" : "jobs"}
                </span>

                <a
                    class="company-view-link"
                    href="company-details.html?id=${encodeURIComponent(slug)}"
                >
                    View company →
                </a>

            </div>

        </article>
    `;
}


function createMainCategoryCard(category) {

    const id =
        category.id ??
        category.category_id ??
        category.slug ??
        "";

    const name =
        category.name ||
        category.category_name ||
        "Category";

    const count =
        category.job_count ??
        category.jobs_count ??
        category.open_jobs ??
        0;

    const slug =
        category.slug ||
        id ||
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return `
        <a
            class="category-card"
            href="jobs.html?category=${encodeURIComponent(slug)}"
        >

            <span
                class="category-icon"
                aria-hidden="true"
            >
                📁
            </span>

            <span class="category-card-content">

                <span class="category-name">
                    ${escapeMainHtml(name)}
                </span>

                <span class="category-count">
                    ${Number(count).toLocaleString()}
                    ${Number(count) === 1 ? "job" : "jobs"}
                </span>

            </span>

            <span
                class="category-arrow"
                aria-hidden="true"
            >
                →
            </span>

        </a>
    `;
}


/* =========================================================
   HOMEPAGE CONTAINER
   ========================================================= */

function getHomepageContainer(selectors) {

    for (const selector of selectors) {

        const element =
            $(selector);

        if (element) {
            return element;
        }
    }

    return null;
}


function renderMainList(
    selectors,
    items,
    cardRenderer,
    emptyMessage = "No data available yet."
) {

    const container =
        getHomepageContainer(
            selectors
        );

    if (!container) {
        return;
    }

    if (
        !Array.isArray(items) ||
        !items.length
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <p>
                    ${escapeMainHtml(emptyMessage)}
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        items
            .map(cardRenderer)
            .join("");

    initializeBookmarkButtons();
}


/* =========================================================
   HOMEPAGE STATISTICS
   ========================================================= */

async function loadHomepageStats() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.stats
    ) {
        return;
    }

    try {

        const response =
            await window.JobBoardAPI.stats.overview();

        const stats =
            response?.data ||
            response?.stats ||
            response ||
            {};

        const values = {
            totalJobs:
                stats.total_jobs ??
                stats.jobs ??
                stats.job_count,

            totalCompanies:
                stats.total_companies ??
                stats.companies ??
                stats.company_count,

            totalCategories:
                stats.total_categories ??
                stats.categories ??
                stats.category_count,

            remoteJobs:
                stats.remote_jobs ??
                stats.remote_job_count
        };

        Object.entries(values).forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(id);

                if (
                    element &&
                    value !== undefined &&
                    value !== null
                ) {
                    element.textContent =
                        Number(value).toLocaleString();
                }
            }
        );

    } catch (error) {

        console.warn(
            "Homepage statistics unavailable:",
            error
        );
    }
}


/* =========================================================
   HOMEPAGE JOBS
   ========================================================= */

async function loadHomepageJobs() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.jobs
    ) {
        return;
    }

    const requests = [
        {
            selector: [
                "#trendingJobs",
                "#trendingJobsList"
            ],
            request:
                () => window.JobBoardAPI.trends.jobs({
                    limit: 6
                }),
            empty:
                "No trending jobs available yet."
        },
        {
            selector: [
                "#latestJobs",
                "#latestJobsList"
            ],
            request:
                () => window.JobBoardAPI.jobs.list({
                    sort: "latest",
                    page: 1,
                    limit: 6
                }),
            empty:
                "No latest jobs available yet."
        },
        {
            selector: [
                "#remoteJobsList",
                "#remoteJobs"
            ],
            request:
                () => window.JobBoardAPI.jobs.list({
                    work_mode: "remote",
                    page: 1,
                    limit: 6
                }),
            empty:
                "No remote jobs available yet."
        },
        {
            selector: [
                "#internshipJobs",
                "#internshipJobsList"
            ],
            request:
                () => window.JobBoardAPI.jobs.list({
                    job_type: "internship",
                    page: 1,
                    limit: 6
                }),
            empty:
                "No internship jobs available yet."
        }
    ];

    await Promise.all(
        requests.map(
            async (item) => {

                const container =
                    getHomepageContainer(
                        item.selector
                    );

                if (!container) {
                    return;
                }

                try {

                    const response =
                        await item.request();

                    const items =
                        getMainApiList(
                            response
                        );

                    renderMainList(
                        item.selector,
                        items,
                        createMainJobCard,
                        item.empty
                    );

                } catch (error) {

                    console.warn(
                        "Homepage job section unavailable:",
                        error
                    );
                }
            }
        )
    );
}


/* =========================================================
   HOMEPAGE CATEGORIES
   ========================================================= */

async function loadHomepageCategories() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.categories
    ) {
        return;
    }

    const container =
        getHomepageContainer(
            [
                "#jobCategories",
                "#categoriesContainer",
                "#categoriesList"
            ]
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await window.JobBoardAPI.categories.list({
                sort: "popular",
                limit: 8
            });

        const categories =
            getMainApiList(
                response
            );

        renderMainList(
            [
                "#jobCategories",
                "#categoriesContainer",
                "#categoriesList"
            ],
            categories,
            createMainCategoryCard,
            "No job categories available yet."
        );

    } catch (error) {

        console.warn(
            "Homepage categories unavailable:",
            error
        );
    }
}


/* =========================================================
   HOMEPAGE COMPANIES
   ========================================================= */

async function loadHomepageCompanies() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.companies
    ) {
        return;
    }

    const container =
        getHomepageContainer(
            [
                "#featuredCompanies",
                "#companiesContainer",
                "#companiesList"
            ]
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await window.JobBoardAPI.companies.list({
                sort: "popular",
                page: 1,
                limit: 6
            });

        const companies =
            getMainApiList(
                response
            );

        renderMainList(
            [
                "#featuredCompanies",
                "#companiesContainer",
                "#companiesList"
            ],
            companies,
            createMainCompanyCard,
            "No companies available yet."
        );

    } catch (error) {

        console.warn(
            "Homepage companies unavailable:",
            error
        );
    }
}


/* =========================================================
   HOMEPAGE INITIALIZATION
   ========================================================= */

async function initializeHomepageData() {

    if (!isHomepage()) {
        return;
    }

    if (!window.JobBoardAPI) {

        console.warn(
            "JobBoard API is not loaded."
        );

        return;
    }

    await Promise.allSettled([
        loadHomepageStats(),
        loadHomepageJobs(),
        loadHomepageCategories(),
        loadHomepageCompanies()
    ]);
}


/* =========================================================
   SMOOTH INTERNAL LINKS
   ========================================================= */

function initializeSmoothLinks() {

    $$('a[href^="#"]').forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        $(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        }
    );
}


/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

function initializeExternalLinks() {

    $$('a[href^="http://"], a[href^="https://"]').forEach(
        (link) => {

            link.setAttribute(
                "target",
                "_blank"
            );

            link.setAttribute(
                "rel",
                "noopener noreferrer"
            );
        }
    );
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

function initializeAccessibility() {

    $$("button").forEach(
        (button) => {

            if (
                !button.getAttribute("type") &&
                button.type !== "submit"
            ) {
                button.setAttribute(
                    "type",
                    "button"
                );
            }
        }
    );

    $$("img").forEach(
        (image) => {

            if (
                !image.getAttribute("alt")
            ) {
                image.setAttribute(
                    "alt",
                    ""
                );
            }
        }
    );
}


/* =========================================================
   GLOBAL ERROR NOTICE
   ========================================================= */

function initializeGlobalErrorHandler() {

    window.addEventListener(
        "error",
        (event) => {

            if (
                event.message &&
                !event.message.includes(
                    "ResizeObserver"
                )
            ) {
                console.warn(
                    "JobBoard frontend error:",
                    event.message
                );
            }
        }
    );
}


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

function initializeMain() {

    initializeMobileNavigation();

    initializeActiveNavigation();

    initializeGlobalSearchForms();

    initializePopularSearches();

    initializeHeaderSearchButton();

    initializeBookmarkButtons();

    initializeCurrentYear();

    initializeSmoothLinks();

    initializeExternalLinks();

    initializeAccessibility();

    initializeGlobalErrorHandler();

    initializeHomepageData();
}


/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMain
    );

} else {

    initializeMain();
}
