export default {
    template:`
    <div class='container col-md-9 style="margin-left: 150px;"'>
        <div class="mb-3 p-5 bg-light">
            <label for="user-email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">

            <label for="user-password" class="form-label">Password</label>
            <input type="password" class="form-control" id="user-password" v-model="cred.password">

            <label for="user-role" class="form-label">Role</label>
            <select class="form-control" id="user-role" v-model="cred.role">
                <option value="admin">Admin</option>
                <option value="sponsor">Sponsor</option>
                <option value="influencer">Influencer</option>
            </select>

            <div v-if="cred.role === 'sponsor'">
                <label for="company-name" class="form-label">Company Name</label>
                <input type="text" class="form-control" id="company-name" v-model="cred.company_name">

                <label for="industry" class="form-label">Industry</label>
                <input type="text" class="form-control" id="industry" v-model="cred.industry">

                <label for="budget" class="form-label">Budget</label>
                <input type="number" class="form-control" id="budget" v-model="cred.budget">
            </div>

            <div v-if="cred.role === 'influencer'">
                <label for="name" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" v-model="cred.name">

                <label for="niche" class="form-label">Niche</label>
                <input type="text" class="form-control" id="niche" v-model="cred.niche">

                <label for="reach" class="form-label">Reach (Approx. audience count eg: Total follower count)</label>
                <input type="number" class="form-control" id="reach" v-model="cred.reach">
            </div>

            <button class="btn btn-primary mt-2" @click='register'>Register</button>
            <div class='text-danger'> {{ error }} </div>
        </div>
    </div> 
    `,
    data() {
        return {
            cred: {
                email: null, 
                password: null, 
                role: 'sponsor', 
                company_name: null, 
                industry: null, 
                budget: null,
                name: null,
                niche: null,
                reach: null
            },
            error: null
        }
    },
    methods: {
        validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },
        async register() {
            if (!this.validateEmail(this.cred.email)) {
                this.error = "Invalid email address.";
                return;
            }

            const res = await fetch('/user-register', 
                {method: 'POST', 
                headers: {'Content-Type': 'application/json'},    
                body: JSON.stringify(this.cred)})
            const data = await res.json()
            if(res.ok){
                this.$router.push({path:'/login'})
            } else {
                this.error = data.message
            }
        }
    }
}
