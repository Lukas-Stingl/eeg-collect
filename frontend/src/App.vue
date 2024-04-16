<template>
  <div id="app">
    <!-- Application Header with Menu Button -->
    <header>
      <h1 class="app-title">EEG Aufnahme</h1>
    </header>

    <!-- Content Area with left margin -->
    <div v-if="isPassphraseValid" class="content" :style="{ marginLeft: isMenuOpen ? '200px' : '0' }">
      <router-view></router-view>
    </div>
    <div v-else class="forbidden">403 Forbidden</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isMenuOpen: false,
      isPassphraseValid: false
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    checkPassphrase() {
      const urlParams = new URLSearchParams(window.location.search);
      const passphraseParam = urlParams.get('aHCWFRZvlU');
      if (passphraseParam) {
        const decodedPassphrase = atob(passphraseParam);
        this.isPassphraseValid = decodedPassphrase === 'iism4ever';
      }
    }
  },
  mounted() {
    this.checkPassphrase();
  }
};
</script>

<style>
/* Add this style for the forbidden message */
.forbidden {
  margin-top: 57px; /* Same as the top value of the menu */
  padding: 20px; /* Add some padding for better readability */
  text-align: center;
  font-size: 24px;
  color: red;
}
#app {
  font-family: 'Arial', sans-serif;
  overflow-x: hidden; /* Hide horizontal scrollbar when content overflows */
}

/* Application Header Styles */
header {
  background-color: #00876C;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 10px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1; /* Ensure the header is above the menu */
}

.app-title {
  flex-grow: 1;
  margin: 0;
}

.menu-button {
  cursor: pointer;
  font-size: 20px;
  margin-right: 10px;
}

/* Menu Styles */
.menu {
  background-color: rgba(0, 135, 108, 0.7); /* Opacity set to 70% */
  color: #fff;
  position: fixed;
  top: 57px; /* Adjusted top value */
  left: 0;
  bottom: 0;
  width: 200px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 0; /* Ensure the menu is behind the header */
}

.menu-item {
  color: #fff;
  text-decoration: none;
  padding: 8px;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: #404040;
}

.menu-separator {
  margin-top: auto; /* Adjusted to set margin-top to auto */
  margin-bottom: 5px;
  border-top: 1px solid #fff;
}

/* Content Area Styles */
.content {
  margin-top: 57px; /* Same as the top value of the menu */
  padding: 20px; /* Add some padding for better readability */
  transition: margin-left 0.3s ease; /* Smooth transition for the margin change */
}
</style>
