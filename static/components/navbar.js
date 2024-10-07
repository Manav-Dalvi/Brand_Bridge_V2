// navbar.js
export default {
    template: `
    <nav class="navbar navbar-expand-lg bg-steel fixed-top">
        <div class="container-fluid">
            <img src="/static/images/Brand_Icon_Final.png" class="brand-icon" style="margin-left: 150px;">
            <router-link class="navbar-brand mr-3 main-title" to="/home">Brand Bridge</router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <div class="navbar-nav mr-auto">
                        <router-link class="nav-item nav-link" to="/home">Home</router-link>
                        <router-link class="nav-item nav-link" to="/about">About</router-link>
                    </div>
                </ul>
                <ul class="navbar-nav ms-auto" style="margin-right:120px;">
                    <div class="navbar-nav ms-auto" style="margin-right:180px;">
                        <router-link class="nav-item nav-link" v-if="auth.isAuthenticated && auth.role === 'sponsor'" to="/new_campaign"> New Campaign </router-link>
                        <router-link class="nav-item nav-link" v-if="auth.isAuthenticated && auth.role === 'sponsor'" :to="'/dashboard/' + auth.user_id"> Dashboard </router-link>
                        <router-link class="nav-item nav-link" v-if="auth.isAuthenticated && auth.role === 'influencer'" :to="'/dashboard/' + auth.user_id"> Dashboard </router-link>
                        <router-link class="nav-item nav-link" v-if="auth.isAuthenticated && auth.role === 'admin'" to="/admin_dashboard"> Dashboard </router-link>

                        <a class="nav-item nav-link" v-if="auth.isAuthenticated" @click="logout">Logout</a>
                        <router-link class="nav-item nav-link" v-if="!auth.isAuthenticated" to="/login"> Login </router-link>
                        <router-link class="nav-item nav-link" v-if="!auth.isAuthenticated" to="/register"> Register </router-link>
                    </div>
                </ul>
            </div>
        </div>
    </nav>
    `,
    props: ['auth'],
    data() {
        return {
            userID: this.getUserID(),
        };
    },
    methods: {
        getUserID() {
            const id = localStorage.getItem('user_id');
            return id ? id : 'undefined'; // Default to 'undefined' if no user-id found
        },
        logout() {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user-role');
            localStorage.removeItem('user_id');
            this.auth.isAuthenticated = false;
            this.auth.role = 'Visitor';
            this.$router.push({ path: '/login' });
        }
    }
}
