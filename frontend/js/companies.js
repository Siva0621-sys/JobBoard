/*
=========================================================
JOBBOARD COMPANIES PAGE
=========================================================
*/

(function () {

    "use strict";


    async function loadCompanies() {

        const container =
            document.getElementById("companiesContainer");

        const count =
            document.getElementById("companies-count");


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
            "Loading companies..."
        );


        try {

            const response =
                await window.JobBoardAPI.getCompanies();


            const companies =
                window.JobBoardAPI.normalizeList(response);


            if (count) {

                count.textContent =
                    `${companies.length} compan${

                        companies.length === 1
                            ? "y"
                            : "ies"

                    }`;

            }


            if (companies.length === 0) {

                container.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            ◼
                        </div>

                        <h3>
                            No companies available yet
                        </h3>

                        <p>
                            Company information will appear
                            when available from live job sources.
                        </p>

                        <a
                            href="jobs.html"
                            class="button button-primary"
                        >
                            Browse Jobs
                        </a>

                    </div>

                `;

                return;
            }


            container.innerHTML =
                companies.map(function (company) {

                    const id =
                        company?.id || "";

                    const name =
                        company?.name ||
                        company?.company_name ||
                        "Company";


                    const logo =
                        company?.logo ||
                        company?.company_logo ||
                        company?.logo_url ||
                        "";


                    return `

                        <article class="company-card">

                            <div class="company-card-logo">

                                ${
                                    logo
                                        ? `
                                            <img
                                                src="${window.JobBoardUI.escapeHTML(logo)}"
                                                alt="${window.JobBoardUI.escapeHTML(name)}"
                                            >
                                          `
                                        : `
                                            <span>
                                                ${window.JobBoardUI.escapeHTML(
                                                    name.charAt(0).toUpperCase()
                                                )}
                                            </span>
                                          `
                                }

                            </div>


                            <div class="company-card-content">

                                <h3>
                                    ${window.JobBoardUI.escapeHTML(name)}
                                </h3>

                                ${
                                    company?.industry
                                        ? `
                                            <p>
                                                ${window.JobBoardUI.escapeHTML(
                                                    company.industry
                                                )}
                                            </p>
                                          `
                                        : ""
                                }


                                <a
                                    class="text-link"
                                    href="company-details.html?id=${encodeURIComponent(id)}"
                                >
                                    View company
                                </a>

                            </div>

                        </article>

                    `;

                }).join("");


        } catch (error) {

            console.error(
                "Companies error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Unable to load companies."
            );

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        loadCompanies
    );


    window.JobBoardCompanies = {
        loadCompanies
    };


})();
