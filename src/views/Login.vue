<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">Login</h2>
      <a-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item field="userAccount" label="Account">
          <a-input v-model="loginForm.userAccount" placeholder="Please enter your account" />
        </a-form-item>
        <a-form-item field="userPassword" label="Password">
          <a-input-password
            v-model="loginForm.userPassword"
            placeholder="Please enter your password"
            @press-enter="handleLogin"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleLogin" :loading="loading" long>
            Login
          </a-button>
        </a-form-item>
        <a-form-item>
          <div class="register-link">
            Don't have an account?
            <a-link @click="$router.push('/register')">Register now</a-link>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  userAccount: '',
  userPassword: ''
})

const rules = {
  userAccount: [
    { required: true, message: 'Please enter your account' },
    { minLength: 6, maxLength: 16, message: 'Account length must be between 6 and 16 characters' }
  ],
  userPassword: [
    { required: true, message: 'Please enter your password' },
    { minLength: 8, maxLength: 32, message: 'Password length must be between 8 and 32 characters' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    try {
      await userStore.login(loginForm)
      router.push('/pictures')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      loading.value = false
    }
  } catch (error) {
    console.log('Form validation failed:', error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.register-link {
  text-align: center;
  width: 100%;
  color: #666;
}
</style>
