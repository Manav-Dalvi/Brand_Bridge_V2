export default {
    template: `
    <div class='container col-md-9' style="margin-left: 150px;">
        <div class="mb-3 p-5 bg-light">
            <fieldset>
                <legend>Update Your Information</legend> 
                <hr>
                <label for="user-email" class="form-label">Email</label>
                <input type="email" class="form-control" id="user-email" v-model="userData.email">
                
                <div v-if="userRole === 'sponsor'">
                    <label for="company-name" class="form-label">Company Name</label>
                    <input type="text" class="form-control" id="company-name" v-model="userData.company_name">
                    
                    <label for="industry" class="form-label">Industry</label>
                    <input type="text" class="form-control" id="industry" v-model="userData.industry">
                    
                    <label for="budget" class="form-label">Budget</label>
                    <input type="number" class="form-control" id="budget" v-model="userData.budget">
                </div>
                
                <div v-if="userRole === 'influencer'">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" v-model="userData.name">
                    
                    <label for="niche" class="form-label">Niche</label>
                    <input type="text" class="form-control" id="niche" v-model="userData.niche">
                    
                    <label for="reach" class="form-label">Reach</label>
                    <input type="number" class="form-control" id="reach" v-model="userData.reach">
                </div>
                
                <button class="btn btn-primary mt-2" @click='updateUser'>Submit</button>
                <div class='text-danger'>{{ error }}</div>
            </fieldset>
        </div>
    </div>
    `,
    data() {
        return {
            userData: {
                email: '',
                company_name: '',
                industry: '',
                budget: 0,
                name: '',
                niche: '',
                reach: 0
            },
            error: null,
            userRole: this.getUserRole() || 'Visitor',  // Default value
        };
    },
    methods: {
        async updateUser() {
            // Basic validation
            if (!this.userData.email) {
                this.error = 'Email is required.';
                return;
            }
            
            try {
                const user_id = this.getUserID();
                if (!user_id) {
                    throw new Error('User ID is missing.');
                }

                const res = await fetch(`/api/user_info/${user_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.userData)
                });

                const data = await res.json();
                
                if (res.ok) {
                    this.$router.push({ path: `/dashboard/${user_id}` });
                } else {
                    this.error = data.message;
                }
            } catch (error) {
                console.error('An error occurred:', error);
                this.error = 'An error occurred while updating the user information.';
            }
        },
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
                const user_id = this.getUserID();
                if (!user_id) {
                    throw new Error('User ID is missing.');
                }
                
                const response = await fetch(`/api/user_info/${user_id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                
                this.userData = {
                    email: data.email || '',
                    company_name: data.company_name || '',
                    industry: data.industry || '',
                    budget: data.budget || 0,
                    name: data.name || '',
                    niche: data.niche || '',
                    reach: data.reach || 0
                };
            } catch (error) {
                console.error('An error occurred while fetching user info:', error);
            }
        }
    },
    async created() {
        await this.fetchUserData();
    }
}
