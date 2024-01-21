import { createRouter, createWebHistory } from 'vue-router'
import Recording from '@/views/StartRecording.vue';
import Participant from '@/views/ParticipantSelection.vue';
import Check from '@/views/DeviceCheck.vue';

const routes = [
  {
    path: '/start',
    component: Participant
  },
  {
    path: '/recording',
    component: Recording
  },
  {
    path: '/check',
    component: Check
  },
 
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
