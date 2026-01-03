import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MasterView from '../views/MasterView.vue'
import PlayerView from '../views/PlayerView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        },
        {
            path: '/play/:id',
            name: 'master',
            component: MasterView,
            meta: { requiresAuth: true }
        },
        {
            path: '/join/:id',
            name: 'player',
            component: PlayerView
        },
        {
            path: '/stream/:id',
            name: 'stream',
            component: () => import('../views/StreamView.vue')
        },
        // Legacy Redirect
        {
            path: '/session',
            redirect: '/'
        }
    ]
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (to.meta.requiresAuth && !session) {
        next('/')
    } else if (to.path === '/' && session) {
        // If logged in and trying to go to login, send to dashboard
        next('/dashboard')
    } else {
        next()
    }
})

export default router
