/*
=========================================================
JOBBOARD MAIN
Shared header, footer and homepage functionality
=========================================================
*/

(function () {

    "use strict";


    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function createHeader() {

        const header =
            document.getElementById("site-header");

        if (!header) {
            return;
        }


        header.className = "site-header";


        header.innerHTML = `

            <div class="container header-inner">

                <a
                    href="index.html"
                    class="brand"
                    aria-label="JobBoard home"
                >
                    <span class="brand-mark">JB</span>
                    <span>JobBoard</span>
                </a>


                <button
                    type="button"
                    class="menu-toggle"
                    id="menu-toggle"
                    aria-label="Open navigation"
                    aria-expanded="false"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>


                <nav
                    class="main-navigation"
                    id="main-navigation"
                >

                    <a href="index.html">Home</a>

                    <a href="jobs.html">Jobs</a>

                    <a href="categories.html">
                        Categories
                    </a>

                    <a href="companies.html">
                        Companies
                    </a>

                    <a href="search.html">
                        Search
                    </a>

                    <a href="about.html">
                        About
                    </a>

                </nav>

            </div>

        `;


        setupNavigation();

    }


    function setupNavigation() {

        const toggle =
            document.getElementById("menu-toggle");

        const navigation =
            document.getElementById("main-navigation");


        if (!toggle || !navigation) {
            return;
        }


        toggle.addEventListener(
            "click",
            function () {

                const open =
                    navigation.classList.toggle("open");

                toggle.setAttribute(
                    "aria-expanded",
                    String(open)
                );

            }
        );


        const current =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        navigation
            .querySelectorAll("a")
            .forEach(function (link) {

                const href =
                    link.getAttribute("href")
                        .split("/")
                        .pop()
                        .toLowerCase();


                if (
                    href === current ||
                    (
                        current === "" &&
                        href === "index.html"
                    )
                ) {
                    link.classList.add("active");
                }

            });

    }


    function createFooter() {

        const footer =
            document.getElementById("site-footer");

        if (!footer) {
            return;
        }


        footer.className = "site-footer";


        footer.innerHTML = `

            <div class="container footer-inner">

                <div>

                    <div class="footer-brand">
                        JobBoard
                    </div>

                    <p>
                        Discover opportunities from
                        multiple job sources.
                    </p>

                </div>


                <div class="footer-links">

                    <a href="jobs.html">
                        Jobs
                    </a>

                    <a href="categories.html">
                        Categories
                    </a>

                    <a href="companies.html">
                        Companies
                    </a>

                    <a href="about.html">
                        About
                    </a>

                </div>

            </div>

        `;

    }


    function getJobTitle(job) {

        return (
            job?.title ||
            "Untitled position"
        );

    }


    function getCompanyName(job) {

        return (
            job?.company_name ||
            "Company not specified"
        );

    }


    function getLocation(job) {

        return (
            job?.location ||
            job?.city ||
            "Location not specified"
        );

    }


    function getJobUrl(job) {

        if (!job?.id) {
            return "jobs.html";
        }

        return (
            `job-details.html?id=${encodeURIComponent(job.id)}`
        );

    }


    function renderJobCard(job) {

        const title =
            escapeHTML(getJobTitle(job));

        const company =
            escapeHTML(getCompanyName(job));

        const location =
            escapeHTML(getLocation(job));

        const type =
            escapeHTML(
                job?.job_type ||
                "Job"
            );

        const mode =
            escapeHTML(
                job?.work_mode ||
                "Flexible"
            );


        return `

            <article class="job-card">

                <div class="job-card-top">

                    <div>

                        <h3>
                            <a href="${getJobUrl(job)}">
                                ${title}
                            </a>
                        </h3>

                        <p class="job-company">
                            ${company}
                        </p>

                    </div>

                </div>


                <div class="job-meta">

                    <span>
                        ${location}
                    </span>

                    <span>
                        ${type}
                    </span>

                    <span>
                        ${mode}
                    </span>

                </div>


                ${
                    job?.description
                    ?
                    `
                    <p class="job-description">
                        ${escapeHTML(
                            String(job.description)
                                .replace(/<[^>]*>/g, "")
                        )}
                    </p>
                    `
                    :
                    ""
                }


                <div class="job-card-footer">

                    <span class="job-date">
                        ${
                            job?.published_at
                            ?
                            new Date(
                                job.published_at
                            ).toLocaleDateString()
                            :
                            ""
                        }
                    </span>


                    <a
                        href="${getJobUrl(job)}"
                        class="job-apply"
                    >
                        View job →
                    </a>

                </div>

            </article>

        `;

    }


    function renderJobGrid(container, jobs) {

        if (!container) {
            return;
        }


        if (!Array.isArray(jobs) || jobs.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No jobs available
                    </h3>

                    <p>
                        No live opportunities are available
                        right now.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            jobs.map(renderJobCard).join("");

    }


    function showLoading(container, message) {

        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="loading-state">

                <div class="loading-spinner"></div>

                <p>
                    ${escapeHTML(
                        message || "Loading..."
                    )}
                </p>

            </div>

        `;

    }


    function showError(container, message) {

        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="error-state">

                <h3>
                    Something went wrong
                </h3>

                <p>
                    ${escapeHTML(
                        message ||
                        "Unable to load data."
                    )}
                </p>

            </div>

        `;

    }


    async function loadHome() {

        const jobsContainer =
            document.getElementById("home-jobs");

        const categoriesContainer =
            document.getElementById("home-categories");

        const trendingContainer =
            document.getElementById("home-trending");


        const isHome =
            jobsContainer ||
            categoriesContainer ||
            trendingContainer;


        if (!isHome) {
            return;
        }


        if (!window.JobBoardAPI) {

            showError(
                jobsContainer,
                "JobBoard API client is unavailable."
            );

            return;
        }


        if (jobsContainer) {

            showLoading(
                jobsContainer,
                "Loading jobs..."
            );


            try {

                const response =
                    await window.JobBoardAPI.getJobs({
                        page: 1,
                        limit: 6
                    });


                const jobs =
                    window.JobBoardAPI.normalizeList(
                        response
                    );


                renderJobGrid(
                    jobsContainer,
                    jobs
                );

            } catch (error) {

                console.error(
                    "Home jobs error:",
                    error
                );


                showError(
                    jobsContainer,
                    error.message
                );

            }

        }


        if (categoriesContainer) {

            showLoading(
                categoriesContainer,
                "Loading categories..."
            );


            try {

                const response =
                    await window.JobBoardAPI.getCategories();


                const categories =
                    window.JobBoardAPI.normalizeList(
                        response
                    );


                if (categories.length === 0) {

                    categoriesContainer.innerHTML = `

                        <div class="empty-state">

                            <h3>
                                No categories yet
                            </h3>

                            <p>
                                Categories will appear
                                when job data is available.
                            </p>

                        </div>

                    `;

                } else {

                    categoriesContainer.innerHTML =
                        categories
                            .slice(0, 8)
                            .map(function (category) {

                                const name =
                                    escapeHTML(
                                        category?.name ||
                                        category?.category_name ||
                                        "Category"
                                    );


                                const id =
                                    category?.id || "";


                                return `

                                    <a
                                        class="category-card"
                                        href="jobs.html?category=${encodeURIComponent(id)}"
                                    >

                                        <h3>
                                            ${name}
                                        </h3>

                                        <p>
                                            Explore opportunities →
                                        </p>

                                    </a>

                                `;

                            })
                            .join("");

                }

            } catch (error) {

                console.error(
                    "Home categories error:",
                    error
                );


                showError(
                    categoriesContainer,
                    error.message
                );

            }

        }


        if (trendingContainer) {

            showLoading(
                trendingContainer,
                "Loading trends..."
            );


            try {

                const response =
                    await window.JobBoardAPI.getTrending();


                const trends =
                    window.JobBoardAPI.normalizeList(
                        response
                    );


                const jobIds =
                    trends
                        .map(function (item) {
                            return item?.job_id;
                        })
                        .filter(Boolean)
                        .slice(0, 6);


                if (jobIds.length === 0) {

                    trendingContainer.innerHTML = `

                        <div class="empty-state">

                            <h3>
                                No trending jobs yet
                            </h3>

                            <p>
                                Trending opportunities will
                                appear as live data changes.
                            </p>

                        </div>

                    `;

                } else {

                    const jobs =
                        await Promise.all(
                            jobIds.map(function (id) {

                                return window.JobBoardAPI
                                    .getJob(id)
                                    .then(function (response) {
                                        return response?.data;
                                    })
                                    .catch(function () {
                                        return null;
                                    });

                            })
                        );


                    renderJobGrid(
                        trendingContainer,
                        jobs.filter(Boolean)
                    );

                }

            } catch (error) {

                console.error(
                    "Home trends error:",
                    error
                );


                showError(
                    trendingContainer,
                    error.message
                );

            }

        }

    }


    async function loadStats() {

        const jobs =
            document.getElementById("stat-jobs");

        const companies =
            document.getElementById("stat-companies");

        const categories =
            document.getElementById("stat-categories");


        if (
            !jobs &&
            !companies &&
            !categories
        ) {
            return;
        }


        try {

            const response =
                await window.JobBoardAPI.getStats();


            if (jobs) {
                jobs.textContent =
                    response?.total_jobs ?? "0";
            }

            if (companies) {
                companies.textContent =
                    response?.total_companies ?? "0";
            }

            if (categories) {
                categories.textContent =
                    response?.total_categories ?? "0";
            }

        } catch (error) {

            console.error(
                "Statistics error:",
                error
            );

        }

    }


    function setupHomeSearch() {

        const form =
            document.getElementById(
                "home-search-form"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const keyword =
                    document.getElementById(
                        "home-keyword"
                    )?.value.trim() || "";


                const location =
                    document.getElementById(
                        "home-location"
                    )?.value.trim() || "";


                const params =
                    new URLSearchParams();


                if (keyword) {
                    params.set(
                        "keyword",
                        keyword
                    );
                }


                if (location) {
                    params.set(
                        "location",
                        location
                    );
                }


                window.location.href =
                    `search.html?${params.toString()}`;

            }
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            createHeader();

            createFooter();

            setupHomeSearch();

            loadStats();

            loadHome();

        }
    );


    window.JobBoardUI = {

        escapeHTML,

        renderJobCard,

        renderJobGrid,

        showLoading,

        showError

    };

})();
