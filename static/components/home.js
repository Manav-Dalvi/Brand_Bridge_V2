export default {
    template: `
    <div id='main-content' class="container col-md-11" style="margin-left: 90px;">
        <div v-if="loading">Loading...</div>
        <div v-else>
            <div v-for="campaign in campaigns" :key="campaign.id" class="media content-section">
                <div class="d-flex align-items-center">
                    <img :src="getImageSource(campaign.owner)" class="rounded-circle article-img" />
                    <div class="ml-3">
                        <h4><router-link class="nav-item nav-link" :to="getOwnerLink(campaign.owner)"> {{ getOwnerName(campaign.owner) }} </router-link></h4>
                        <small class="text-muted">{{ formatDate(campaign.date_posted) }}</small>
                    </div>
                </div>
                <div class="media-body mt-3">
                    <h4><router-link class="nav-item nav-link" :to="'/campaign/' + campaign.id"> {{ campaign.title }} </router-link></h4>
                    <hr>
                    <p class="article-content"><b>Description:</b></p>
                    <p class="article-content">{{ campaign.desc }}</p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userRole: this.getUserRole(),
            campaigns: [],
            loading: true
        };
    },
    methods: {
        getUserRole() {
            const role = localStorage.getItem('user-role');
            return role ? role : 'Visitor'; // Default to 'Visitor'
        },
        async fetchCampaigns() {
            try {
                const response = await fetch('/api/campaigns');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched campaigns:', data);  // Log the fetched data
                this.campaigns = data;
                this.loading = false;
            } catch (error) {
                console.error('An error occurred while fetching campaigns:', error);
                this.loading = false;
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        getImageSource(owner) {
            return owner && owner.image_file ? `/static/profile_pics/${owner.image_file}` : '/static/profile_pics/default_company.png';
        },
        getOwnerLink(owner) {
            return owner ? `/sponsor_campaigns/${owner.id}` : '#';
        },
        getOwnerName(owner) {
            return owner ? owner.company_name : 'Unknown';
        }
    },
    created() {
        this.fetchCampaigns();
    }
}
