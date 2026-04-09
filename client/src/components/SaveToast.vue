<template>
  <Transition name="toast">
    <div v-if="showToast" class="save-toast">
      <div class="toast-label">New pin</div>
      <div v-if="isGeocoding" class="toast-address loading">Resolving address...</div>
      <div v-else class="toast-address">{{ geocodedAddress }}</div>
      <div class="toast-coords">
        {{ pendingLocation.lat.toFixed(6) }}, {{ pendingLocation.lng.toFixed(6) }}
      </div>
      <div class="toast-actions">
        <button class="btn btn-save" :disabled="isGeocoding" @click="save">Save</button>
        <button class="btn btn-cancel" @click="cancel">Dismiss</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const sidebarOpen = computed(() => store.state.sidebarOpen);
const hasPending = computed(() => store.getters.hasPending);
const pendingLocation = computed(() => store.state.pendingLocation);
const geocodedAddress = computed(() => store.state.geocodedAddress);
const isGeocoding = computed(() => store.state.isGeocoding);

// Only show when sidebar is collapsed and there's a pending location
const showToast = computed(() => !sidebarOpen.value && hasPending.value);

function save() {
  store.dispatch("saveLocation");
}

function cancel() {
  store.commit("CLEAR_PENDING");
}
</script>
