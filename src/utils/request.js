import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true // 允许携带 cookie（后端使用 Session）
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 后端使用 Session 管理登录状态，不需要手动添加 token
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 如果返回的状态码为 200，检查业务状态码
    if (response.status === 200) {
      // 后端成功时 code 为 0
      if (res && res.code === 0) {
        return res.data
      } else {
        // 业务错误，显示后端返回的错误信息
        const errorMessage = res?.message || res?.description || 'Request failed'
        Message.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }
    }
    return res
  },
  (error) => {
    console.error('请求错误:', error)
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，清除用户信息并跳转到登录页
        const userStore = useUserStore()
        userStore.logout()
        Message.error('Login expired, please login again')
      } else if (status === 500) {
        // 服务器内部错误，尝试从响应中获取错误信息
        let errorMessage = 'Internal server error, please check backend service logs'
        if (data) {
          // 如果响应是 JSON 格式（后端异常处理器返回的 BaseResponse）
          if (typeof data === 'object') {
            errorMessage = data.message || data.description || errorMessage
          } else if (typeof data === 'string' && data.trim()) {
            // 尝试解析 JSON 字符串
            try {
              const parsed = JSON.parse(data)
              errorMessage = parsed.message || parsed.description || errorMessage
            } catch (e) {
              // 如果不是 JSON，直接使用字符串
              errorMessage = data
            }
          }
        }
        Message.error(errorMessage)
      } else {
        // 其他错误
        const errorMessage = data?.message || data?.description || `Request failed: ${status}`
        Message.error(errorMessage)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      Message.error('Network error, please check network connection or backend service')
    } else {
      // 其他错误
      Message.error(error.message || 'Request failed')
    }
    return Promise.reject(error)
  }
)

export default service

