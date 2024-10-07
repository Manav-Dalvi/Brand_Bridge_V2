export default {
    template: `
    <div class='container col-md-9' style="margin-left: 150px;">
        <div class="mb-3 p-5 bg-light">
            <fieldset>
                <legend>Update Campaign</legend> 
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
                
                <button class="btn btn-primary mt-2" @click='updateCampaign'>Submit</button>
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
        async fetchCampaign() {
            try {
                const campaignId = this.$route.params.campaignId;
                const response = await fetch(`/api/campaign/${campaignId}`);
                const data = await response.json();
                this.campaignData = {
                    title: data.title,
                    desc: data.desc,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    budget: data.budget,
                    goals: data.goals,
                    sponsor_id: data.owner.id
                };
            } catch (error) {
                console.error('Error fetching campaign:', error);
                this.error = 'An error occurred while fetching the campaign.';
            }
        },
        async updateCampaign() {
            // Basic validation
            if (!this.campaignData.title || !this.campaignData.desc || !this.campaignData.start_date || !this.campaignData.end_date || !this.campaignData.budget) {
                this.error = 'Please fill in all required fields.';
                return;
            }
            
            try {
                const campaignId = this.$route.params.campaignId;
                const res = await fetch(`/api/campaigns/${campaignId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.campaignData)
                });
                
                if (res.ok) {
                    this.$router.push({ path: `/campaign/${campaignId}` });
                } else {
                    const data = await res.json();
                    this.error = data.message;
                }
            } catch (error) {
                console.error('An error occurred:', error);
                this.error = 'An error occurred while updating the campaign.';
            }
        }
        
    },
    created() {
        this.fetchCampaign();
    }
}
