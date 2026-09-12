/* =========================================================
   JOBBOARD — JOB DETAILS PAGE
   ========================================================= */

"use strict";


/* =========================================================
   STATE
   ========================================================= */

const jobDetailsState = {
    jobId: "",
    job: null,
    loading: false
};


/* =========================================================
   DOM HELPER
   ========================================================= */

function jobDetailsElement(selector) {
    return document.querySelector(selector);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeJobDetailsHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}


/* =========================================================
   STRIP HTML
   ========================================================= */

function stripJobDetailsHtml(value) {

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
   READ JOB ID
   ========================================================= */

function readJobId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("id") ||
        params.get("job_id") ||
        params.get("jobId") ||
        ""
    );
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatJobDetailsDate(value) {

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


/* =========================================================
   FORMAT SALARY
   ========================================================= */

function formatJobDetailsSalary(job) {

    const salary =
        job.salary ||
        job.salary_text ||
        job.salary_range ||
        "";

    if (salary) {
        return salary;
    }

    const minimum =
        job.salary_min ??
        job.min_salary;

    const maximum =
        job.salary_max ??
        job.max_salary;

    const currency =
        job.salary_currency ||
        job.currency ||
        "INR";

    if (
        minimum === null ||
        minimum === undefined
    ) {
        return "";
    }

    const formatter =
        new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 0
            }
        );

    if (
        maximum !== null &&
        maximum !== undefined
    ) {
        return `${formatter.format(minimum)} - ${formatter.format(maximum)}`;
    }

    return formatter.format(minimum);
}


/* =========================================================
   FORMAT JOB TYPE
   ========================================================= */

function formatJobDetailsType(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


/* =========================================================
   NORMALIZE JOB
   ========================================================= */

function normalizeJobDetails(job) {

    if (!job) {
        return null;
    }

    return {
        ...job,

        id:
            job.id ??
            job.job_id ??
            job.external_id ??
            "",

        title:
            job.title ||
            job.job_title ||
            "Untitled job",

        company:
            job.company ||
            job.company_name ||
            job.employer_name ||
            "Company not specified",

        location:
            job.location ||
            job.city ||
            job.job_location ||
            "Location not specified",

        description:
            job.description ||
            job.job_description ||
            job.summary ||
            "No job description available.",

        posted_at:
            job.posted_at ||
            job.created_at ||
            job.date_posted ||
            job.published_at,

        job_type:
            job.job_type ||
            job.employment_type ||
            job.type,

        work_mode:
            job.work_mode ||
            job.remote_type ||
            job.remote,

        category:
            job.category ||
            job.category_name,

        company_logo:
            job.company_logo ||
            job.logo_url ||
            job.company_logo_url,

        apply_url:
            job.apply_url ||
            job.application_url ||
            job.url ||
            job.job_url,

        source:
            job.source ||
            job.source_name,

        skills:
            Array.isArray(job.skills)
                ? job.skills
                : [],

        responsibilities:
            Array.isArray(job.responsibilities)
                ? job.responsibilities
                : [],

        requirements:
            Array.isArray(job.requirements)
                ? job.requirements
                : []
    };
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showJobDetailsLoading() {

    const container =
        jobDetailsElement(
            "#jobDetails, #jobDetailsContainer, #jobDetailsContent"
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
                Loading job details...
            </p>

        </div>
    `;
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showJobDetailsError(message) {

    const container =
        jobDetailsElement(
            "#jobDetails, #jobDetailsContainer, #jobDetailsContent"
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
                Unable to load this job
            </h2>

            <p>
                ${escapeJobDetailsHtml(
                    message ||
                    "The job details could not be loaded."
                )}
            </p>

            <div class="error-state-actions">

                <button
                    type="button"
                    class="button button-primary"
                    id="retryJobDetails"
                >
                    Try again
                </button>

                <a
                    href="jobs.html"
                    class="button button-secondary"
                >
                    Browse jobs
                </a>

            </div>

        </div>
    `;

    jobDetailsElement(
        "#retryJobDetails"
    )?.addEventListener(
        "click",
        loadJobDetails
    );
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showJobDetailsEmpty() {

    const container =
        jobDetailsElement(
            "#jobDetails, #jobDetailsContainer, #jobDetailsContent"
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
                🔎
            </div>

            <h2>
                Job not found
            </h2>

            <p>
                This job may have been removed or is no longer available.
            </p>

            <a
                href="jobs.html"
                class="button button-primary"
            >
                Browse available jobs
            </a>

        </div>
    `;
}


/* =========================================================
   JOB LOGO
   ========================================================= */

function getJobDetailsLogo(job) {

    const company =
        job.company ||
        "Company";

    if (job.company_logo) {

        return `
            <img
                src="${escapeJobDetailsHtml(
                    job.company_logo
                )}"
                alt="${escapeJobDetailsHtml(
                    company
                )} logo"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span
                class="company-logo-fallback"
                aria-hidden="true"
                style="display:none;"
            >
                ${escapeJobDetailsHtml(
                    company.charAt(0).toUpperCase()
                )}
            </span>
        `;
    }

    return `
        <span
            class="company-logo-fallback"
            aria-hidden="true"
        >
            ${escapeJobDetailsHtml(
                company.charAt(0).toUpperCase()
            )}
        </span>
    `;
}


/* =========================================================
   DETAIL SECTION
   ========================================================= */

function renderDetailSection(title, content) {

    if (!content) {
        return "";
    }

    return `
        <section class="job-detail-section">

            <h2>
                ${escapeJobDetailsHtml(title)}
            </h2>

            <div class="job-detail-section-content">
                ${content}
            </div>

        </section>
    `;
}


/* =========================================================
   DESCRIPTION CONTENT
   ========================================================= */

function renderDescription(description) {

    const cleanDescription =
        String(description || "")
            .trim();

    if (!cleanDescription) {
        return `
            <p>
                No description available.
            </p>
        `;
    }

    if (/<[a-z][\s\S]*>/i.test(cleanDescription)) {
        return cleanDescription;
    }

    return cleanDescription
        .split(/\n{2,}/)
        .map((paragraph) => {

            const text =
                escapeJobDetailsHtml(
                    paragraph
                ).replace(/\n/g, "<br>");

            return `<p>${text}</p>`;
        })
        .join("");
}


/* =========================================================
   LIST CONTENT
   ========================================================= */

function renderDetailList(items) {

    if (
        !Array.isArray(items) ||
        !items.length
    ) {
        return "";
    }

    return `
        <ul class="job-detail-list">

            ${items.map((item) => `
                <li>
                    ${escapeJobDetailsHtml(
                        typeof item === "string"
                            ? item
                            : item.text ||
                              item.description ||
                              ""
                    )}
                </li>
            `).join("")}

        </ul>
    `;
}


/* =========================================================
   SKILLS CONTENT
   ========================================================= */

function renderJobSkills(skills) {

    if (
        !Array.isArray(skills) ||
        !skills.length
    ) {
        return "";
    }

    return `
        <div class="job-card-tags">

            ${skills.map((skill) => `
                <span class="tag">
                    ${escapeJobDetailsHtml(
                        typeof skill === "string"
                            ? skill
                            : skill.name ||
                              skill.skill_name ||
                              ""
                    )}
                </span>
            `).join("")}

        </div>
    `;
}


/* =========================================================
   RENDER JOB DETAILS
   ========================================================= */

function renderJobDetails(job) {

    const container =
        jobDetailsElement(
            "#jobDetails, #jobDetailsContainer, #jobDetailsContent"
        );

    if (!container) {
        return;
    }

    const salary =
        formatJobDetailsSalary(job);

    const jobType =
        formatJobDetailsType(
            job.job_type
        );

    const workMode =
        formatJobDetailsType(
            job.work_mode
        );

    const category =
        job.category
            ? formatJobDetailsType(
                job.category
            )
            : "";

    const postedDate =
        formatJobDetailsDate(
            job.posted_at
        );

    const description =
        renderDescription(
            job.description
        );

    const requirements =
        renderDetailList(
            job.requirements
        );

    const responsibilities =
        renderDetailList(
            job.responsibilities
        );

    const skills =
        renderJobSkills(
            job.skills
        );

    const applyUrl =
        job.apply_url || "";

    container.innerHTML = `

        <article class="job-detail-page">

            <header class="job-detail-header">

                <div class="job-detail-company-logo">
                    ${getJobDetailsLogo(job)}
                </div>

                <div class="job-detail-heading">

                    <p class="job-detail-company">
                        ${escapeJobDetailsHtml(
                            job.company
                        )}
                    </p>

                    <h1 class="job-detail-title">
                        ${escapeJobDetailsHtml(
                            job.title
                        )}
                    </h1>

                    <div class="job-detail-meta">

                        <span>
                            📍
                            ${escapeJobDetailsHtml(
                                job.location
                            )}
                        </span>

                        <span>
                            🗓️
                            Posted ${escapeJobDetailsHtml(
                                postedDate
                            )}
                        </span>

                        ${
                            job.source
                                ? `
                                    <span>
                                        Source:
                                        ${escapeJobDetailsHtml(
                                            job.source
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    <div class="job-card-tags">

                        ${
                            jobType
                                ? `
                                    <span class="tag tag-primary">
                                        ${escapeJobDetailsHtml(
                                            jobType
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        ${
                            workMode
                                ? `
                                    <span class="tag tag-success">
                                        ${escapeJobDetailsHtml(
                                            workMode
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        ${
                            category
                                ? `
                                    <span class="tag">
                                        ${escapeJobDetailsHtml(
                                            category
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

                <div class="job-detail-actions">

                    ${
                        applyUrl
                            ? `
                                <a
                                    class="button button-primary"
                                    href="${escapeJobDetailsHtml(
                                        applyUrl
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Apply now ↗
                                </a>
                            `
                            : `
                                <span class="button button-secondary">
                                    Application link unavailable
                                </span>
                            `
                    }

                    <button
                        type="button"
                        class="bookmark-button"
                        id="jobDetailsBookmark"
                        aria-label="Save this job"
                        aria-pressed="false"
                    >
                        ♡
                    </button>

                </div>

            </header>

            <div class="job-detail-layout">

                <div class="job-detail-main">

                    ${renderDetailSection(
                        "Job description",
                        description
                    )}

                    ${renderDetailSection(
                        "Responsibilities",
                        responsibilities
                    )}

                    ${renderDetailSection(
                        "Requirements",
                        requirements
                    )}

                    ${renderDetailSection(
                        "Skills",
                        skills
                    )}

                </div>

                <aside class="job-detail-sidebar">

                    ${
                        salary
                            ? `
                                <div class="job-detail-sidebar-card">

                                    <h3>
                                        Salary
                                    </h3>

                                    <p class="job-detail-salary">
                                        ${escapeJobDetailsHtml(
                                            salary
                                        )}
                                    </p>

                                </div>
                            `
                            : ""
                    }

                    <div class="job-detail-sidebar-card">

                        <h3>
                            Job information
                        </h3>

                        <div class="job-detail-info-list">

                            <div class="info-item">
                                <span>Company</span>
                                <strong>
                                    ${escapeJobDetailsHtml(
                                        job.company
                                    )}
                                </strong>
                            </div>

                            <div class="info-item">
                                <span>Location</span>
                                <strong>
                                    ${escapeJobDetailsHtml(
                                        job.location
                                    )}
                                </strong>
                            </div>

                            ${
                                jobType
                                    ? `
                                        <div class="info-item">
                                            <span>Employment type</span>
                                            <strong>
                                                ${escapeJobDetailsHtml(
                                                    jobType
                                                )}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                workMode
                                    ? `
                                        <div class="info-item">
                                            <span>Work mode</span>
                                            <strong>
                                                ${escapeJobDetailsHtml(
                                                    workMode
                                                )}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                category
                                    ? `
                                        <div class="info-item">
                                            <span>Category</span>
                                            <strong>
                                                ${escapeJobDetailsHtml(
                                                    category
                                                )}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                            <div class="info-item">
                                <span>Posted</span>
                                <strong>
                                    ${escapeJobDetailsHtml(
                                        postedDate
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>

                    ${
                        applyUrl
                            ? `
                                <div class="job-detail-sidebar-card">

                                    <h3>
                                        Interested in this role?
                                    </h3>

                                    <p>
                                        Continue to the original source to complete your application.
                                    </p>

                                    <a
                                        class="button button-primary button-block"
                                        href="${escapeJobDetailsHtml(
                                            applyUrl
                                        )}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Apply on source ↗
                                    </a>

                                </div>
                            `
                            : ""
                    }

                </aside>

            </div>

        </article>
    `;

    initializeJobDetailsBookmark(job);
}


/* =========================================================
   BOOKMARK
   ========================================================= */

function initializeJobDetailsBookmark(job) {

    const button =
        jobDetailsElement(
            "#jobDetailsBookmark"
        );

    if (!button) {
        return;
    }

    const storageKey =
        `jobboard_saved_job_${job.id}`;

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

    updateBookmarkButton(
        button,
        saved
    );

    button.addEventListener(
        "click",
        () => {

            saved = !saved;

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

            updateBookmarkButton(
                button,
                saved
            );
        }
    );
}


function updateBookmarkButton(button, saved) {

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
   LOAD JOB DETAILS
   ========================================================= */

async function loadJobDetails() {

    if (
        !window.JobBoardAPI ||
        !window.JobBoardAPI.jobs
    ) {
        showJobDetailsError(
            "The JobBoard API client is unavailable."
        );

        return;
    }

    if (!jobDetailsState.jobId) {
        showJobDetailsEmpty();

        return;
    }

    if (jobDetailsState.loading) {
        return;
    }

    jobDetailsState.loading = true;

    showJobDetailsLoading();

    try {

        const response =
            await window.JobBoardAPI.jobs.get(
                jobDetailsState.jobId
            );

        const rawJob =
            response?.job ||
            response?.data ||
            response;

        const job =
            normalizeJobDetails(
                rawJob
            );

        if (!job) {
            showJobDetailsEmpty();

            return;
        }

        jobDetailsState.job =
            job;

        renderJobDetails(
            job
        );

        document.title =
            `${job.title} — JobBoard`;

    } catch (error) {

        console.error(
            "Failed to load job details:",
            error
        );

        showJobDetailsError(
            error.message
        );

    } finally {

        jobDetailsState.loading = false;
    }
}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeJobDetailsPage() {

    const isJobDetailsPage =
        window.location.pathname
            .toLowerCase()
            .includes("job-details.html");

    if (!isJobDetailsPage) {
        return;
    }

    jobDetailsState.jobId =
        readJobId();

    loadJobDetails();
}


/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeJobDetailsPage
    );

} else {

    initializeJobDetailsPage();
}
