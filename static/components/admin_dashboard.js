export default {
    template: `
        <div style="margin-left: 90px;">
            <h1>Admin Dashboard</h1>

            <div class="container mt-4" >
                <h2>Influencers</h2>
                <div v-if="influencers.length">
                    <article v-for="influencer in influencers" :key="influencer.id" class="media content-section">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img class="rounded-circle article-img" :src="getProfileImage(influencer)" alt="Profile Image">
                                <div class="ml-3">
                                    <h4>
                                        <router-link :to="'/influencer_profile/' + influencer.id">{{ influencer.name }}</router-link>
                                    </h4>
                                </div>
                            </div>
                            <button @click="deleteItem('influencers', influencer.id)" class="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </article>
                </div>
                <p v-else>No influencers found.</p>
            </div>

            <div class="container mt-4">
                <h2>Sponsors</h2>
                <div v-if="sponsors.length">
                    <article v-for="sponsor in sponsors" :key="sponsor.id" class="media content-section">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img class="rounded-circle article-img" :src="getProfileImage(sponsor)" alt="Profile Image">
                                <div class="ml-3">
                                    <h4>
                                        <router-link :to="'/sponsor_campaigns/' + sponsor.id">{{ sponsor.company_name }}</router-link>
                                    </h4>
                                </div>
                            </div>
                            <button @click="deleteItem('sponsors', sponsor.id)" class="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </article>
                </div>
                <p v-else>No sponsors found.</p>
            </div>

            <div class="container mt-4">
                <h2>Campaigns</h2>
                <div v-if="campaigns.length">
                    <article v-for="campaign in campaigns" :key="campaign.id" class="media content-section">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex align-items-center">
                                <img class="rounded-circle article-img" :src="getProfileImage(campaign.owner)" alt="Profile Image">
                                <div class="ml-3">
                                    <h4>
                                        <router-link :to="'/campaign/' + campaign.id">{{ campaign.owner.company_name }}</router-link>
                                    </h4>
                                    <small class="text-muted">{{ campaign.date_posted }}</small>
                                </div>
                            </div>
                            <button @click="deleteItem('campaigns', campaign.id)" class="btn btn-danger btn-sm">Delete</button>
                        </div>
                        <div class="media-body mt-3">
                            <h3><router-link :to="'/campaign/' + campaign.id">{{ campaign.title }}</router-link></h3>
                            <hr>
                            <p class="article-content"><strong>Description:</strong> {{ campaign.desc }}</p>
                        </div>
                    </article>
                </div>
                <p v-else>No campaigns found.</p>
            </div>
        </div>
    `,
    data() {
        return {
            influencers: [],
            sponsors: [],
            campaigns: []
        };
    },
    methods: {
        async fetchItems(type) {
            try {
                const response = await fetch(`/api/${type}`);
                if (!response.ok) throw new Error(`Error fetching ${type}`);
                const data = await response.json();
                this[type] = data;
            } catch (error) {
                console.error(error);
            }
        },
        async deleteItem(type, id) {
            try {
                const response = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(`Error deleting ${type.slice(0, -1)}`);
                this[type] = this[type].filter(item => item.id !== id);
            } catch (error) {
                console.error(error);
            }
        },
        getProfileImage(user) {
            return user.image_file ? `/static/profile_pics/${user.image_file}` : '/static/profile_pics/default.png';
        }
    },
    created() {
        this.fetchItems('influencers');
        this.fetchItems('sponsors');
        this.fetchItems('campaigns');
    }
};
