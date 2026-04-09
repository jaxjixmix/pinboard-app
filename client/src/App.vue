<template>
  <div class="app">
    <MapView ref="mapRef" />
    <SearchBar @flyTo="handleFlyTo" />
    <LocationList @flyTo="handleFlyTo" />
    <SaveToast />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import MapView from "./components/MapView.vue";
import SearchBar from "./components/SearchBar.vue";
import LocationList from "./components/LocationList.vue";
import SaveToast from "./components/SaveToast.vue";

const store = useStore();
const mapRef = ref(null);

onMounted(() => {
  store.dispatch("fetchLocations");
});

function handleFlyTo(lat, lng) {
  mapRef.value?.flyTo(lat, lng);
}
</script>
