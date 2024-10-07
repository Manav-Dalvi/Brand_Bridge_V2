export default {
  template: `
    <article class="media content-section" style="margin-left: 90px;">
      <img class="rounded-circle article-img" :src="getImageSource(campaign.owner)" v-if="campaign.owner">
      <div class="ml-3">
        <h4 v-if="campaign.owner">
          <router-link :to="getOwnerLink(campaign.owner)">{{ campaign.owner.company_name }}</router-link>
        </h4>
        <small class="text-muted">{{ formatDate(campaign.date_posted) }}</small>
        <div v-if="isSponsor() && isOwner()">
          <router-link class="btn btn-secondary btn-sm mt-1 mb-1" :to="'/update_campaign/' + campaign.id">Update</router-link>
          <div v-if="showConfirmDelete">
            <p>Are you sure you want to delete this campaign?</p>
            <button class="btn btn-danger btn-sm" @click="confirmDelete">Yes, delete</button>
            <button class="btn btn-secondary btn-sm" @click="cancelDelete">Cancel</button>
          </div>
          <div v-else>
            <button class="btn btn-danger btn-sm mt-1 mb-1" @click="showConfirmDelete = true">Delete</button>
          </div>
        </div>
        <div v-if="isInfluencer()">
          <router-link class="btn btn-primary btn-sm mt-1 mb-1" :to="'/ad_request/' + campaign.id">Request Ad</router-link>
        </div>
      </div>
      <div class="media-body mt-3">
        <h2 class="article-title">{{ campaign.title }}</h2>
        <hr>
        <p class="article-content"><b>Description:</b></p>
        <p class="article-content">{{ campaign.desc }}</p>
        <hr>
        <p class="article-content"><b>Details:</b></p>
        <p class="article-content">1. From {{ formatDate(campaign.start_date) }} to {{ formatDate(campaign.end_date) }}</p>
        <p class="article-content">2. With the Budget of Rs. {{ campaign.budget }}</p>
        <p class="article-content">3. Goals: {{ campaign.goals }}</p>
      </div>
      <div v-if="adRequests.length && isSponsor() && isOwner()" class="content-section mt-4">
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
      <div v-else class="content-section mt-4">No ad requests for this campaign.</div>
    </article>
  `,
  data() {
    return {
      campaign: {},
      currentUserRole: null,
      currentUserID: null,
      showConfirmDelete: false,
      adRequests: []
    };
  },
  methods: {
    getUserID() {
      return localStorage.getItem('user_id');
    },
    getUserRole() {
      return localStorage.getItem('user-role');
    },
    async fetchCampaign() {
      try {
        const campaignId = this.$route.params.campaignId;
        const response = await fetch(`/api/campaign/${campaignId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign data');
        }
        const data = await response.json();
        this.campaign = data;
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    },
    async fetchCurrentUser() {
      try {
        const user_id = this.getUserID();
        if (!user_id) {
          throw new Error('User ID is missing');
        }
        const response = await fetch(`/api/user_info/${user_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        this.currentUserRole = data.role;
        this.currentUserID = user_id;
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    getImageSource(owner) {
      return `/static/profile_pics/${owner.image_file}`;
    },
    getOwnerLink(owner) {
      return owner ? `/sponsor_campaigns/${owner.id}` : '#';
    },
    isSponsor() {
      return this.currentUserRole === 'sponsor';
    },
    isOwner() {
      return this.campaign.owner && this.campaign.owner.id === parseInt(this.currentUserID, 10);
    },
    isInfluencer() {
      return this.currentUserRole === 'influencer';
    },
    async deleteCampaign() {
      try {
        const campaignId = this.$route.params.campaignId;
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          this.$router.push('/home');
        } else {
          console.error('Failed to delete campaign');
        }
      } catch (error) {
        console.error('An error occurred while deleting the campaign:', error);
      }
    },
    cancelDelete() {
      this.showConfirmDelete = false;
    },
    confirmDelete() {
      this.deleteCampaign();
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
    }
  },
  created() {
    this.currentUserRole = this.getUserRole();
    this.currentUserID = this.getUserID();
    this.fetchCampaign();
    this.fetchCurrentUser();
    this.fetchAdRequests();
  }
};
