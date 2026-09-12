document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    const keywordInput = document.getElementById("keyword");
    const locationInput = document.getElementById("location");
    const resultsContainer = document.getElementById("job-results");
    const resultsCount = document.getElementById("results-count");
    const resultsTitle = document.getElementById("results-title");
    const status = document.getElementById("search-status");

    if (!form || !resultsContainer) {
        return;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderJobs(jobs) {
        if (!jobs.length) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No jobs found</h3>
                    <p>Try another keyword or location.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = jobs.map(job => `
            <article class="job-card">

                <div class="job-card-header">
                    ${
                        job.company_logo
                            ? `<img
                                src="${escapeHtml(job.company_logo)}"
                                alt="${escapeHtml(job.company_name || "Company")}"
                                class="company-logo"
                              >`
                            : ""
                    }

                    <div>
                        <h3>
                            ${escapeHtml(job.title || "Untitled Job")}
                        </h3>

                        <p class="company-name">
                            ${escapeHtml(job.company_name || "Company")}
                        </p>
                    </div>
                </div>

                <div class="job-meta">
                    ${
                        job.location
                            ? `<span>${escapeHtml(job.location)}</span>`
                            : ""
                    }

                    ${
                        job.job_type
                            ? `<span>${escapeHtml(job.job_type)}</span>`
                            : ""
                    }

                    ${
                        job.work_mode
                            ? `<span>${escapeHtml(job.work_mode)}</span>`
                            : ""
                    }
                </div>

                <a
                    href="job-details.html?id=${encodeURIComponent(job.id)}"
                    class="btn btn-secondary"
                >
                    View Job
                </a>

            </article>
        `).join("");
    }

    async function performSearch() {
        const keyword = keywordInput.value.trim();
        const location = locationInput.value.trim();

        status.innerHTML = "<p>Searching live jobs...</p>";
        resultsContainer.innerHTML = "";

        try {
            const response = await JobBoardAPI.searchJobs({
                keyword,
                location,
                page: 1,
                limit: 50
            });

            const jobs = response.data || [];

            resultsTitle.textContent =
                keyword || location
                    ? "Search Results"
                    : "Latest Jobs";

            resultsCount.textContent =
                `${response.total || jobs.length} jobs`;

            renderJobs(jobs);

            status.innerHTML = "";

        } catch (error) {
            console.error(error);

            resultsCount.textContent = "";

            status.innerHTML = `
                <div class="error-state">
                    <h3>Unable to load jobs</h3>
                    <p>
                        Make sure the JobBoard API is running.
                    </p>
                </div>
            `;

            resultsContainer.innerHTML = "";
        }
    }

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            performSearch();
        }
    );

    const params = new URLSearchParams(
        window.location.search
    );

    const initialKeyword = params.get("keyword");
    const initialLocation = params.get("location");

    if (initialKeyword) {
        keywordInput.value = initialKeyword;
    }

    if (initialLocation) {
        locationInput.value = initialLocation;
    }

    performSearch();
});
