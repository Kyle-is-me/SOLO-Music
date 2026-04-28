<template>
  <div class="search-bar">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter="doSearch"
      :placeholder="placeholder"
    />
    <button class="search-btn" @click="doSearch">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索...' },
});
const emit = defineEmits(['update:modelValue', 'search']);

function doSearch() {
  if (props.modelValue.trim()) {
    emit('search', props.modelValue.trim());
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 4px 4px 4px 14px;
  border: 1px solid var(--border);
  width: 260px;
}
.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 13px;
}
.search-bar input::placeholder {
  color: var(--text-muted);
}
.search-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.search-btn:hover {
  background: var(--accent-light);
}
</style>
