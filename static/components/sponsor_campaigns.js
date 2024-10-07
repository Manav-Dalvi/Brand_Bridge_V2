export default {
    template: `
    <div class="container col-md-11" style="margin-left: 90px;">
        <h1 class="mb-3">Campaigns by {{ sponsor.company_name }} [Total {{ campaigns.length }} posts]</h1>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <div v-for="campaign in campaigns" :key="campaign.id" class="media content-section">
                <div class="d-flex align-items-center">
                    <img :src="getImageSource(campaign.owner)" class="rounded-circle article-img" />
                    <div class="ml-3">
                        <h4>{{ getOwnerName(campaign.owner) }}</h4>
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
            sponsor: {},
            campaigns: [],
            loading: true
        };
    },
    methods: {
        async fetchSponsorCampaigns() {
            try {
                // Get sponsor_id from route params
                const sponsor_id = this.$route.params.sponsor_id;
                if (!sponsor_id) {
                    throw new Error('Sponsor ID is missing in the route parameters');
                }
                console.log('Sponsor ID:', sponsor_id);

                // Fetch campaigns using the sponsor_id
                const response = await fetch(`/api/sponsor_campaigns/${sponsor_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched sponsor campaigns:', data);  // Log the fetched data

                // Verify and assign sponsor and campaigns
                if (data.sponsor && data.campaigns) {
                    this.sponsor = data.sponsor;
                    this.campaigns = data.campaigns;
                    console.log('Sponsor assigned:', this.sponsor);
                    console.log('Campaigns assigned:', this.campaigns);
                } else {
                    console.error('Invalid data structure:', data);
                }

                this.loading = false;
            } catch (error) {
                console.error('An error occurred while fetching sponsor campaigns:', error);
                this.loading = false;
            }
        },
        getImageSource(owner) {
            return owner && owner.image_file ? `/static/profile_pics/${owner.image_file}` : '/static/profile_pics/default_company.png';
        },
        getOwnerLink(owner) {
            return owner ? `/sponsor_campaigns/${owner.id}` : '#';
        },
        getOwnerName(owner) {
            return owner ? owner.company_name : 'Unknown';
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
    },
    created() {
        console.log("Vue is working!");
        this.fetchSponsorCampaigns();
    }
}
