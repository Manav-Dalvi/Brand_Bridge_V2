export default {
    template: `
        <div class="content-section" style="margin-left: 90px;">
            <div class="media">
                <img class="rounded-circle account-img" :src="getImageSource(currentUser)" alt="Profile Image">
                <div class="media-body">
                    <h2 class="account-heading">{{ currentUser.name }}</h2>
                    <hr>
                    <p class="text-secondary"><b>Niche: </b>{{ currentUser.niche }}</p>
                    <p class="text-secondary"><b>Reach: </b>{{ currentUser.reach }}</p>
                    <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                </div>
            </div>
            <div class="content-section mt-4">
                <h3>Completed Campaigns</h3>
                <ul v-if="adRequests.length" class="list-group">
                    <li v-for="adRequest in adRequests" :key="adRequest.id" class="list-group-item">
                        <strong>Campaign:</strong> 
                        <router-link :to="'/campaign/' + adRequest.campaign.id">{{ adRequest.campaign.title }}</router-link> <br>
                        <strong>Description:</strong> {{ adRequest.campaign.desc }} <br>
                        <strong>Goals:</strong> {{ adRequest.campaign.goals }} <br>
                    </li>
                </ul>
                <p v-else>No accepted ad requests.</p>
            </div>
        </div>
    `,
    data() {
        return {
            user_id: null,
            adRequests: [],
            currentUser: {
                company_name: '',
                industry: 'Not Updated',
                budget: 'Not Updated',
                email: 'Not Updated',
                name: 'Not Updated',
                niche: 'Not Updated',
                reach: 'Not Updated'
            }
        };
    },
    methods: {
        getUserID() {
            const id = this.$route.params.user_id;
            return id ? id : null; // Return null if no user-id found
        },
        getImageSource(owner) {
            return owner && owner.image_file ? `/static/profile_pics/${owner.image_file}` : '/static/profile_pics/default_company.png';
        },
        async fetchUserData() {
            try {
                const user_id = this.getUserID();
                if (!user_id) {
                    throw new Error('User ID is missing in the route parameters');
                }
                console.log('User ID:', user_id);
                const response = await fetch(`/api/influencer/${user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                this.currentUser = {
                    company_name: data.company_name || 'Tried Updating',
                    industry: data.industry || 'Tried Updating',
                    budget: data.budget || 'Tried Updating',
                    email: data.email || 'Tried Updating',
                    name: data.name || 'Tried Updating',
                    niche: data.niche || 'Tried Updating',
                    reach: data.reach || 'Tried Updating',
                    image_file: data.profile || 'Tried Updating'
                };
            } catch (error) {
                console.error('An error occurred while fetching user info:', error);
            }
        },
        async fetchAdRequests() {
            
            try {
                const response = await fetch(`/api/ad_requests/influencer_prof/${this.user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                this.adRequests = data;
            } catch (error) {
                console.error('Error fetching ad requests for influencer:', error);
                this.adRequests = [];
            }
        }
        
    },
    created() {
        this.user_id = this.getUserID(); // Initialize user_id
        console.log("Route params:", this.$route.params);
        this.fetchUserData();
        this.fetchAdRequests();
    }
};
