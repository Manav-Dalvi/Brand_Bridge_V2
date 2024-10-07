export default {
    template: `
    <div class='container col-md-9' style="margin-left: 150px;">
        <div class="mb-3 p-5 bg-light">
            <fieldset>
                <legend>Create a New Campaign</legend> 
                <hr>
                <label for="campaign-title" class="form-label">Title</label>
                <input type="text" class="form-control" id="campaign-title" v-model="campaignData.title">
                
                <label for="campaign-desc" class="form-label">Description</label>
                <textarea class="form-control" id="campaign-desc" v-model="campaignData.desc"></textarea>
                
                <label for="start-date" class="form-label">Start Date</label>
                <input type="date" class="form-control" id="start-date" v-model="campaignData.start_date">
                
                <label for="end-date" class="form-label">End Date</label>
                <input type="date" class="form-control" id="end-date" v-model="campaignData.end_date">
                
                <label for="budget" class="form-label">Budget</label>
                <input type="number" class="form-control" id="budget" v-model="campaignData.budget">
                
                <label for="goals" class="form-label">Goals</label>
                <textarea class="form-control" id="goals" v-model="campaignData.goals"></textarea>
                
                <button class="btn btn-primary mt-2" @click='addCampaign'>Submit</button>
                <div class='text-danger'>{{ error }}</div>
            </fieldset>
        </div>
    </div> 
    `,
    data() {
        return {
            campaignData: {
                title: '',
                desc: '',
                start_date: '',
                end_date: '',
                budget: 0,
                goals: '',
                sponsor_id: this.$root.auth.user_id  // Fetch the sponsor ID from auth
            },
            error: null
        };
    },
    methods: {
        async addCampaign() {
            // Basic validation
            if (!this.campaignData.title || !this.campaignData.desc || !this.campaignData.start_date || !this.campaignData.end_date || !this.campaignData.budget) {
                this.error = 'Please fill in all required fields.';
                return;
            }
            
            // Ensure sponsor_id is set
            if (!this.campaignData.sponsor_id) {
                this.error = 'Sponsor ID is missing.';
                return;
            }
            
            try {
                const res = await fetch('/api/campaigns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.campaignData)  // Correctly stringify the campaignData object
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    this.$router.push({ path: '/home' });
                } else {
                    this.error = data.message;
                }
            } catch (error) {
                console.error('An error occurred:', error);
                this.error = 'An error occurred while adding the campaign.';
            }
        }
    }
}
