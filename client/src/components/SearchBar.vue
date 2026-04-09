<template>
  <div class="search-bar" :class="{ 'has-results': showResults, 'sidebar-open': sidebarOpen }">
    <div class="search-input-wrap">
      <svg class="search-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" stroke-width="1.8" />
        <line x1="13" y1="13" x2="17" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Search for an address or place..."
        class="search-input"
        @input="onInput"
        @focus="showResults = searchResults.length > 0"
        @keydown.escape="clear"
      />
      <button v-if="query" class="search-clear" @click="clear">&times;</button>
    </div>

    <ul v-if="showResults" class="search-results">
      <li v-if="isSearching" class="search-loading">Searching...</li>
      <li
        v-for="(result, i) in searchResults"
        :key="i"
        class="search-result-item"
        @mousedown.prevent="selectResult(result)"
      >
        <span class="result-address">{{ result.address }}</span>
        <span class="result-coords">
          {{ result.lat.toFixed(4) }}, {{ result.lng.toFixed(4) }}
        </span>
      </li>
      <li v-if="!isSearching && searchResults.length === 0 && query.length >= 2" class="search-empty">
        No results found
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

const emit = defineEmits(["flyTo"]);
const store = useStore();

const query = ref("");
const inputRef = ref(null);
const showResults = ref(false);

let debounceTimer = null;

const searchResults = computed(() => store.state.searchResults);
const isSearching = computed(() => store.state.isSearching);
const sidebarOpen = computed(() => store.state.sidebarOpen);

function onInput() {
  clearTimeout(debounceTimer);
  if (query.value.trim().length < 2) {
    store.commit("CLEAR_SEARCH");
    showResults.value = false;
    return;
  }
  showResults.value = true;
  debounceTimer = setTimeout(() => {
    store.dispatch("searchAddress", query.value);
  }, 350);
}

function selectResult(result) {
  store.dispatch("selectSearchResult", result);
  emit("flyTo", result.lat, result.lng);
  query.value = "";
  showResults.value = false;
}

function clear() {
  query.value = "";
  store.commit("CLEAR_SEARCH");
  showResults.value = false;
}

watch(searchResults, (results) => {
  if (results.length > 0) {
    showResults.value = true;
  }
});
</script>
