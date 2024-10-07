export default {
    template: `
        <div>
            <h1 style="margin-left: 90px;">Search Results for "{{ query }}"</h1>
            <div v-if="results.length > 0" class="media list" style="margin-left: 90px;">
                <div v-for="item in results" :key="item.id" class="media content-section">
                    <router-link :to="getLink(item)" class="media-body">{{ getTitle(item) }}</router-link>
                </div>
            </div>
            <p v-else>No {{ type.toLowerCase() }} found matching "{{ query }}".</p>
        </div>
    `,
    data() {
        return {
            results: [],
            query: '',
            type: ''
        };
    },
    methods: {
        getLink(item) {
            switch (this.type) {
                case 'sponsors':
                    return `/sponsor_campaigns/${item.id}`;
                case 'influencers':
                    return `/influencer_profile/${item.id}`;
                case 'campaigns':
                    return `/campaign/${item.id}`;
                default:
                    return '#';
            }
        },
        getTitle(item) {
            switch (this.type) {
                case 'sponsors':
                    return item.company_name;
                case 'influencers':
                    return item.name;
                case 'campaigns':
                    return item.title;
                default:
                    return '';
            }
        }
    },
    created() {
        const queryParams = new URLSearchParams(this.$route.query);
        this.query = queryParams.get('query');
        this.type = this.$route.params.type;
        const results = JSON.parse(queryParams.get('results') || '{}');
        this.results = results[this.type] || [];
        console.log('Query:', this.query);
        console.log('Type:', this.type);
        console.log('Results:', this.results);
    }
};
