const API_CONFIG = {
    BASE_URL: "https://jobboard-uqze.onrender.com",
    API_PREFIX: "/api/v1"
};


function buildQuery(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            query.set(key, value);
        }

    });

    const result = query.toString();

    return result ? `?${result}` : "";
}


async function request(path, options = {}) {

    const url =
        `${API_CONFIG.BASE_URL}${path}`;

    console.log("JobBoard API:", url);

    const response =
        await fetch(url, {
            ...options,

            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        });


    if (!response.ok) {

        let message =
            `API request failed: ${response.status} ${response.statusText}`;

        try {

            const data =
                await response.json();

            if (data?.detail) {
                message = data.detail;
            }

        } catch (_) {}

        throw new Error(message);
    }


    return response.json();
}


function normalizeList(response) {

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.jobs)) {
        return response.jobs;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    return [];
}


const JobBoardAPI = {

    config: API_CONFIG,

    request,

    normalizeList,


    async health() {

        return request("/health");

    },


    async getJobs(params = {}) {

        return request(
            "/api/v1/jobs" +
            buildQuery(params)
        );

    },


    async getJob(jobId) {

        if (!jobId) {
            throw new Error("Job ID is required.");
        }

        return request(
            "/api/v1/jobs/" +
            encodeURIComponent(jobId)
        );

    },


    async getCompanies() {

        return request(
            "/api/v1/companies"
        );

    },


    async getCompany(companyId) {

        if (!companyId) {
            throw new Error("Company ID is required.");
        }

        return request(
            "/api/v1/companies/" +
            encodeURIComponent(companyId)
        );

    },


    async getCategories() {

        return request(
            "/api/v1/categories"
        );

    },


    async searchJobs(params = {}) {

        return request(
            "/api/v1/search" +
            buildQuery(params)
        );

    },


    async getTrending() {

        return request(
            "/api/v1/trending"
        );

    },


    async getStats() {

        return request(
            "/api/v1/stats"
        );

    }

};


/*
=========================================================
Compatibility API
=========================================================
*/

JobBoardAPI.jobs = {

    list(params = {}) {
        return JobBoardAPI.getJobs(params);
    },

    get(jobId) {
        return JobBoardAPI.getJob(jobId);
    }

};


JobBoardAPI.companies = {

    list(params = {}) {
        return JobBoardAPI.getCompanies(params);
    },

    get(companyId) {
        return JobBoardAPI.getCompany(companyId);
    }

};


JobBoardAPI.categories = {

    list() {
        return JobBoardAPI.getCategories();
    }

};


window.JobBoardAPI = JobBoardAPI;

console.log("JobBoard API client loaded successfully.");
