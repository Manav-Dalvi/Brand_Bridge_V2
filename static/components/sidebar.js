export default {
    template: `
        <div class="col-md-7">  <!-- Sidebar 150px from the right edge -->
            <div class="content-section">
                <h3>Highlights</h3>
                <div class="highlight-section">
                    <form @submit.prevent="search('influencers')" class="form-inline highlight-form">
                        <input v-model="searchQuery.influencers" class="form-control highlight-input" type="search" placeholder="Search Influencers" aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
                <div class="highlight-section">
                    <form @submit.prevent="search('sponsors')" class="form-inline highlight-form">
                        <input v-model="searchQuery.sponsors" class="form-control highlight-input" type="search" placeholder="Look for Sponsors" aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
                <div class="highlight-section">
                    <form @submit.prevent="search('campaigns')" class="form-inline highlight-form">
                        <input v-model="searchQuery.campaigns" class="form-control highlight-input" type="search" placeholder="Explore Campaigns" aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: {
                influencers: '',
                sponsors: '',
                campaigns: ''
            }
        };
    },
    methods: {
        async search(type) {
            try {
                const query = this.searchQuery[type];
                if (!query) return;

                const url = `/api/search?query=${encodeURIComponent(query)}`;
                
                const response = await fetch(url);
                const results = await response.json();

                // Redirect or update view with results
                this.$router.push({ path: `/search_results/${type}`, query: { results: JSON.stringify(results), query } });
            } catch (error) {
                console.error('Error performing search:', error);
            }
        }
    }
};
