<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">Register</h2>
      <a-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item field="userAccount" label="Account">
          <a-input v-model="registerForm.userAccount" placeholder="Please enter your account" />
        </a-form-item>
        <a-form-item field="userPassword" label="Password">
          <a-input-password
            v-model="registerForm.userPassword"
            placeholder="Please enter your password"
          />
        </a-form-item>
        <a-form-item field="checkPassword" label="Confirm Password">
          <a-input-password
            v-model="registerForm.checkPassword"
            placeholder="Please enter your password again"
            @press-enter="handleRegister"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleRegister" :loading="loading" long>
            Register
          </a-button>
        </a-form-item>
        <a-form-item>
          <div class="login-link">
            Already have an account?
            <a-link @click="$router.push('/login')">Login now</a-link>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/user'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: ''
})

const validatePassword = async (value, callback) => {
  if (value !== registerForm.userPassword) {
    callback('Passwords do not match')
  }
}

const rules = {
  userAccount: [
    { required: true, message: 'Please enter your account' },
    { minLength: 6, maxLength: 16, message: 'Account length must be between 6 and 16 characters' }
  ],
  userPassword: [
    { required: true, message: 'Please enter your password' },
    { minLength: 8, maxLength: 32, message: 'Password length must be between 8 and 32 characters' }
  ],
  checkPassword: [
    { required: true, message: 'Please enter your password again' },
    { validator: validatePassword }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    try {
      await userRegister(registerForm)
      Message.success('Registration successful, please login')
      router.push('/login')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      loading.value = false
    }
  } catch (error) {
    console.log('Form validation failed:', error)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 450px;
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

.login-link {
  text-align: center;
  width: 100%;
  color: #666;
}
</style>
