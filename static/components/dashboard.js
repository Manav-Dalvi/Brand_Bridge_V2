export default {
    template: `
    <div class="container col-md-11" style="margin-left: 90px;">
        <div class="media">
            <div class="media content-section">
                <img :src="getImageSource(currentUser)" class="rounded-circle article-img" />
                <div v-if="userRole === 'sponsor'">
                    <h2 class="account-heading">{{ currentUser.company_name }}</h2>
                    <hr>
                    <p class="text-secondary"><b>Industry: </b>{{ currentUser.industry }}</p>
                    <p class="text-secondary"><b>Budget: </b>{{ currentUser.budget }}</p>
                    <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                    <router-link :to="'/update_info/' + userID" class="btn btn-primary mt-2">Update Info</router-link>
                </div>
                <div v-else-if="userRole === 'influencer'">
                    <h2 class="account-heading">{{ currentUser.name }}</h2>
                    <hr>
                    <p class="text-secondary"><b>Niche: </b>{{ currentUser.niche }}</p>
                    <p class="text-secondary"><b>Reach: </b>{{ currentUser.reach }}</p>
                    <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                    <p class="text-secondary"><b>Total Earnings: </b>Rs. {{ totalEarnings }}</p>
                    <router-link :to="'/update_info/' + userID" class="btn btn-primary mt-2">Update Info</router-link>
                </div>
                <div v-if="userRole === 'admin'">
                    <h2 class="account-heading"> Admin Dashboard</h2>
                    <p class="text-secondary"><b>Email: </b>{{ currentUser.email }}</p>
                </div>
            </div>
        </div>

        <!-- Ad Requests Section -->
        <div v-if="userRole === 'influencer' && InfadRequests.length" class="content-section mt-4">
            <h3>Your Ad Requests</h3>
            <ul class="list-group">
                <li v-for="adRequest in InfadRequests" class="list-group-item">
                    <strong>Campaign:</strong> {{ adRequest.campaign.title }} <br>
                    <strong>Status:</strong> {{ adRequest.status }} <br>
                    <strong>Goals:</strong> {{ adRequest.goals }} <br>
                    <strong>Payment Amount:</strong> Rs. {{ adRequest.payment_amount }} <br>
                    <div v-if="adRequest.status === 'Pending'">
                        <button class="btn btn-danger btn-sm" @click="cancelAdRequest(adRequest.id)">Cancel Request</button>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else-if="userRole === 'sponsor' && SponsoradRequests.length" class="content-section mt-4">
            <h3>Your Ad Requests</h3>
            <ul class="list-group">
                <li v-for="adRequest in SponsoradRequests" class="list-group-item">
                    <strong>Influencer:</strong> {{ adRequest.influencer_name }} <br>
                    <strong>Campaign:</strong> {{ adRequest.campaign.title }} <br>
                    <strong>Status:</strong> {{ adRequest.status }} <br>
                    <strong>Goals:</strong> {{ adRequest.goals }} <br>
                    <strong>Payment Amount:</strong> Rs. {{ adRequest.payment_amount }} <br>
                    <div v-if="adRequest.status === 'Pending'">
                        <button class="btn btn-success btn-sm" @click="acceptAdRequest(adRequest.id)">Accept</button>
                        <button class="btn btn-danger btn-sm" @click="rejectAdRequest(adRequest.id)">Reject</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    `,
    data() {
        return {
            imageFile: "", // Update path or remove if not used
            userRole: this.getUserRole() || 'Visitor',  // Default value, will be set in created hook
            userID: this.getUserID(),
            currentUser: {
                company_name: '',
                industry: 'Not Updated',
                budget: 'Not Updated',
                email: 'Not Updated',
                name: 'Not Updated',
                niche: 'Not Updated',
                reach: 'Not Updated'
            },
            totalEarnings: 0,
            SponsoradRequests: [],
            InfadRequests: []
        };
    },
    methods: {
        getUserID() {
            const id = this.$route.params.user_id;
            return id ? id : 'undefined'; // Default to 'undefined' if no user-id found
        },
        getUserRole() {
            const role = localStorage.getItem('user-role');
            return role ? role : 'Visitor'; // Default to 'Visitor'
        },
        getImageSource(owner) {
            return owner && owner.image_file ? `/static/profile_pics/${owner.image_file}` : '/static/profile_pics/default_company.png';
        },
        async fetchUserData() {
            try {
                const user_id = this.$route.params.user_id;
                if (!user_id) {
                    throw new Error('User ID is missing in the route parameters');
                }
                console.log('User ID:', user_id);
                const response = await fetch(`/api/user_info/${user_id}`);
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
                    reach: data.reach || 'Tried Updating'
                };
                this.totalEarnings = data.total_earnings || 0;
                this.imageFile = data.image_file || '/static/profile_pics/default_company.png';

                if (this.userRole === 'influencer') {
                    this.fetchAdRequests();
                } else if (this.userRole === 'sponsor') {
                    this.fetchSponsorAdRequests();
                }
            } catch (error) {
                console.error('An error occurred while fetching user info:', error);
            }
        },
        async fetchAdRequests() {
            const user_id = this.$route.params.user_id;
            try {
                const response = await fetch(`/api/ad_requests/influencer/${user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.InfadRequests = data;
            } catch (error) {
                console.error('Error fetching ad requests for influencer:', error);
                this.InfadRequests = [];
            }
        },
        async fetchSponsorAdRequests() {
            const user_id = this.$route.params.user_id;
            try {
                const response = await fetch(`/api/ad_requests/sponsor/${user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.SponsoradRequests = data;
            } catch (error) {
                console.error('Error fetching ad requests for sponsor:', error);
                this.SponsoradRequests = [];
            }
        },
        async cancelAdRequest(adRequestId) {
            try {
                const response = await fetch(`/api/ad_request/${adRequestId}/cancel`, {
                    method: 'POST'
                });
                if (response.ok) {
                    this.fetchAdRequests(); // Refresh the ad requests
                } else {
                    console.error('Failed to cancel ad request');
                }
            } catch (error) {
                console.error('Error canceling ad request:', error);
            }
        },
        async acceptAdRequest(adRequestId) {
            try {
                const response = await fetch(`/api/ad_request/${adRequestId}/accept`, {
                    method: 'POST'
                });
                if (response.ok) {
                    this.fetchSponsorAdRequests(); // Refresh the ad requests
                } else {
                    console.error('Failed to accept ad request');
                }
            } catch (error) {
                console.error('Error accepting ad request:', error);
            }
        },
        async rejectAdRequest(adRequestId) {
            try {
                const response = await fetch(`/api/ad_request/${adRequestId}/reject`, {
                    method: 'POST'
                });
                if (response.ok) {
                    this.fetchSponsorAdRequests(); // Refresh the ad requests
                } else {
                    console.error('Failed to reject ad request');
                }
            } catch (error) {
                console.error('Error rejecting ad request:', error);
            }
        }
    },
    created() {
        this.fetchUserData()
            .then(() => {
                if (this.userRole === 'influencer') {
                    return this.fetchAdRequests();
                } else if (this.userRole === 'sponsor') {
                    return this.fetchSponsorAdRequests();
                }
            })
            .catch(error => {
                console.error('An error occurred during data fetching:', error);
            });
    }
    
}
