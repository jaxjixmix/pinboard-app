<template>
  <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
    <div class="sidebar-toggle" @click="store.commit('TOGGLE_SIDEBAR')">
      <span class="toggle-icon">{{ sidebarOpen ? "◂" : "▸" }}</span>
    </div>

    <div class="sidebar-content" v-show="sidebarOpen">
      <!-- Header -->
      <header class="sidebar-header">
        <h1 class="brand">Pinboard</h1>
        <span class="count">{{ locationCount }} saved</span>
      </header>

      <!-- Pending save dialog -->
      <div v-if="hasPending" class="pending-card">
        <div class="pending-label">New pin</div>
        <div v-if="isGeocoding" class="pending-address loading">
          Resolving address…
        </div>
        <div v-else class="pending-address">
          {{ geocodedAddress }}
        </div>
        <div class="pending-coords">
          {{ pendingLocation.lat.toFixed(6) }}, {{ pendingLocation.lng.toFixed(6) }}
        </div>
        <div class="pending-actions">
          <button class="btn btn-save" :disabled="isGeocoding" @click="save">
            Save
          </button>
          <button class="btn btn-cancel" @click="cancel">Dismiss</button>
        </div>
      </div>

      <!-- Hint when no pending and no locations -->
      <div
        v-if="!hasPending && locationCount === 0"
        class="empty-state"
      >
        <div class="empty-icon">⊕</div>
        <p>Click anywhere on the map to pin a location</p>
      </div>

      <!-- Saved locations list -->
      <ul class="location-list" v-if="locationCount > 0">
        <li
          v-for="loc in locations"
          :key="loc.id"
          :ref="setItemRef(loc.id)"
          class="location-item"
          :class="{ selected: selectedLocationId === loc.id }"
          @click="store.commit('CLEAR_PENDING'); store.commit('SELECT_LOCATION', loc.id); $emit('flyTo', loc.latitude, loc.longitude)"
        >
          <div class="loc-address">{{ loc.address }}</div>
          <div class="loc-meta">
            <span class="loc-coords">
              {{ loc.latitude.toFixed(4) }}, {{ loc.longitude.toFixed(4) }}
            </span>
            <span class="loc-date">{{ formatDate(loc.created_at) }}</span>
          </div>
          <button
            class="btn-delete"
            @click.stop="store.dispatch('deleteLocation', loc.id)"
            title="Remove"
          >
            ×
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { computed, watch, nextTick, ref } from "vue";
import { useStore } from "vuex";

defineEmits(["flyTo"]);

const store = useStore();

const sidebarOpen = computed(() => store.state.sidebarOpen);
const locations = computed(() => store.state.locations);
const locationCount = computed(() => store.getters.locationCount);
const hasPending = computed(() => store.getters.hasPending);
const pendingLocation = computed(() => store.state.pendingLocation);
const geocodedAddress = computed(() => store.state.geocodedAddress);
const isGeocoding = computed(() => store.state.isGeocoding);
const selectedLocationId = computed(() => store.state.selectedLocationId);

const itemRefs = ref({});

function setItemRef(id) {
  return (el) => {
    if (el) itemRefs.value[id] = el;
  };
}

// Auto-scroll to selected item when it changes
watch(selectedLocationId, async (id) => {
  if (!id || !sidebarOpen.value) return;
  await nextTick();
  const el = itemRefs.value[id];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

function save() {
  store.dispatch("saveLocation");
}

function cancel() {
  store.commit("CLEAR_PENDING");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
