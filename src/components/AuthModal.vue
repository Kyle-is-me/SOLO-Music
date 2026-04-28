<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('update:visible', false)">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isRegister ? '注册' : '登录' }}</h2>
          <button class="modal-close" @click="$emit('update:visible', false)">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="username" placeholder="请输入用户名" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" v-model="password" placeholder="请输入密码" required autocomplete="current-password" />
          </div>
          <button type="submit" class="btn-primary">{{ isRegister ? '注册' : '登录' }}</button>
        </form>
        <div class="modal-footer">
          <span>{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
          <a href="#" @click.prevent="isRegister = !isRegister">{{ isRegister ? '立即登录' : '立即注册' }}</a>
        </div>
        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible']);

const authStore = useAuthStore();
const isRegister = ref(false);
const username = ref('');
const password = ref('');
const errorMsg = ref('');

async function handleSubmit() {
  errorMsg.value = '';
  try {
    if (isRegister.value) {
      await authStore.register(username.value, password.value);
    } else {
      await authStore.login(username.value, password.value);
    }
    emit('update:visible', false);
    username.value = '';
    password.value = '';
  } catch (err) {
    errorMsg.value = err.message || (isRegister.value ? '注册失败' : '登录失败');
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  width: 380px;
  backdrop-filter: blur(16px);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
}
.modal-close {
  font-size: 22px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
}
.modal-close:hover {
  color: var(--text-primary);
}
.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}
.form-group input:focus {
  border-color: var(--accent);
}
.btn-primary {
  width: 100%;
  padding: 10px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
}
.btn-primary:hover {
  background: var(--accent-light);
}
.modal-footer {
  text-align: center;
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-secondary);
}
.modal-footer a {
  color: var(--accent);
  margin-left: 4px;
}
.auth-error {
  margin-top: 10px;
  color: #ff6b7a;
  font-size: 12px;
  text-align: center;
}
</style>
