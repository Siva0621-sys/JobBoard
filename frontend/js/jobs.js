/* =========================================================
   JOBBOARD — JOBS PAGE
   ========================================================= */

"use strict";


/* =========================================================
   STATE
   ========================================================= */

const jobsState = {
    page: 1,
    limit: 12,

    keyword: "",
    location: "",
    category: "",
    jobType: "",
    workMode: "",
    experience: "",
    sort: "latest",

    total: 0,
    loading: false
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function jobsElement(selector) {
    return document.querySelector(selector);
}


/* =========================================================
   READ URL PARAMETERS
   ========================================================= */

function readJobSearchParams() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    jobsState.keyword =
        params.get("keyword") || "";

    jobsState.location =
        params.get("location") || "";

    jobsState.category =
        params.get("category") || "";

    jobsState.jobType =
        params.get("job_type") || "";

    jobsState.workMode =
        params.get("work_mode") || "";

    jobsState.experience =
        params.get("experience") || "";

    jobsState.sort =
        params.get("sort") || "latest";

    const page =
        Number(
            params.get("page") || 1
        );

    jobsState.page =
        Number.isFinite(page) && page > 0
            ? page
            : 1;
}


/* =========================================================
   UPDATE URL
   ========================================================= */

function updateJobSearchUrl() {

    const params =
        new URLSearchParams();

    const values = {
        keyword: jobsState.keyword,
        location: jobsState.location,
        category: jobsState.category,
        job_type: jobsState.jobType,
        work_mode: jobsState.workMode,
        experience: jobsState.experience,
        sort: jobsState.sort,
        page: jobsState.page
    };

    Object.entries(values).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                params.set(
                    key,
                    value
                );
            }
        }
    );

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
   BUILD API PARAMETERS
   ========================================================= */

function buildJobsApiParams() {

    const params = {
        page: jobsState.page,
        limit: jobsState.limit,
        sort: jobsState.sort
    };

    if (jobsState.keyword) {
        params.keyword =
            jobsState.keyword;
    }

    if (jobsState.location) {
        params.location =
            jobsState.location;
    }

    if (jobsState.category) {
        params.category =
            jobsState.category;
    }

    if (jobsState.jobType) {
        params.job_type =
            jobsState.jobType;
    }

    if (jobsState.workMode) {
        params.work_mode =
            jobsState.workMode;
    }

    if (jobsState.experience) {
        params.experience =
            jobsState.experience;
    }

    return params;
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showJobsLoading() {

    const container =
        jobsElement(
            "#jobsContainer, #jobsList, #jobResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>Finding the latest opportunities...</p>
        </div>
    `;
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showJobsEmpty() {

    const container =
        jobsElement(
            "#jobsContainer, #jobsList, #jobResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon" aria-hidden="true">
                🔎
            </div>

            <h3>No jobs found</h3>

            <p>
                Try changing your search terms or filters.
            </p>

            <button
                type="button"
                class="button button-secondary"
                id="clearJobFilters"
            >
                Clear filters
            </button>
        </div>
    `;

    const clearButton =
        jobsElement("#clearJobFilters");

    clearButton?.addEventListener(
        "click",
        clearJobFilters
    );
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showJobsError(message) {

    const container =
        jobsElement(
            "#jobsContainer, #jobsList, #jobResults"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="error-state">
            <div class="error-state-icon" aria-hidden="true">
                !
            </div>

            <h3>Unable to load jobs</h3>

            <p>
                ${escapeJobsHtml(
                    message ||
                    "Something went wrong while loading jobs."
                )}
            </p>

            <button
                type="button"
                class="button button-primary"
                id="retryJobs"
            >
                Try again
            </button>
        </div>
    `;

    jobsElement("#retryJobs")?.addEventListener(
        "click",
        loadJobs
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeJobsHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatJobDate(dateValue) {

    if (!dateValue) {
        return "Recently posted";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Recently posted";
    }

    const now =
        new Date();

    const difference =
        now.getTime() -
        date.getTime();

    const minutes =
        Math.floor(
            difference / 60000
        );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 7) {
        return `${days}d ago`;
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


/* =========================================================
   FORMAT SALARY
   ========================================================= */

function formatJobSalary(job) {

    if (job.salary_display) {
        return job.salary_display;
    }

    const minimum =
        job.salary_min ??
        job.min_salary;

    const maximum =
        job.salary_max ??
        job.max_salary;

    const currency =
        job.currency ||
        "INR";

    if (
        minimum === undefined ||
        minimum === null
    ) {
        return "Salary not disclosed";
    }

    const formatter =
        new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 0
            }
        );

    const symbol =
        currency === "INR"
            ? "₹"
            : currency;

    if (
        maximum !== undefined &&
        maximum !== null
    ) {
        return `${symbol}${formatter.format(
            minimum
        )} – ${symbol}${formatter.format(
            maximum
        )}`;
    }

    return `${symbol}${formatter.format(
        minimum
    )}+`;
}


/* =========================================================
   JOB TYPE LABEL
   ========================================================= */

function formatJobType(value) {

    if (!value) {
        return "";
    }

    const labels = {
        "full-time": "Full-time",
        "full_time": "Full-time",
        "part-time": "Part-time",
        "part_time": "Part-time",
        contract: "Contract",
        internship: "Internship",
        temporary: "Temporary"
    };

    return labels[value] ||
        String(value)
            .replace(/[-_]/g, " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
}


/* =========================================================
   WORK MODE LABEL
   ========================================================= */

function formatWorkMode(value) {

    if (!value) {
        return "";
    }

    const labels = {
        remote: "Remote",
        hybrid: "Hybrid",
        onsite: "On-site",
        "on-site": "On-site"
    };

    return labels[value] ||
        String(value)
            .replace(/[-_]/g, " ");
}


/* =========================================================
   COMPANY LOGO
   ========================================================= */

function getCompanyLogo(job) {

    const logo =
        job.company_logo ||
        job.company?.logo ||
        job.logo;

    if (logo) {
        return `
            <img
                src="${escapeJobsHtml(logo)}"
                alt="${escapeJobsHtml(
                    job.company_name ||
                    job.company?.name ||
                    "Company"
                )}"
                loading="lazy"
            >
        `;
    }

    const companyName =
        job.company_name ||
        job.company?.name ||
        "Company";

    const initial =
        companyName
            .trim()
            .charAt(0)
            .toUpperCase() || "C";

    return `
        <span
            class="company-logo-placeholder"
            aria-hidden="true"
        >
            ${escapeJobsHtml(initial)}
        </span>
    `;
}


/* =========================================================
   JOB CARD
   ========================================================= */

function createJobCard(job) {

    const id =
        job.id ??
        job.job_id ??
        job.external_id ??
        "";

    const title =
        job.title ||
        job.job_title ||
        "Untitled position";

    const company =
        job.company_name ||
        job.company?.name ||
        "Company";

    const location =
        job.location ||
        job.location_name ||
        job.city ||
        "Location not specified";

    const description =
        job.description ||
        job.summary ||
        "View the full job description for more details.";

    const jobType =
        formatJobType(
            job.job_type ||
            job.type
        );

    const workMode =
        formatWorkMode(
            job.work_mode ||
            job.workMode
        );

    const source =
        job.source ||
        job.provider ||
        "";

    const applicationUrl =
        job.apply_url ||
        job.application_url ||
        job.url ||
        "#";

    const tags =
        Array.isArray(job.skills)
            ? job.skills.slice(0, 4)
            : Array.isArray(job.tags)
                ? job.tags.slice(0, 4)
                : [];

    const safeId =
        escapeJobsHtml(id);

    return `
        <article
            class="job-card"
            data-job-id="${safeId}"
        >

            <div class="job-card-top">

                <div class="job-company-logo">
                    ${getCompanyLogo(job)}
                </div>

                <button
                    type="button"
                    class="bookmark-button"
                    aria-label="Save ${escapeJobsHtml(title)}"
                    aria-pressed="false"
                    title="Save job"
                >
                    ♡
                </button>

            </div>

            <div class="job-card-content">

                <h3 class="job-card-title">
                    <a
                        href="job-details.html?id=${encodeURIComponent(id)}"
                    >
                        ${escapeJobsHtml(title)}
                    </a>
                </h3>

                <p class="job-card-company">
                    ${escapeJobsHtml(company)}
                </p>

                <div class="job-card-meta">

                    <span>
                        📍 ${escapeJobsHtml(location)}
                    </span>

                    ${
                        jobType
                            ? `
                                <span>
                                    💼 ${escapeJobsHtml(jobType)}
                                </span>
                            `
                            : ""
                    }

                    ${
                        workMode
                            ? `
                                <span>
                                    🌐 ${escapeJobsHtml(workMode)}
                                </span>
                            `
                            : ""
                    }

                </div>

                <p class="job-card-description">
                    ${escapeJobsHtml(
                        stripJobHtml(description)
                            .slice(0, 145)
                    )}${description.length > 145 ? "..." : ""}
                </p>

                ${
                    tags.length
                        ? `
                            <div class="job-card-tags">
                                ${tags.map(
                                    (tag) => `
                                        <span class="tag">
                                            ${escapeJobsHtml(tag)}
                                        </span>
                                    `
                                ).join("")}
                            </div>
                        `
                        : ""
                }

                <div class="job-card-footer">

                    <span class="salary">
                        ${escapeJobsHtml(
                            formatJobSalary(job)
                        )}
                    </span>

                    <span class="job-posted-time">
                        ${escapeJobsHtml(
                            formatJobDate(
                                job.posted_at ||
                                job.created_at ||
                                job.date_posted
                            )
                        )}
                    </span>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   STRIP HTML
   ========================================================= */

function stripJobHtml(value) {

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
   RENDER JOBS
   ========================================================= */

function renderJobs(response) {

    const container =
        jobsElement(
            "#jobsContainer, #jobsList, #jobResults"
        );

    if (!container) {
        return;
    }

    const jobs =
        window.JobBoardAPI.normalizeList(
            response
        );

    jobsState.total =
        Number(
            response?.total ??
            response?.count ??
            response?.pagination?.total ??
            jobs.length
        );

    if (!jobs.length) {
        showJobsEmpty();
        renderJobsPagination();
        updateJobsResultCount();
        return;
    }

    container.innerHTML =
        jobs.map(
            createJobCard
        ).join("");

    initializeRenderedJobCards();

    renderJobsPagination();

    updateJobsResultCount();
}


/* =========================================================
   INITIALIZE RENDERED CARDS
   ========================================================= */

function initializeRenderedJobCards() {

    jobsElement(
        "#jobsContainer, #jobsList, #jobResults"
    );

    document
        .querySelectorAll(
            ".bookmark-button"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();
                    event.stopPropagation();

                    const saved =
                        button.getAttribute(
                            "aria-pressed"
                        ) === "true";

                    button.setAttribute(
                        "aria-pressed",
                        String(!saved)
                    );

                    button.classList.toggle(
                        "saved",
                        !saved
                    );

                    button.textContent =
                        saved
                            ? "♡"
                            : "♥";
                }
            );
        });
}


/* =========================================================
   LOAD JOBS
   ========================================================= */

async function loadJobs() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.jobs
    ) {
        showJobsError(
            "The JobBoard API client is not available."
        );

        return;
    }

    if (jobsState.loading) {
        return;
    }

    jobsState.loading = true;

    showJobsLoading();

    try {

        const params =
            buildJobsApiParams();

        const response =
            await window.JobBoardAPI.jobs.list(
                params
            );

        renderJobs(response);

    } catch (error) {

        console.error(
            "Failed to load jobs:",
            error
        );

        showJobsError(
            error.message
        );

    } finally {

        jobsState.loading = false;
    }
}


/* =========================================================
   RESULT COUNT
   ========================================================= */

function updateJobsResultCount() {

    const elements =
        $$(".jobs-result-count, #jobsResultCount");

    if (!elements.length) {
        return;
    }

    const total =
        jobsState.total;

    const text =
        total === 1
            ? "1 job found"
            : `${total.toLocaleString()} jobs found`;

    elements.forEach(
        (element) => {
            element.textContent = text;
        }
    );
}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderJobsPagination() {

    const container =
        jobsElement(
            "#jobsPagination, .jobs-pagination"
        );

    if (!container) {
        return;
    }

    const totalPages =
        Math.ceil(
            jobsState.total /
            jobsState.limit
        );

    if (
        totalPages <= 1
    ) {
        container.innerHTML = "";
        return;
    }

    const currentPage =
        jobsState.page;

    let html = "";

    html += `
        <button
            type="button"
            class="pagination-button"
            data-page="${Math.max(
                1,
                currentPage - 1
            )}"
            ${currentPage <= 1 ? "disabled" : ""}
            aria-label="Previous page"
        >
            ←
        </button>
    `;


    const startPage =
        Math.max(
            1,
            currentPage - 2
        );

    const endPage =
        Math.min(
            totalPages,
            currentPage + 2
        );


    if (startPage > 1) {

        html += `
            <button
                type="button"
                class="pagination-button"
                data-page="1"
            >
                1
            </button>
        `;

        if (startPage > 2) {
            html += `
                <span class="pagination-ellipsis">
                    ...
                </span>
            `;
        }
    }


    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        html += `
            <button
                type="button"
                class="pagination-button ${
                    page === currentPage
                        ? "active"
                        : ""
                }"
                data-page="${page}"
                aria-current="${
                    page === currentPage
                        ? "page"
                        : "false"
                }"
            >
                ${page}
            </button>
        `;
    }


    if (endPage < totalPages) {

        if (endPage < totalPages - 1) {
            html += `
                <span class="pagination-ellipsis">
                    ...
                </span>
            `;
        }

        html += `
            <button
                type="button"
                class="pagination-button"
                data-page="${totalPages}"
            >
                ${totalPages}
            </button>
        `;
    }


    html += `
        <button
            type="button"
            class="pagination-button"
            data-page="${Math.min(
                totalPages,
                currentPage + 1
            )}"
            ${currentPage >= totalPages ? "disabled" : ""}
            aria-label="Next page"
        >
            →
        </button>
    `;

    container.innerHTML = html;


    container
        .querySelectorAll(
            "[data-page]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        Number(
                            button.dataset.page
                        );

                    if (
                        !Number.isFinite(page) ||
                        page === jobsState.page
                    ) {
                        return;
                    }

                    jobsState.page =
                        page;

                    updateJobSearchUrl();

                    loadJobs();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );
        });
}


/* =========================================================
   FILTERS
   ========================================================= */

function initializeJobFilters() {

    const filterMap = [
        [
            "#jobCategory",
            "category"
        ],
        [
            "#jobType",
            "jobType"
        ],
        [
            "#workMode",
            "workMode"
        ],
        [
            "#experience",
            "experience"
        ],
        [
            "#jobSort",
            "sort"
        ]
    ];

    filterMap.forEach(
        ([selector, stateKey]) => {

            const element =
                jobsElement(selector);

            if (!element) {
                return;
            }

            element.value =
                jobsState[stateKey] || "";

            element.addEventListener(
                "change",
                () => {

                    jobsState[stateKey] =
                        element.value;

                    jobsState.page =
                        1;

                    updateJobSearchUrl();

                    loadJobs();
                }
            );
        }
    );
}


/* =========================================================
   JOB SEARCH FORM
   ========================================================= */

function initializeJobSearchForm() {

    const form =
        jobsElement(
            "#jobSearchForm, .job-search-form"
        );

    if (!form) {
        return;
    }

    const keyword =
        form.querySelector(
            'input[name="keyword"], input[name="search"]'
        );

    const location =
        form.querySelector(
            'input[name="location"]'
        );


    if (keyword) {
        keyword.value =
            jobsState.keyword;
    }

    if (location) {
        location.value =
            jobsState.location;
    }


    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            jobsState.keyword =
                keyword?.value.trim() || "";

            jobsState.location =
                location?.value.trim() || "";

            jobsState.page = 1;

            updateJobSearchUrl();

            loadJobs();
        }
    );
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearJobFilters() {

    jobsState.page = 1;

    jobsState.keyword = "";
    jobsState.location = "";
    jobsState.category = "";
    jobsState.jobType = "";
    jobsState.workMode = "";
    jobsState.experience = "";
    jobsState.sort = "latest";

    updateJobSearchUrl();

    initializeJobFilterValues();

    loadJobs();
}


/* =========================================================
   RESTORE FILTER VALUES
   ========================================================= */

function initializeJobFilterValues() {

    const values = {
        "#jobCategory": jobsState.category,
        "#jobType": jobsState.jobType,
        "#workMode": jobsState.workMode,
        "#experience": jobsState.experience,
        "#jobSort": jobsState.sort
    };

    Object.entries(values)
        .forEach(([selector, value]) => {

            const element =
                jobsElement(selector);

            if (element) {
                element.value =
                    value || "";
            }
        });


    const keyword =
        jobsElement(
            '#jobSearchForm input[name="keyword"], .job-search-form input[name="keyword"]'
        );

    const location =
        jobsElement(
            '#jobSearchForm input[name="location"], .job-search-form input[name="location"]'
        );

    if (keyword) {
        keyword.value =
            jobsState.keyword;
    }

    if (location) {
        location.value =
            jobsState.location;
    }
}


/* =========================================================
   FILTER CHIPS
   ========================================================= */

function initializeFilterChips() {

    document
        .querySelectorAll(
            ".filter-chip[data-filter]"
        )
        .forEach((chip) => {

            chip.addEventListener(
                "click",
                () => {

                    const filter =
                        chip.dataset.filter;

                    const value =
                        chip.dataset.value || "";

                    if (!filter) {
                        return;
                    }

                    const stateMap = {
                        category: "category",
                        job_type: "jobType",
                        work_mode: "workMode",
                        experience: "experience"
                    };

                    const stateKey =
                        stateMap[filter] ||
                        filter;

                    if (
                        Object.prototype.hasOwnProperty.call(
                            jobsState,
                            stateKey
                        )
                    ) {

                        jobsState[stateKey] =
                            value;

                        jobsState.page =
                            1;

                        updateJobSearchUrl();

                        initializeJobFilterValues();

                        loadJobs();
                    }
                }
            );
        });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeJobsPage() {

    const isJobsPage =
        window.location.pathname
            .toLowerCase()
            .includes("jobs.html");

    if (!isJobsPage) {
        return;
    }

    if (!window.JobBoardAPI) {
        showJobsError(
            "JobBoard API is unavailable."
        );

        return;
    }

    readJobSearchParams();

    initializeJobSearchForm();

    initializeJobFilters();

    initializeFilterChips();

    initializeJobFilterValues();

    loadJobs();
}


/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeJobsPage
    );

} else {

    initializeJobsPage();
}
