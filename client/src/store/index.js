import { createStore } from "vuex";

const API_BASE = "/api";

export default createStore({
  state() {
    return {
      locations: [],
      pendingLocation: null, // { lat, lng } awaiting geocode/save
      geocodedAddress: null, // resolved address string
      isGeocoding: false,
      sidebarOpen: true,
      selectedLocationId: null,
      searchResults: [],
      isSearching: false,
    };
  },

  mutations: {
    SET_LOCATIONS(state, locations) {
      state.locations = locations;
    },
    ADD_LOCATION(state, location) {
      state.locations.unshift(location);
    },
    REMOVE_LOCATION(state, id) {
      state.locations = state.locations.filter((l) => l.id !== id);
      if (state.selectedLocationId === id) {
        state.selectedLocationId = null;
      }
    },
    SET_PENDING(state, coords) {
      state.pendingLocation = coords;
      state.geocodedAddress = null;
    },
    SET_GEOCODED_ADDRESS(state, address) {
      state.geocodedAddress = address;
    },
    SET_GEOCODING(state, val) {
      state.isGeocoding = val;
    },
    CLEAR_PENDING(state) {
      state.pendingLocation = null;
      state.geocodedAddress = null;
      state.isGeocoding = false;
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    SELECT_LOCATION(state, id) {
      state.selectedLocationId = id;
    },
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results;
    },
    SET_SEARCHING(state, val) {
      state.isSearching = val;
    },
    CLEAR_SEARCH(state) {
      state.searchResults = [];
      state.isSearching = false;
    },
  },

  actions: {
    async fetchLocations({ commit }) {
      const res = await fetch(`${API_BASE}/locations`);
      const data = await res.json();
      commit("SET_LOCATIONS", data);
    },

    async reverseGeocode({ commit }, { lat, lng }) {
      commit("SET_PENDING", { lat, lng });
      commit("SET_GEOCODING", true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        commit("SET_GEOCODED_ADDRESS", address);
      } catch {
        commit("SET_GEOCODED_ADDRESS", `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } finally {
        commit("SET_GEOCODING", false);
      }
    },

    async saveLocation({ commit, state }) {
      if (!state.pendingLocation || !state.geocodedAddress) return;

      const body = {
        latitude: state.pendingLocation.lat,
        longitude: state.pendingLocation.lng,
        address: state.geocodedAddress,
      };

      const res = await fetch(`${API_BASE}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const created = await res.json();
        commit("ADD_LOCATION", created);
        commit("CLEAR_PENDING");
      }
    },

    async searchAddress({ commit }, query) {
      if (!query || query.trim().length < 2) {
        commit("CLEAR_SEARCH");
        return;
      }
      commit("SET_SEARCHING", true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        const results = data.map((item) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
          type: item.type,
        }));
        commit("SET_SEARCH_RESULTS", results);
      } catch {
        commit("SET_SEARCH_RESULTS", []);
      } finally {
        commit("SET_SEARCHING", false);
      }
    },

    selectSearchResult({ commit, dispatch }, result) {
      commit("CLEAR_SEARCH");
      commit("SET_PENDING", { lat: result.lat, lng: result.lng });
      commit("SET_GEOCODED_ADDRESS", result.address);
    },

    async deleteLocation({ commit }, id) {
      const res = await fetch(`${API_BASE}/locations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        commit("REMOVE_LOCATION", id);
      }
    },
  },

  getters: {
    locationCount: (state) => state.locations.length,
    hasPending: (state) => state.pendingLocation !== null,
  },
});
