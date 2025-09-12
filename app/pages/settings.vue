<template>
  <div class="relative flex size-full min-h-screen flex-col dark justify-between group/design-root overflow-x-hidden bg-[#0d1218] text-white" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <div class="flex-grow">
      <header class="sticky top-0 z-10 bg-[#0d1218]/80 backdrop-blur-sm">
        <div class="flex items-center p-4">
          <button @click="$router.back()" class="flex size-10 shrink-0 items-center justify-center">
            <span class="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 class="flex-1 text-center text-xl font-bold tracking-tight pr-10">Settings</h1>
        </div>
      </header>
      <main class="px-4">
        <div class="space-y-2 mt-4">
          <a @click="showAlert('Theme Selection')" class="flex items-center gap-4 bg-[#101a23] p-4 rounded-lg min-h-[72px] cursor-pointer">
            <div class="flex flex-col flex-grow justify-center">
              <p class="text-base font-medium">Theme Selection</p>
              <p class="text-[#8eadcc] text-sm">Dark</p>
            </div>
            <span class="material-symbols-outlined text-[#8eadcc]">chevron_right</span>
          </a>
          <a @click="showAlert('Number Notation')" class="flex items-center gap-4 bg-[#101a23] p-4 rounded-lg min-h-[72px] cursor-pointer">
            <div class="flex flex-col flex-grow justify-center">
              <p class="text-base font-medium">Number Notation</p>
              <p class="text-[#8eadcc] text-sm">Scientific</p>
            </div>
            <span class="material-symbols-outlined text-[#8eadcc]">chevron_right</span>
          </a>
          <div class="flex items-center gap-4 bg-[#101a23] p-4 rounded-lg min-h-[72px]">
            <div class="flex flex-col flex-grow justify-center">
              <p class="text-base font-medium">Notification Settings</p>
              <p class="text-[#8eadcc] text-sm">Enable or disable game notifications</p>
            </div>
            <label class="relative flex h-8 w-14 cursor-pointer items-center rounded-full bg-[#21364a] transition-colors has-[:checked]:bg-[#3899fa]">
              <div class="h-6 w-6 rounded-full bg-white transition-transform duration-300 ease-in-out transform translate-x-1 has-[:checked]:translate-x-7" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px;"></div>
              <input type="checkbox" class="sr-only" @change="showAlert('Notification Settings')" />
            </label>
          </div>
        </div>
        <div class="mt-8">
          <h2 class="px-4 text-lg font-bold text-[#8eadcc]">Danger Zone</h2>
          <div class="mt-2 bg-[#101a23] p-4 rounded-lg">
            <button @click="eraseData" class="w-full flex items-center justify-center rounded-lg h-12 px-4 bg-red-600/20 text-red-400 text-base font-bold transition-colors hover:bg-red-600/30">
              <span class="material-symbols-outlined mr-2">delete_forever</span>
              <span>Erase All Data</span>
            </button>
            <p class="mt-2 text-center text-xs text-[#8eadcc]">This action is irreversible and requires multiple confirmations.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $wipeData } = useNuxtApp() as any;

const showAlert = (feature: string) => {
  alert(`${feature} - Not yet implemented.`);
};

const eraseData = () => {
  if (confirm('Are you sure you want to erase all data? This cannot be undone.')) {
    if (confirm('Please confirm one more time. This will permanently delete your save file.')) {
      $wipeData();
    }
  }
};
</script>
