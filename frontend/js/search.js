/*
=========================================================
JOBBOARD SEARCH PAGE
=========================================================
*/

(function () {

    "use strict";


    async function performSearch() {

        const container =
            document.getElementById(
                "jobResults"
            );


        const count =
            document.getElementById(
                "search-count"
            );


        if (!container) {
            return;
        }


        const keyword =
            document.getElementById(
                "keyword"
            )?.value.trim() || "";


        const location =
            document.getElementById(
                "location"
            )?.value.trim() || "";


        if (!keyword && !location) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Search for a job
                    </h3>

                    <p>
                        Enter a keyword or location
                        to find opportunities.
                    </p>

                </div>

            `;

            if (count) {
                count.textContent = "";
            }

            return;
        }


        window.JobBoardUI.showLoading(
            container,
            "Searching live jobs..."
        );


        try {

            const response =
                await window.JobBoardAPI.searchJobs({

                    keyword,

                    location,

                    page: 1,

                    limit: 20

                });


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
                    `${total} result${
                        total === 1
                        ? ""
                        : "s"
                    }`;

            }


            window.JobBoardUI.renderJobGrid(
                container,
                jobs
            );


        } catch (error) {

            console.error(
                "Search error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Search failed."
            );

        }

    }


    function loadSearchFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const keyword =
            params.get("keyword");


        const location =
            params.get("location");


        if (keyword !== null) {

            const input =
                document.getElementById(
                    "keyword"
                );

            if (input) {
                input.value = keyword;
            }

        }


        if (location !== null) {

            const input =
                document.getElementById(
                    "location"
                );

            if (input) {
                input.value = location;
            }

        }

    }


    function setupSearchForm() {

        const form =
            document.getElementById(
                "search-form"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                performSearch();

            }
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadSearchFromURL();

            setupSearchForm();

            const params =
                new URLSearchParams(
                    window.location.search
                );


            if (
                params.get("keyword") ||
                params.get("location")
            ) {

                performSearch();

            }

        }
    );


    window.JobBoardSearch = {

        performSearch

    };

})();
