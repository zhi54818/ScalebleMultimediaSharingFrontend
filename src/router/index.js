import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/pictures'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pictures',
    name: 'Pictures',
    component: () => import('@/views/Pictures.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth === false) {
    // 登录和注册页面，如果已登录则跳转到首页
    if (userStore.userInfo || localStorage.getItem('token')) {
      next('/pictures')
    } else {
      next()
    }
  } else {
    // 需要登录的页面
    if (userStore.userInfo || localStorage.getItem('token')) {
      // 如果 store 中没有用户信息，尝试从 localStorage 恢复
      if (!userStore.userInfo) {
        userStore.initUserInfo()
      }
      next()
    } else {
      next('/login')
    }
  }
})

export default router

