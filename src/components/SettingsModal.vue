<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div
      class="bg-lumina-card w-full max-w-md rounded-xl border border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-white">Settings</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="space-y-4">

        <!-- Provider Selector -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Storage Provider</label>
          <div class="flex gap-2 p-1 bg-slate-800 rounded-lg">
            <button @click="activeTab = 'supabase'" class="flex-1 py-1 text-sm font-medium rounded transition-colors"
              :class="activeTab === 'supabase' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'">
              Supabase
            </button>
            <button @click="activeTab = 'cloudinary'" class="flex-1 py-1 text-sm font-medium rounded transition-colors"
              :class="activeTab === 'cloudinary' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'">
              Cloudinary
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'supabase'" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Supabase URL</label>
            <input v-model="form.supabase.url" type="text" placeholder="https://xyz.supabase.co"
              class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Supabase Anon Key</label>
            <input v-model="form.supabase.key" type="password" placeholder="public-anon-key"
              class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Bucket Name</label>
            <input v-model="form.supabase.bucket" type="text" placeholder="images"
              class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
          </div>
        </div>

        <div v-if="activeTab === 'cloudinary'" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Cloud Name</label>
            <input v-model="form.cloudinary.cloudName" type="text" placeholder="e.g. demo"
              class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Upload Preset (Unsigned)</label>
            <input v-model="form.cloudinary.uploadPreset" type="text" placeholder="e.g. ml_default"
              class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
            <p class="text-xs text-slate-500 mt-1">Found in Settings > Upload > Upload presets. Mode must be 'Unsigned'.
            </p>
          </div>
          <div class="pt-2 border-t border-slate-700">
            <label class="mb-1 block text-sm font-medium text-slate-300 flex justify-between">
              <span>API Key & Secret</span>
              <span class="text-xs text-yellow-500 font-normal">Optional (For Deletion)</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="form.cloudinary.apiKey" type="text" placeholder="API Key"
                class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
              <input v-model="form.cloudinary.apiSecret" type="password" placeholder="API Secret"
                class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none">
            </div>
            <p class="text-xs text-slate-500 mt-1">Required only if you want to DELETE images from Cloudinary via this
              app. <span class="text-red-400">Not secure for public apps.</span></p>
          </div>
        </div>

      </div>

      <div class="mt-6 flex justify-end">
        <button @click="save"
          class="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 focus:ring-offset-slate-900">
          Save & Connect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStorage } from '../composables/useStorage'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const { providerType, providerConfig, setConfig } = useStorage()

const activeTab = ref('supabase')

const form = ref({
  supabase: {
    url: '',
    key: '',
    bucket: 'images'
  },
  cloudinary: {
    cloudName: '',
    uploadPreset: '',
    apiKey: '',
    apiSecret: ''
  }
})

onMounted(() => {
  // Load current global state
  activeTab.value = providerType.value

  // Populate form based on what we have or existing defaults
  // Note: LocalStorage logic already ran in useStorage, but we can double check individual LS Items if we want to support switching back and forth preserving data
  // For now let's just create a logical mapping

  // Try to recover separate configs from LS to allow toggling without data loss
  const savedSupabase = JSON.parse(localStorage.getItem('lumina_supabase_config') || '{}')
  const savedCloudinary = JSON.parse(localStorage.getItem('lumina_cloudinary_config') || '{}')

  form.value.supabase = { ...form.value.supabase, ...savedSupabase }
  form.value.cloudinary = { ...form.value.cloudinary, ...savedCloudinary }

  // If useStorage matches one of them, ensure it syncs (though it should come from the same source eventually)
  if (providerType.value === 'supabase') {
    form.value.supabase = { ...form.value.supabase, ...providerConfig.value }
  } else if (providerType.value === 'cloudinary') {
    form.value.cloudinary = { ...form.value.cloudinary, ...providerConfig.value }
  }
})

const save = () => {
  if (activeTab.value === 'supabase') {
    if (!form.value.supabase.url || !form.value.supabase.key || !form.value.supabase.bucket) {
      alert('Please fill all Supabase fields')
      return
    }
    setConfig('supabase', form.value.supabase)
    // Legacy support: also save simple item for other parts if any (MasterView currently relies on global supabase client, but for Storage we use custom)
    localStorage.setItem('lumina_supabase_config', JSON.stringify(form.value.supabase))
  } else {
    if (!form.value.cloudinary.cloudName || !form.value.cloudinary.uploadPreset) {
      alert('Please fill Cloud Name and Upload Preset')
      return
    }
    setConfig('cloudinary', form.value.cloudinary)
    localStorage.setItem('lumina_cloudinary_config', JSON.stringify(form.value.cloudinary))
  }

  emit('close')
}
</script>
