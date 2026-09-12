/*
=========================================================
JOBBOARD COMPANY DETAILS PAGE
=========================================================
*/

(function () {

    "use strict";


    function getCompanyId() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return (
            params.get("id") ||
            params.get("company_id") ||
            params.get("companyId") ||
            ""
        );

    }


    function renderCompany(company, container) {

        const escape =
            window.JobBoardUI.escapeHTML;


        const name =
            company?.name ||
            company?.company_name ||
            "Company";


        const logo =
            company?.logo ||
            company?.company_logo ||
            company?.logo_url ||
            "";


        const industry =
            company?.industry ||
            "Industry not specified";


        const description =
            company?.description ||
            "No company description available.";


        const website =
            company?.website ||
            company?.website_url ||
            "";


        container.innerHTML = `

            <article class="company-detail-card">

                <div class="company-detail-header">

                    <div class="company-detail-logo">

                        ${
                            logo
                                ? `
                                    <img
                                        src="${escape(logo)}"
                                        alt="${escape(name)}"
                                    >
                                  `
                                : `
                                    <span>
                                        ${escape(
                                            name.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                  `
                        }

                    </div>


                    <div>

                        <span class="badge">
                            Company
                        </span>

                        <h1>
                            ${escape(name)}
                        </h1>

                        <p>
                            ${escape(industry)}
                        </p>

                    </div>

                </div>


                <div class="company-detail-body">

                    <section class="detail-section">

                        <h2>
                            About the company
                        </h2>

                        <div class="detail-text">
                            ${escape(description)}
                        </div>

                    </section>


                    ${
                        website
                            ? `

                                <section class="detail-section">

                                    <a
                                        class="button button-secondary"
                                        href="${escape(website)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Visit company website
                                    </a>

                                </section>

                              `
                            : ""
                    }


                    <section class="detail-section">

                        <a
                            class="button button-primary"
                            href="jobs.html"
                        >
                            View available jobs
                        </a>

                    </section>

                </div>

            </article>

        `;

    }


    async function loadCompanyDetails() {

        const container =
            document.getElementById(
                "companyDetails"
            );


        if (!container) {
            return;
        }


        const companyId =
            getCompanyId();


        if (!companyId) {

            window.JobBoardUI.showError(
                container,
                "No company was selected."
            );

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
            "Loading company details..."
        );


        try {

            const response =
                await window.JobBoardAPI.getCompany(
                    companyId
                );


            const company =
                response?.data ||
                response?.company ||
                null;


            if (!company) {

                window.JobBoardUI.showError(
                    container,
                    "Company not found."
                );

                return;
            }


            renderCompany(
                company,
                container
            );


        } catch (error) {

            console.error(
                "Company details error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Unable to load company details."
            );

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        loadCompanyDetails
    );


    window.JobBoardCompanyDetails = {
        loadCompanyDetails
    };


})();
