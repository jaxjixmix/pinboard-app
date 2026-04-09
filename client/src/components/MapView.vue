<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useStore } from "vuex";
import L from "leaflet";

const store = useStore();
const mapContainer = ref(null);

let map = null;
let pendingMarker = null;
const savedMarkers = new Map();

// Standard OpenStreetMap tiles — full color street map
const TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Custom marker icons
const pendingIcon = L.divIcon({
  className: "pin-pending",
  html: `<div class="pin-marker pending"><div class="pin-ring"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const savedIcon = L.divIcon({
  className: "pin-saved",
  html: `<div class="pin-marker saved"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const locations = computed(() => store.state.locations);
const pendingLocation = computed(() => store.state.pendingLocation);

onMounted(() => {
  // Default center: Sydney CBD
  map = L.map(mapContainer.value, {
    center: [-33.8688, 151.2093],
    zoom: 13,
    zoomControl: false,
  });

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: 19,
  }).addTo(map);

  // Zoom control bottom-right
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // Click to select location
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    store.dispatch("reverseGeocode", { lat, lng });
  });

  // Render existing saved locations
  renderSavedMarkers();
});

// Watch pending location for the pulsing marker
watch(pendingLocation, (coords) => {
  if (pendingMarker) {
    map.removeLayer(pendingMarker);
    pendingMarker = null;
  }
  if (coords) {
    pendingMarker = L.marker([coords.lat, coords.lng], { icon: pendingIcon }).addTo(map);
  }
});

// Watch saved locations list
watch(
  locations,
  () => {
    renderSavedMarkers();
  },
  { deep: true }
);

function renderSavedMarkers() {
  // Remove stale markers
  for (const [id, marker] of savedMarkers) {
    if (!locations.value.find((l) => l.id === id)) {
      map.removeLayer(marker);
      savedMarkers.delete(id);
    }
  }
  // Add new markers
  for (const loc of locations.value) {
    if (!savedMarkers.has(loc.id)) {
      const marker = L.marker([loc.latitude, loc.longitude], { icon: savedIcon })
        .bindTooltip(loc.address, {
          className: "pin-tooltip",
          direction: "top",
          offset: [0, -10],
        })
        .on("click", () => {
          map.flyTo([loc.latitude, loc.longitude], 16, { duration: 0.8 });
          store.commit("CLEAR_PENDING");
          store.commit("SELECT_LOCATION", loc.id);
        })
        .addTo(map);
      savedMarkers.set(loc.id, marker);
    }
  }
}

// Expose flyTo for parent to call
function flyTo(lat, lng) {
  if (map) {
    map.flyTo([lat, lng], 16, { duration: 0.8 });
  }
}

defineExpose({ flyTo });
</script>
