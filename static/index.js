// index.js
import router from './router.js';
import navbar from './components/navbar.js';
import sidebar from './components/sidebar.js';

// Define a global reactive auth object
const auth = {
    isAuthenticated: !!localStorage.getItem('auth-token'),
    role: localStorage.getItem('user-role') || 'Visitor',
    user_id: localStorage.getItem('user_id') || null
};

router.afterEach((to) => {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
});


// Create a Vue instance to handle global state
new Vue({
    el: '#app',
    template: `
        <div>
            <navbar :auth="auth" />
            <div class="row">
                <div class="col-md-8">
                    <router-view />
                </div>
                <div class="col-md-4">
                    <sidebar />  <!-- Include the sidebar here -->
                </div>
            </div>
        </div>
    `,
    router,
    components: { navbar, sidebar },
    data() {
        return {
            auth
        };
    }
});
