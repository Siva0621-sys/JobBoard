/*
=========================================================
JOBBOARD JOBS PAGE
=========================================================
*/

(function () {

    "use strict";


    let currentPage = 1;

    const pageLimit = 12;


    function getFilters() {

        return {

            keyword:
                document.getElementById(
                    "jobs-keyword"
                )?.value.trim() || "",

            location:
                document.getElementById(
                    "jobs-location"
                )?.value.trim() || "",

            category:
                document.getElementById(
                    "jobs-category"
                )?.value.trim() || "",

            job_type:
                document.getElementById(
                    "jobs-type"
                )?.value || "",

            work_mode:
                document.getElementById(
                    "jobs-mode"
                )?.value || "",

            page: currentPage,

            limit: pageLimit

        };

    }


    function renderPagination(total) {

        const container =
            document.getElementById(
                "jobs-pagination"
            );


        if (!container) {
            return;
        }


        const totalPages =
            Math.ceil(total / pageLimit);


        if (totalPages <= 1) {

            container.innerHTML = "";

            return;

        }


        let html = "";


        if (currentPage > 1) {

            html += `

                <button
                    type="button"
                    data-page="${currentPage - 1}"
                >
                    ←
                </button>

            `;

        }


        const start =
            Math.max(1, currentPage - 2);

        const end =
            Math.min(
                totalPages,
                currentPage + 2
            );


        for (
            let page = start;
            page <= end;
            page++
        ) {

            html += `

                <button
                    type="button"
                    class="${
                        page === currentPage
                        ? "active"
                        : ""
                    }"
                    data-page="${page}"
                >
                    ${page}
                </button>

            `;

        }


        if (currentPage < totalPages) {

            html += `

                <button
                    type="button"
                    data-page="${currentPage + 1}"
                >
                    →
                </button>

            `;

        }


        container.innerHTML = html;


        container
            .querySelectorAll("button")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        currentPage =
                            Number(
                                button.dataset.page
                            );

                        loadJobs();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );

            });

    }


    async function loadJobs() {

        const container =
            document.getElementById(
                "jobsContainer"
            );


        const count =
            document.getElementById(
                "jobs-count"
            );


        if (!container) {
            return;
        }


        if (!window.JobBoardAPI) {

            window.JobBoardUI.showError(
                container,
                "JobBoard API client is unavailable."
            );

            return;
        }


        window.JobBoardUI.showLoading(
            container,
            "Loading jobs..."
        );


        try {

            const response =
                await window.JobBoardAPI.getJobs(
                    getFilters()
                );


            const jobs =
                window.JobBoardAPI.normalizeList(
                    response
                );


            const total =
                Number(
                    response?.total ?? jobs.length
                );


            if (count) {

                count.textContent =
                    `${total} job${
                        total === 1
                        ? ""
                        : "s"
                    }`;

            }


            window.JobBoardUI.renderJobGrid(
                container,
                jobs
            );


            renderPagination(total);


        } catch (error) {

            console.error(
                "Jobs loading error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Unable to load jobs."
            );

        }

    }


    function setupFilters() {

        const form =
            document.getElementById(
                "jobs-filter-form"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                currentPage = 1;

                loadJobs();

            }
        );

    }


    function loadFiltersFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const mappings = {

            keyword: "jobs-keyword",

            location: "jobs-location",

            category: "jobs-category",

            job_type: "jobs-type",

            work_mode: "jobs-mode"

        };


        Object.entries(mappings)
            .forEach(function ([key, id]) {

                const value =
                    params.get(key);


                const element =
                    document.getElementById(id);


                if (
                    value !== null &&
                    element
                ) {

                    element.value = value;

                }

            });

    }


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadFiltersFromURL();

            setupFilters();

            loadJobs();

        }
    );


    window.JobBoardJobs = {

        loadJobs

    };

})();
