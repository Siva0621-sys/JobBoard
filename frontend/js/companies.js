/* =========================================================
   JOBBOARD — COMPANIES PAGE
   ========================================================= */

"use strict";

/* =========================================================
   STATE
   ========================================================= */

const companiesState = {
    keyword: "",
    industry: "",
    page: 1,
    limit: 12,
    total: 0,
    loading: false
};

/* =========================================================
   DOM HELPERS
   ========================================================= */

function companyElement(selector) {
    return document.querySelector(selector);
}

function companyElements(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}

/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeCompanyHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}

/* =========================================================
   STRIP HTML
   ========================================================= */

function stripCompanyHtml(value) {

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
   READ URL PARAMETERS
   ========================================================= */

function readCompanyParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    companiesState.keyword =
        params.get("keyword") ||
        params.get("q") ||
        "";

    companiesState.industry =
        params.get("industry") ||
        "";

    const page =
        Number(
            params.get("page") || 1
        );

    companiesState.page =
        Number.isFinite(page) && page > 0
            ? page
            : 1;
}

/* =========================================================
   UPDATE URL
   ========================================================= */

function updateCompanyUrl() {

    const params =
        new URLSearchParams();

    if (companiesState.keyword) {
        params.set(
            "keyword",
            companiesState.keyword
        );
    }

    if (companiesState.industry) {
        params.set(
            "industry",
            companiesState.industry
        );
    }

    if (companiesState.page > 1) {
        params.set(
            "page",
            String(companiesState.page)
        );
    }

    const query =
        params.toString();

    const url =
        query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        url
    );
}

/* =========================================================
   API RESPONSE NORMALIZATION
   ========================================================= */

function normalizeCompanyResponse(response) {

    let companies = [];

    if (Array.isArray(response)) {

        companies =
            response;

    } else {

        companies =
            response?.items ||
            response?.results ||
            response?.companies ||
            response?.data ||
            [];
    }

    if (!Array.isArray(companies)) {
        companies = [];
    }

    return {
        companies,

        total:
            Number(
                response?.total ??
                response?.count ??
                response?.total_companies ??
                companies.length
            ),

        page:
            Number(
                response?.page ||
                companiesState.page
            ),

        limit:
            Number(
                response?.limit ||
                companiesState.limit
            )
    };
}

/* =========================================================
   COMPANY LOGO
   ========================================================= */

function getCompanyLogo(company) {

    const name =
        company.name ||
        company.company_name ||
        "Company";

    const logo =
        company.logo_url ||
        company.logo ||
        company.company_logo ||
        "";

    if (logo) {

        return `
            <img
                src="${escapeCompanyHtml(logo)}"
                alt="${escapeCompanyHtml(name)} logo"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span
                class="company-logo-fallback"
                aria-hidden="true"
                style="display:none;"
            >
                ${escapeCompanyHtml(
                    name.charAt(0).toUpperCase()
                )}
            </span>
        `;
    }

    return `
        <span
            class="company-logo-fallback"
            aria-hidden="true"
        >
            ${escapeCompanyHtml(
                name.charAt(0).toUpperCase()
            )}
        </span>
    `;
}

/* =========================================================
   COMPANY CARD
   ========================================================= */

function createCompanyCard(company) {

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
        "Industry not specified";

    const location =
        company.location ||
        company.city ||
        company.headquarters ||
        "";

    const description =
        stripCompanyHtml(
            company.description ||
            company.summary ||
            "Explore current job opportunities from this company."
        );

    const jobCount =
        company.job_count ??
        company.jobs_count ??
        company.open_jobs ??
        0;

    const website =
        company.website ||
        company.website_url ||
        "";

    const slug =
        company.slug ||
        id ||
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return `
        <article class="company-card">

            <div class="company-card-header">

                <div class="company-logo">
                    ${getCompanyLogo(company)}
                </div>

                <div class="company-card-heading">

                    <h2 class="company-name">
                        ${escapeCompanyHtml(name)}
                    </h2>

                    <p class="company-industry">
                        ${escapeCompanyHtml(industry)}
                    </p>

                </div>

            </div>

            ${
                location
                    ? `
                        <div class="company-location">
                            📍
                            ${escapeCompanyHtml(location)}
                        </div>
                    `
                    : ""
            }

            <p class="company-card-description">
                ${escapeCompanyHtml(
                    description.slice(0, 150)
                )}${description.length > 150 ? "..." : ""}
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

            ${
                website
                    ? `
                        <a
                            class="company-website"
                            href="${escapeCompanyHtml(website)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Company website ↗
                        </a>
                    `
                    : ""
            }

        </article>
    `;
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function showCompaniesLoading() {

    const container =
        companyElement(
            "#companiesContainer, #companiesList, #companyResults"
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
                Loading companies...
            </p>

        </div>
    `;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function showCompaniesEmpty() {

    const container =
        companyElement(
            "#companiesContainer, #companiesList, #companyResults"
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
                🏢
            </div>

            <h2>
                No companies found
            </h2>

            <p>
                Try a different company name or industry.
            </p>

            <button
                type="button"
                class="button button-secondary"
                id="clearCompanyFilters"
            >
                Clear search
            </button>

        </div>
    `;

    companyElement(
        "#clearCompanyFilters"
    )?.addEventListener(
        "click",
        clearCompanyFilters
    );
}

/* =========================================================
   ERROR STATE
   ========================================================= */

function showCompaniesError(message) {

    const container =
        companyElement(
            "#companiesContainer, #companiesList, #companyResults"
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

            <h2>
                Unable to load companies
            </h2>

            <p>
                ${escapeCompanyHtml(
                    message ||
                    "Something went wrong while loading companies."
                )}
            </p>

            <button
                type="button"
                class="button button-primary"
                id="retryCompanies"
            >
                Try again
            </button>

        </div>
    `;

    companyElement(
        "#retryCompanies"
    )?.addEventListener(
        "click",
        loadCompanies
    );
}

/* =========================================================
   RENDER COMPANIES
   ========================================================= */

function renderCompanies(response) {

    const container =
        companyElement(
            "#companiesContainer, #companiesList, #companyResults"
        );

    if (!container) {
        return;
    }

    const result =
        normalizeCompanyResponse(
            response
        );

    companiesState.total =
        result.total;

    companiesState.page =
        result.page;

    if (!result.companies.length) {

        showCompaniesEmpty();

        updateCompanyResultCount();

        renderCompanyPagination(
            0
        );

        return;
    }

    container.innerHTML =
        result.companies
            .map(createCompanyCard)
            .join("");

    updateCompanyResultCount();

    renderCompanyPagination(
        result.total
    );
}

/* =========================================================
   RESULT COUNT
   ========================================================= */

function updateCompanyResultCount() {

    const total =
        Number(
            companiesState.total || 0
        );

    const text =
        total === 1
            ? "1 company found"
            : `${total.toLocaleString()} companies found`;

    companyElements(
        "#companyResultCount, .company-result-count"
    ).forEach(
        (element) => {
            element.textContent =
                text;
        }
    );
}

/* =========================================================
   PAGINATION
   ========================================================= */

function renderCompanyPagination(total) {

    const container =
        companyElement(
            "#companyPagination, .company-pagination"
        );

    if (!container) {
        return;
    }

    const pages =
        Math.ceil(
            Number(total || 0) /
            companiesState.limit
        );

    if (pages <= 1) {

        container.innerHTML = "";

        return;
    }

    const current =
        companiesState.page;

    let html =
        `<div class="pagination">`;

    if (current > 1) {

        html += `
            <button
                type="button"
                class="pagination-button"
                data-company-page="${current - 1}"
            >
                Previous
            </button>
        `;
    }

    const start =
        Math.max(
            1,
            current - 2
        );

    const end =
        Math.min(
            pages,
            current + 2
        );

    for (
        let page = start;
        page <= end;
        page += 1
    ) {

        html += `
            <button
                type="button"
                class="pagination-button ${
                    page === current
                        ? "active"
                        : ""
                }"
                data-company-page="${page}"
                ${
                    page === current
                        ? 'aria-current="page"'
                        : ""
                }
            >
                ${page}
            </button>
        `;
    }

    if (current < pages) {

        html += `
            <button
                type="button"
                class="pagination-button"
                data-company-page="${current + 1}"
            >
                Next
            </button>
        `;
    }

    html += "</div>";

    container.innerHTML =
        html;

    container
        .querySelectorAll(
            "[data-company-page]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        companiesState.page =
                            Number(
                                button.dataset.companyPage
                            );

                        updateCompanyUrl();

                        loadCompanies();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }
                );
            }
        );
}

/* =========================================================
   LOAD COMPANIES
   ========================================================= */

async function loadCompanies() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.companies
    ) {

        showCompaniesError(
            "The JobBoard API client is unavailable."
        );

        return;
    }

    if (companiesState.loading) {
        return;
    }

    companiesState.loading = true;

    showCompaniesLoading();

    try {

        const params = {
            keyword:
                companiesState.keyword,

            industry:
                companiesState.industry,

            page:
                companiesState.page,

            limit:
                companiesState.limit
        };

        Object.keys(params).forEach(
            (key) => {

                if (
                    params[key] === "" ||
                    params[key] === null ||
                    params[key] === undefined
                ) {
                    delete params[key];
                }
            }
        );

        const response =
            await window.JobBoardAPI.companies.list(
                params
            );

        renderCompanies(
            response
        );

    } catch (error) {

        console.error(
            "Failed to load companies:",
            error
        );

        showCompaniesError(
            error.message
        );

    } finally {

        companiesState.loading = false;
    }
}

/* =========================================================
   SEARCH FORM
   ========================================================= */

function initializeCompanySearchForm() {

    const form =
        companyElement(
            "#companySearchForm, .company-search-form"
        );

    if (!form) {
        return;
    }

    const keyword =
        form.querySelector(
            'input[name="keyword"], input[name="q"], input[name="search"]'
        );

    const industry =
        form.querySelector(
            'select[name="industry"], input[name="industry"]'
        );

    if (keyword) {
        keyword.value =
            companiesState.keyword;
    }

    if (industry) {
        industry.value =
            companiesState.industry;
    }

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            companiesState.keyword =
                keyword?.value.trim() || "";

            companiesState.industry =
                industry?.value || "";

            companiesState.page =
                1;

            updateCompanyUrl();

            loadCompanies();
        }
    );
}

/* =========================================================
   INDUSTRY FILTER
   ========================================================= */

function initializeCompanyIndustryFilter() {

    const control =
        companyElement(
            "#companyIndustry"
        );

    if (!control) {
        return;
    }

    control.value =
        companiesState.industry;

    control.addEventListener(
        "change",
        () => {

            companiesState.industry =
                control.value || "";

            companiesState.page =
                1;

            updateCompanyUrl();

            loadCompanies();
        }
    );
}

/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearCompanyFilters() {

    companiesState.keyword =
        "";

    companiesState.industry =
        "";

    companiesState.page =
        1;

    updateCompanyUrl();

    companyElements(
        "#companySearchForm input, .company-search-form input"
    ).forEach(
        (input) => {
            input.value = "";
        }
    );

    companyElements(
        "#companySearchForm select, .company-search-form select, #companyIndustry"
    ).forEach(
        (select) => {
            select.value = "";
        }
    );

    loadCompanies();
}

/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeCompaniesPage() {

    const isCompaniesPage =
        window.location.pathname
            .toLowerCase()
            .includes("companies.html");

    if (!isCompaniesPage) {
        return;
    }

    readCompanyParameters();

    initializeCompanySearchForm();

    initializeCompanyIndustryFilter();

    loadCompanies();
}

/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCompaniesPage
    );

} else {

    initializeCompaniesPage();
}
