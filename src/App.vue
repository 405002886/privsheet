<template>
  <div id="app" class="app-container">
    <router-view />
    <NetworkMonitor />
    <GlobalLoader
      :is-loading="fileStore.isLoading"
      :status="loadingStatus"
    />
    <Toast />
  </div>
</template>

<script setup>
import NetworkMonitor from '@/components/common/NetworkMonitor.vue'
import GlobalLoader from '@/components/common/GlobalLoader.vue'
import Toast from '@/components/common/Toast.vue'
import { useFileStore } from '@/stores/fileStore'
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'

const fileStore = useFileStore()
const { t } = useI18n()

// 动态加载状态文字
const loadingStatus = computed(() => {
  if (fileStore.multiFileData.length > 0) {
    return t('app.loadingStatus.parsingMultiple')
  }
  return t('globalLoader.loading')
})
</script>

<style>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>