const API_CONFIG = {
    BASE_URL: "http://127.0.0.1:8000",
    API_PREFIX: "/api/v1"
};

const JobBoardAPI = {
    async request(path, options = {}) {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${path}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        return response.json();
    },

    // Health
    async health() {
        return this.request("/health");
    },

    // Jobs
    async getJobs(params = {}) {
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

        const suffix = query.toString()
            ? `?${query.toString()}`
            : "";

        return this.request(
            `${API_CONFIG.API_PREFIX}/jobs${suffix}`
        );
    },

    async getJob(jobId) {
        return this.request(
            `${API_CONFIG.API_PREFIX}/jobs/${encodeURIComponent(jobId)}`
        );
    },

    // Companies
    async getCompanies() {
        return this.request(
            `${API_CONFIG.API_PREFIX}/companies`
        );
    },

    async getCompany(companyId) {
        return this.request(
            `${API_CONFIG.API_PREFIX}/companies/${encodeURIComponent(companyId)}`
        );
    },

    // Categories
    async getCategories() {
        return this.request(
            `${API_CONFIG.API_PREFIX}/categories`
        );
    },

    // Search
    async searchJobs(params = {}) {
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

        const suffix = query.toString()
            ? `?${query.toString()}`
            : "";

        return this.request(
            `${API_CONFIG.API_PREFIX}/search${suffix}`
        );
    },

    // Trending
    async getTrending() {
        return this.request(
            `${API_CONFIG.API_PREFIX}/trending`
        );
    },

    // Statistics
    async getStats() {
        return this.request(
            `${API_CONFIG.API_PREFIX}/stats`
        );
    }
};

window.JobBoardAPI = JobBoardAPI;
window.API_CONFIG = API_CONFIG;
