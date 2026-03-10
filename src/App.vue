<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import OfflineBanner from '@/components/common/OfflineBanner.vue'
import SearchOverlay from '@/components/common/SearchOverlay.vue'
import ScrollTopButton from '@/components/common/ScrollTopButton.vue'
import { useDocumentTitle } from '@/composables/useDocumentTitle'

useDocumentTitle()
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <RouterView v-slot="{ Component }">
      <Transition name="page">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <ToastContainer />
  <ConfirmModal />
  <OfflineBanner />
  <SearchOverlay />
  <ScrollTopButton />
</template>

<style>
.app-main {
  min-height: calc(100vh - var(--header-height));
  padding-top: var(--header-height);
}
</style>
