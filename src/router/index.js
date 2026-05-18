import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { titleKey: 'router.home' }
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/pages/HelpPage.vue'),
    meta: { titleKey: 'router.help' }
  },
  {
    path: '/task/:taskId',
    name: 'task',
    component: () => import('@/pages/TaskPage.vue'),
    meta: { titleKey: 'router.task' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.titleKey) {
    const title = i18n.global.t(to.meta.titleKey)
    const siteTitle = i18n.global.t('app.siteTitle')
    document.title = `${title} - ${siteTitle}`
  }
  next()
})

export default router
