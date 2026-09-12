/*
=========================================================
JOBBOARD CATEGORIES PAGE
=========================================================
*/

(function () {

    "use strict";


    async function loadCategories() {

        const container =
            document.getElementById(
                "categoriesContainer"
            );


        const count =
            document.getElementById(
                "categories-count"
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
            "Loading categories..."
        );


        try {

            const response =
                await window.JobBoardAPI.getCategories();


            const categories =
                window.JobBoardAPI.normalizeList(
                    response
                );


            if (count) {

                count.textContent =
                    `${categories.length} categor${
                        categories.length === 1
                        ? "y"
                        : "ies"
                    }`;

            }


            if (categories.length === 0) {

                container.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            No categories available
                        </h3>

                        <p>
                            Categories will appear when
                            live job data is available.
                        </p>

                    </div>

                `;

                return;

            }


            container.innerHTML =
                categories
                    .map(function (category) {

                        const id =
                            category?.id || "";


                        const name =
                            category?.name ||
                            category?.category_name ||
                            "Category";


                        return `

                            <a
                                class="category-card"
                                href="jobs.html?category=${encodeURIComponent(id)}"
                            >

                                <h3>
                                    ${window.JobBoardUI
                                        .escapeHTML(name)}
                                </h3>

                                <p>
                                    Explore jobs →
                                </p>

                            </a>

                        `;

                    })
                    .join("");


        } catch (error) {

            console.error(
                "Categories error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Unable to load categories."
            );

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        loadCategories
    );


    window.JobBoardCategories = {

        loadCategories

    };

})();
