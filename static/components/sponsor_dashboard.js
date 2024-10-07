export default {
    template: `
    <div class="container">
        <div class="media">
            <div class="media-body">
                <img :src="getImageSource(currentUser.imageFile)" class="rounded-circle article-img" />
                <h2 class="account-heading">{{ currentUser.company_name }}</h2>
                <hr>
                <p class="text-secondary"><b>Industry: </b>{{ currentUser.industry }}</p>
                <p class="text-secondary"><b>Budget: </b>{{ currentUser.budget }}</p>
                <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                <div v-else-if="userRole === 'influencer'">
                    <h2 class="account-heading">{{ currentUser.name }}</h2>
                    <hr>
                    <p class="text-secondary"><b>Niche: </b>{{ currentUser.niche }}</p>
                    <p class="text-secondary"><b>Reach: </b>{{ currentUser.reach }}</p>
                    <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                    <p class="text-secondary"><b>Total Earnings: </b>Rs. {{ totalEarnings }}</p>
                </div>
                <div v-else>
                    <h2 class="account-heading">Admin</h2>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            imageFile: '', // Update path or remove if not used
            userRole: this.getUserRole() || 'Visitor',  // Default value, will be set in created hook
            currentUser: {
                company_name: '',
                industry: '',
                budget: '',
                email: '',
                name: '',
                niche: '',
                reach: ''
            },
            totalEarnings: 0
        };
    },
    methods: {
        getUserID() {
            const id = localStorage.getItem('user_id');
            return id ? id : 'undefined'; // Default to 'undefined' if no user-id found
        },
        getUserRole() {
            const role = localStorage.getItem('user-role');
            return role ? role : 'Visitor'; // Default to 'Visitor'
        },
        async fetchUserData() {
            try {
                // Fetch user data
                const user_id = this.$route.params.user_id
                if (!user_id) {
                    throw new Error('Sponsor ID is missing in the route parameters');
                }
                console.log('User ID:', user_id);
                const response = await fetch(`/api/user_info/${user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.currentUser = {
                    company_name: data.company_name || '',
                    industry: data.industry || '',
                    budget: data.budget || '',
                    email: data.email || '',
                    name: data.name || '',
                    niche: data.niche || '',
                    reach: data.reach || ''
                };
                this.totalEarnings = data.total_earnings || 0;
                // If you have imageFile in your response, use it
                this.imageFile = data.image_file || '/static/profile_pics/default_company.png'; 
            } catch (error) {
                console.error('An error occurred while fetching user info:', error);
            }
        }
    },
    async created() {
        await this.fetchUserData();
    }
}
