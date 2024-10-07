// login.js
export default {
    template: `
    <div class='container col-md-9' style="margin-left: 150px;">
        <div class="mb-3 p-5 bg-light">
            <label for="user-email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
            <label for="user-password" class="form-label">Password</label>
            <input type="password" class="form-control" id="user-password" v-model="cred.password">
            <button class="btn btn-primary mt-2" @click='login'> Login </button>
            <div class='text-danger'> {{ error }} </div>
        </div>
    </div>
    `,
    data() {
        return {
            cred: { email: null, password: null },
            error: null
        };
    },
    methods: {
        async login() {
            const res = await fetch('/user-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.cred)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('auth-token', data.token);
                localStorage.setItem('user-role', data.role);
                localStorage.setItem('user_id', data.user_id);
                // Notify Vue instance of auth state changes
                this.$root.auth.isAuthenticated = true;
                this.$root.auth.role = data.role;
                this.$root.auth.user_id = data.user_id;
                this.$router.push({ path: '/home' });
            } else {
                this.error = data.message;
            }
        }
    }
}
