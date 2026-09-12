/*
=========================================================
JOBBOARD JOB DETAILS PAGE
=========================================================
*/

(function () {

    "use strict";


    function getJobId() {

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


    function formatDate(value) {

        if (!value) {
            return "Not specified";
        }


        const date =
            new Date(value);


        if (Number.isNaN(date.getTime())) {
            return String(value);
        }


        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    }


    function renderJob(job, container) {

        const escape =
            window.JobBoardUI.escapeHTML;


        const title =
            job?.title ||
            "Job opportunity";


        const company =
            job?.company_name ||
            job?.company ||
            "Company not specified";


        const location =
            job?.location ||
            [job?.city, job?.state, job?.country]
                .filter(Boolean)
                .join(", ") ||
            "Location not specified";


        const workMode =
            job?.work_mode ||
            "Not specified";


        const jobType =
            job?.job_type ||
            "Not specified";


        const category =
            job?.category_name ||
            job?.category ||
            "General";


        const description =
            job?.description ||
            "No description available.";


        const responsibilities =
            job?.responsibilities ||
            "";


        const requirements =
            job?.requirements ||
            "";


        const skills =
            Array.isArray(job?.skills)
                ? job.skills
                : typeof job?.skills === "string"
                    ? job.skills
                        .split(",")
                        .map(item => item.trim())
                        .filter(Boolean)
                    : [];


        const applyUrl =
            job?.apply_url ||
            job?.application_url ||
            job?.source_url ||
            "#";


        const salaryMin =
            job?.salary_min;


        const salaryMax =
            job?.salary_max;


        let salary = "Salary not specified";


        if (
            salaryMin !== null &&
            salaryMin !== undefined &&
            salaryMin !== ""
        ) {

            if (
                salaryMax !== null &&
                salaryMax !== undefined &&
                salaryMax !== ""
            ) {

                salary =
                    `${salaryMin} - ${salaryMax}`;

            } else {

                salary =
                    `${salaryMin}+`;

            }

        }


        const source =
            job?.source ||
            "Job source";


        container.innerHTML = `

            <article class="job-detail-card">

                <div class="job-detail-header">

                    <div>

                        <span class="badge">
                            ${escape(category)}
                        </span>

                        <h1>
                            ${escape(title)}
                        </h1>

                        <p class="job-detail-company">
                            ${escape(company)}
                        </p>

                    </div>


                    <a
                        class="button button-primary"
                        href="${escape(applyUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Apply on source
                    </a>

                </div>


                <div class="job-detail-meta">

                    <span>
                        📍 ${escape(location)}
                    </span>

                    <span>
                        💼 ${escape(jobType)}
                    </span>

                    <span>
                        🏠 ${escape(workMode)}
                    </span>

                    <span>
                        💰 ${escape(salary)}
                    </span>

                </div>


                <div class="job-detail-body">

                    <section class="detail-section">

                        <h2>
                            Job description
                        </h2>

                        <div class="detail-text">
                            ${escape(description)}
                        </div>

                    </section>


                    ${
                        responsibilities
                            ? `
                                <section class="detail-section">

                                    <h2>
                                        Responsibilities
                                    </h2>

                                    <div class="detail-text">
                                        ${escape(responsibilities)}
                                    </div>

                                </section>
                              `
                            : ""
                    }


                    ${
                        requirements
                            ? `
                                <section class="detail-section">

                                    <h2>
                                        Requirements
                                    </h2>

                                    <div class="detail-text">
                                        ${escape(requirements)}
                                    </div>

                                </section>
                              `
                            : ""
                    }


                    ${
                        skills.length
                            ? `

                                <section class="detail-section">

                                    <h2>
                                        Skills
                                    </h2>

                                    <div class="skill-list">

                                        ${
                                            skills.map(function (skill) {

                                                return `
                                                    <span class="skill-badge">
                                                        ${escape(skill)}
                                                    </span>
                                                `;

                                            }).join("")
                                        }

                                    </div>

                                </section>

                              `
                            : ""
                    }


                    <section class="detail-section">

                        <h2>
                            Job information
                        </h2>

                        <dl class="detail-list">

                            <div>
                                <dt>Source</dt>
                                <dd>${escape(source)}</dd>
                            </div>

                            <div>
                                <dt>Published</dt>
                                <dd>
                                    ${escape(
                                        formatDate(job?.published_at)
                                    )}
                                </dd>
                            </div>

                        </dl>

                    </section>

                </div>

            </article>

        `;

    }


    async function loadJobDetails() {

        const container =
            document.getElementById("jobDetails");


        if (!container) {
            return;
        }


        const jobId =
            getJobId();


        if (!jobId) {

            window.JobBoardUI.showError(
                container,
                "No job was selected."
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
            "Loading job details..."
        );


        try {

            const response =
                await window.JobBoardAPI.getJob(
                    jobId
                );


            const job =
                response?.data ||
                response?.job ||
                null;


            if (!job) {

                window.JobBoardUI.showError(
                    container,
                    "Job not found."
                );

                return;
            }


            renderJob(
                job,
                container
            );


        } catch (error) {

            console.error(
                "Job details error:",
                error
            );


            window.JobBoardUI.showError(
                container,
                error.message ||
                "Unable to load job details."
            );

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        loadJobDetails
    );


    window.JobBoardJobDetails = {
        loadJobDetails
    };


})();
