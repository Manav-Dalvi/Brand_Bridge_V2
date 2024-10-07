import home from './components/home.js';
import about from './components/about.js';
import login from './components/login.js';
import register from './components/register.js';
import new_campaign from './components/new_campaign.js';
import sponsor_campaigns from './components/sponsor_campaigns.js';
import dashboard from './components/dashboard.js';
import campaign from './components/campaign.js';
import update_campaign from './components/update_campaign.js';
import update_info from './components/update_info.js';
import search_results from './components/search_results.js';
import influencer_profile from './components/influencer_profile.js';
import ad_request from './components/ad_request.js';
import admin_dashboard from './components/admin_dashboard.js';




const routes = [
    { path: '/', component: home, name: '/'},
    { path: '/home', component: home, name: 'home', meta: { title: 'Brand Bridge' } },
    { path: '/about', component: about, name: 'about', meta: { title: 'Brand Bridge - About' } },
    { path: '/login', component: login, name: 'login', meta: { title: 'Brand Bridge - Login' } },
    { path: '/register', component: register, name: 'register', meta: { title: 'Brand Bridge - Register' } },
    { path: '/new_campaign', component: new_campaign, name: 'new_campaign', meta: { title: 'Brand Bridge - New Campaign' } },
    { path: '/sponsor_campaigns/:sponsor_id', component: sponsor_campaigns, name: 'sponsor_campaigns', meta: { title: 'Brand Bridge - Campaigns' } },
    { path: '/dashboard/:user_id', component: dashboard, name: 'dashboard', meta: { title: 'Brand Bridge - Dashboard' } },
    { path: '/campaign/:campaignId', component: campaign, name: 'campaign', meta: { title: 'Brand Bridge - Campaign' } },
    { path: '/update_campaign/:campaignId', component: update_campaign, name: 'update_campaign', meta: { title: 'Brand Bridge - Update Campaign' } },
    { path: '/update_info/:campaignId', component: update_info, name: 'update_info', meta: { title: 'Brand Bridge - Update Info' } },
    { path: '/search_results/:type', component: search_results, name: 'search_results', meta: { title: 'Brand Bridge - Search', props: route => ({ query: route.query.query, results: JSON.parse(route.query.results || '[]'),type: route.params.type }) } },
    { path: '/influencer_profile/:user_id', component: influencer_profile, name: 'influencer_profile', meta: { title: 'Brand Bridge - Influencer' } },
    { path: '/ad_request/:campaignId', component: ad_request, name: 'ad_request', meta: { title: 'Brand Bridge - Ad Request' } },
    { path: '/admin_dashboard', component: admin_dashboard, name: 'admin_dashboard', meta: { title: 'Brand Bridge - Admin Dashboard' } }

];

export default new VueRouter({
    routes, history:true
});
