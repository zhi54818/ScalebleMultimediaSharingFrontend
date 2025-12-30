import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLogin, userLogout, getLoginUser } from '@/api/user'
import { Message } from '@arco-design/web-vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  // 登录
  const login = async (loginData) => {
    try {
      const res = await userLogin(loginData)
      // 后端直接返回 UserLoginVo 对象
      userInfo.value = res
      // 后端使用 Session，不需要存储 token，但保留用于判断是否登录
      token.value = res?.uid || res?.id || 'logged_in'
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(res))
      Message.success('Login successful')
      return res
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await userLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      userInfo.value = null
      token.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  // 获取当前用户信息
  const fetchUserInfo = async () => {
    try {
      const res = await getLoginUser()
      userInfo.value = res
      localStorage.setItem('userInfo', JSON.stringify(res))
      return res
    } catch (error) {
      // 如果获取失败，清除本地存储
      logout()
      throw error
    }
  }

  // 初始化用户信息（从 localStorage）
  const initUserInfo = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (error) {
        console.error('Failed to parse user info:', error)
      }
    }
  }

  return {
    userInfo,
    token,
    login,
    logout,
    fetchUserInfo,
    initUserInfo
  }
})

