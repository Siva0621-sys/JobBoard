/* =========================================================
   JOBBOARD — CATEGORIES PAGE
   ========================================================= */

"use strict";


/* =========================================================
   STATE
   ========================================================= */

const categoriesState = {
    keyword: "",
    sort: "popular",

    total: 0,
    loading: false
};


/* =========================================================
   DOM HELPER
   ========================================================= */

function categoriesElement(selector) {
    return document.querySelector(selector);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeCategoriesHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}


/* =========================================================
   READ URL PARAMETERS
   ========================================================= */

function readCategorySearchParams() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    categoriesState.keyword =
        params.get("keyword") || "";

    categoriesState.sort =
        params.get("sort") || "popular";
}


/* =========================================================
   UPDATE URL
   ========================================================= */

function updateCategorySearchUrl() {

    const params =
        new URLSearchParams();

    if (categoriesState.keyword) {
        params.set(
            "keyword",
            categoriesState.keyword
        );
    }

    if (categoriesState.sort) {
        params.set(
            "sort",
            categoriesState.sort
        );
    }

    const query =
        params.toString();

    const newUrl =
        query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        newUrl
    );
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showCategoriesLoading() {

    const container =
        categoriesElement(
            "#categoriesContainer, #categoriesList, #categoryResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-state">

            <div
                class="loading-spinner"
                aria-hidden="true"
            ></div>

            <p>
                Loading job categories...
            </p>

        </div>
    `;
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showCategoriesEmpty() {

    const container =
        categoriesElement(
            "#categoriesContainer, #categoriesList, #categoryResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">

            <div
                class="empty-state-icon"
                aria-hidden="true"
            >
                🗂️
            </div>

            <h3>
                No categories found
            </h3>

            <p>
                Try another category search.
            </p>

            <button
                type="button"
                class="button button-secondary"
                id="clearCategoryFilters"
            >
                Clear search
            </button>

        </div>
    `;

    categoriesElement(
        "#clearCategoryFilters"
    )?.addEventListener(
        "click",
        clearCategoryFilters
    );
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showCategoriesError(message) {

    const container =
        categoriesElement(
            "#categoriesContainer, #categoriesList, #categoryResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="error-state">

            <div
                class="error-state-icon"
                aria-hidden="true"
            >
                !
            </div>

            <h3>
                Unable to load categories
            </h3>

            <p>
                ${escapeCategoriesHtml(
                    message ||
                    "Something went wrong while loading categories."
                )}
            </p>

            <button
                type="button"
                class="button button-primary"
                id="retryCategories"
            >
                Try again
            </button>

        </div>
    `;

    categoriesElement(
        "#retryCategories"
    )?.addEventListener(
        "click",
        loadCategories
    );
}


/* =========================================================
   CATEGORY ICON
   ========================================================= */

function getCategoryIcon(category) {

    const icon =
        category.icon ||
        category.emoji ||
        "";

    if (icon) {
        return escapeCategoriesHtml(icon);
    }

    const name =
        category.name ||
        category.category_name ||
        "Category";

    const normalized =
        name.toLowerCase();

    const icons = [
        {
            keywords: [
                "software",
                "technology",
                "it",
                "developer",
                "web"
            ],
            icon: "💻"
        },
        {
            keywords: [
                "ai",
                "machine learning",
                "artificial intelligence"
            ],
            icon: "🤖"
        },
        {
            keywords: [
                "data",
                "analytics"
            ],
            icon: "📊"
        },
        {
            keywords: [
                "design",
                "creative",
                "ui",
                "ux"
            ],
            icon: "🎨"
        },
        {
            keywords: [
                "marketing",
                "sales",
                "content"
            ],
            icon: "📣"
        },
        {
            keywords: [
                "finance",
                "accounting",
                "banking"
            ],
            icon: "💰"
        },
        {
            keywords: [
                "health",
                "medical",
                "healthcare"
            ],
            icon: "⚕️"
        },
        {
            keywords: [
                "engineering",
                "mechanical",
                "civil",
                "electrical"
            ],
            icon: "⚙️"
        }
    ];

    const matched =
        icons.find((item) =>
            item.keywords.some((keyword) =>
                normalized.includes(keyword)
            )
        );

    return matched
        ? matched.icon
        : "📁";
}


/* =========================================================
   CATEGORY CARD
   ========================================================= */

function createCategoryCard(category) {

    const id =
        category.id ??
        category.category_id ??
        category.slug ??
        "";

    const name =
        category.name ||
        category.category_name ||
        "Category";

    const description =
        category.description ||
        category.summary ||
        "Explore opportunities in this category.";

    const jobCount =
        category.job_count ??
        category.jobs_count ??
        category.open_jobs ??
        0;

    const slug =
        category.slug ||
        id ||
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return `
        <a
            class="category-card"
            href="jobs.html?category=${encodeURIComponent(slug)}"
            data-category-id="${escapeCategoriesHtml(id)}"
        >

            <span
                class="category-icon"
                aria-hidden="true"
            >
                ${getCategoryIcon(category)}
            </span>

            <span class="category-card-content">

                <span class="category-name">
                    ${escapeCategoriesHtml(name)}
                </span>

                <span class="category-description">
                    ${escapeCategoriesHtml(
                        stripCategoryHtml(description)
                            .slice(0, 95)
                    )}${stripCategoryHtml(description).length > 95 ? "..." : ""}
                </span>

                <span class="category-count">
                    ${Number(jobCount).toLocaleString()}
                    ${Number(jobCount) === 1 ? "job" : "jobs"}
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
   STRIP HTML
   ========================================================= */

function stripCategoryHtml(value) {

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
   RENDER CATEGORIES
   ========================================================= */

function renderCategories(response) {

    const container =
        categoriesElement(
            "#categoriesContainer, #categoriesList, #categoryResults"
        );

    if (!container) {
        return;
    }

    const categories =
        window.JobBoardAPI.normalizeList(
            response
        );

    categoriesState.total =
        Number(
            response?.total ??
            response?.count ??
            categories.length
        );

    if (!categories.length) {
        showCategoriesEmpty();

        updateCategoriesResultCount();

        return;
    }

    container.innerHTML =
        categories.map(
            createCategoryCard
        ).join("");

    updateCategoriesResultCount();
}


/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function loadCategories() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.categories
    ) {
        showCategoriesError(
            "The JobBoard API client is not available."
        );

        return;
    }

    if (categoriesState.loading) {
        return;
    }

    categoriesState.loading = true;

    showCategoriesLoading();

    try {

        const params = {
            sort: categoriesState.sort
        };

        if (categoriesState.keyword) {
            params.keyword =
                categoriesState.keyword;
        }

        const response =
            await window.JobBoardAPI.categories.list(
                params
            );

        renderCategories(response);

    } catch (error) {

        console.error(
            "Failed to load categories:",
            error
        );

        showCategoriesError(
            error.message
        );

    } finally {

        categoriesState.loading = false;
    }
}


/* =========================================================
   RESULT COUNT
   ========================================================= */

function updateCategoriesResultCount() {

    const elements =
        document.querySelectorAll(
            ".categories-result-count, #categoriesResultCount"
        );

    const total =
        categoriesState.total;

    const text =
        total === 1
            ? "1 category found"
            : `${total.toLocaleString()} categories found`;

    elements.forEach(
        (element) => {
            element.textContent =
                text;
        }
    );
}


/* =========================================================
   SEARCH FORM
   ========================================================= */

function initializeCategorySearchForm() {

    const form =
        categoriesElement(
            "#categorySearchForm, .category-search-form"
        );

    if (!form) {
        return;
    }

    const keyword =
        form.querySelector(
            'input[name="keyword"], input[name="search"]'
        );

    if (keyword) {
        keyword.value =
            categoriesState.keyword;
    }

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            categoriesState.keyword =
                keyword?.value.trim() || "";

            updateCategorySearchUrl();

            loadCategories();
        }
    );
}


/* =========================================================
   SORT CONTROL
   ========================================================= */

function initializeCategorySort() {

    const sort =
        categoriesElement(
            "#categorySort"
        );

    if (!sort) {
        return;
    }

    sort.value =
        categoriesState.sort;

    sort.addEventListener(
        "change",
        () => {

            categoriesState.sort =
                sort.value || "popular";

            updateCategorySearchUrl();

            loadCategories();
        }
    );
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearCategoryFilters() {

    categoriesState.keyword = "";

    categoriesState.sort = "popular";

    updateCategorySearchUrl();

    const keyword =
        categoriesElement(
            '#categorySearchForm input[name="keyword"], .category-search-form input[name="keyword"]'
        );

    const sort =
        categoriesElement(
            "#categorySort"
        );

    if (keyword) {
        keyword.value = "";
    }

    if (sort) {
        sort.value = "popular";
    }

    loadCategories();
}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeCategoriesPage() {

    const isCategoriesPage =
        window.location.pathname
            .toLowerCase()
            .includes("categories.html");

    if (!isCategoriesPage) {
        return;
    }

    if (!window.JobBoardAPI) {
        showCategoriesError(
            "JobBoard API is unavailable."
        );

        return;
    }

    readCategorySearchParams();

    initializeCategorySearchForm();

    initializeCategorySort();

    loadCategories();
}


/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCategoriesPage
    );

} else {

    initializeCategoriesPage();
}
