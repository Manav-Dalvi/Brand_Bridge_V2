export default {
    template: `
      <div class="container">
        <h2>Request Ad for Campaign: {{ campaign.title }}</h2>
        <form @submit.prevent="submitAdRequest">
          <div class="form-group">
            <label for="messages">Messages</label>
            <textarea v-model="form.messages" id="messages" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="requirements">Requirements</label>
            <textarea v-model="form.requirements" id="requirements" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="payment_amount">Payment Amount</label>
            <input v-model="form.payment_amount" id="payment_amount" type="number" class="form-control">
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
  
        <!-- Ad Requests Section -->
        <div v-if="adRequests.length" class="content-section mt-4">
          <h3>Ad Requests</h3>
          <ul class="list-group">
            <li v-for="adRequest in adRequests" class="list-group-item">
              <strong>Influencer:</strong> {{ adRequest.influencer_name }} <br>
              <strong>Status:</strong> {{ adRequest.status }} <br>
              <strong>Goals Proposed:</strong> {{ adRequest.messages }} <br>
              <strong>Payment Proposed:</strong> Rs. {{ adRequest.payment_amount }} <br>
            </li>
          </ul>
        </div>
        <p v-else>No ad requests for this campaign.</p>
      </div>
    `,
    data() {
      return {
        campaign: {},
        form: {
          messages: '',
          requirements: '',
          payment_amount: ''
        },
        adRequests: []
      };
    },
    methods: {
      async fetchCampaign() {
        try {
          const campaignId = this.$route.params.campaignId;
          const response = await fetch(`/api/campaign/${campaignId}`);
          const data = await response.json();
          this.campaign = data;
        } catch (error) {
          console.error('Error fetching campaign:', error);
        }
      },
      async fetchAdRequests() {
        try {
          const campaignId = this.$route.params.campaignId;
          const response = await fetch(`/api/ad_requests/${campaignId}`);
          if (response.ok) {
            const data = await response.json();
            this.adRequests = data;
          } else {
            this.adRequests = [];
          }
        } catch (error) {
          console.error('Error fetching ad requests:', error);
        }
      },
      async submitAdRequest() {
        try {
          const campaignId = this.$route.params.campaignId;
          const influencerId = localStorage.getItem('user_id'); 
          const response = await fetch(`/api/ad_request/${campaignId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...this.form, influencer_id: influencerId })
          });
          if (response.ok) {
            this.$router.push(`/campaign/${campaignId}`);
          } else {
            console.error('Failed to submit ad request');
          }
        } catch (error) {
          console.error('Error submitting ad request:', error);
        }
      }
    },
    created() {
      this.fetchCampaign();
      this.fetchAdRequests(); // Fetch ad requests when component is created
    }
  };
  