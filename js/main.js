import { fetchchannel, setFavorite, setBlacklisted, deleteChannel } from "./api.js";
import { afficher, showPreview } from "./ui.js";

const loader = document.querySelector("#loader");
const errorBox = document.querySelector("#error");
const errorMessage = document.querySelector("#error-msg");

const list = document.querySelector("#channel-list");
const searchInput = document.querySelector("#search-input");
const categoryToggle = document.querySelector("#category-toggle");
const categoryMenu = document.querySelector("#category-menu");
const categoryLabel = document.querySelector("#category-label");

const viewButtons = {
  all: document.querySelector("#show-all"),
  favorites: document.querySelector("#show-favorites"),
  blacklist: document.querySelector("#show-blacklist"),
};

let allchannels = [];
let selectedCategory = "TOUS";
let view = localStorage.getItem("view") || "all";

const showLoader = () => loader.classList.remove("hidden");
const hideLoader = () => loader.classList.add("hidden");

const showError = (message) => {
  errorMessage.textContent = message;
  errorBox.classList.remove("hidden");
};
const hideError = () => errorBox.classList.add("hidden");

const applyFilters = () => {
  const text = searchInput.value.trim().toLowerCase();

  const filtered = allchannels.filter((channel) => {
    const matchView =
      view === "blacklist"
        ? channel.isBlacklisted
        : !channel.isBlacklisted && (view === "all" || channel.isFavorite);

    const matchCategory =
      selectedCategory === "TOUS" || channel.category === selectedCategory;

    const matchText =
      channel.name.toLowerCase().includes(text) ||
      String(channel.channelNumber).includes(text);

    return matchView && matchCategory && matchText;
  });

  afficher(filtered, view === "blacklist");
};

const toggleFavorite = async (id) => {
  const channel = allchannels.find((c) => c.id === id);
  const newValue = !channel.isFavorite;

  try {
    await setFavorite(id, newValue);
    channel.isFavorite = newValue;
    applyFilters();
  } catch (error) {
    showError(error.message);
  }
};

const changeBlacklist = async (id, value) => {
  const channel = allchannels.find((c) => c.id === id);

  try {
    await setBlacklisted(id, value);
    channel.isBlacklisted = value;
    applyFilters();
  } catch (error) {
    showError(error.message);
  }
};

const removeChannel = async (id) => {
  if (!confirm("Supprimer définitivement cette chaîne ?")) return;

  try {
    await deleteChannel(id);
    allchannels = allchannels.filter((c) => c.id !== id);
    applyFilters();
  } catch (error) {
    showError(error.message);
  }
};

const updateViewButtons = () => {
  Object.entries(viewButtons).forEach(([name, button]) => {
    button.classList.toggle("bg-gray-500", view === name);
    button.classList.toggle("bg-gray-700", view !== name);
  });
};

const setView = (newView) => {
  view = newView;
  localStorage.setItem("view", newView);
  updateViewButtons();
  applyFilters();
};

const init = async () => {
  hideError();
  showLoader();

  try {
    allchannels = await fetchchannel();
    applyFilters();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
};

// Un seul écouteur pour toute la liste
list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;

  const id = item.dataset.id;
  const action = event.target.closest("[data-action]")?.dataset.action;

  if (action === "favorite") {
    toggleFavorite(id);
  } else if (action === "blacklist") {
    changeBlacklist(id, true);
  } else if (action === "restore") {
    changeBlacklist(id, false);
  } else if (action === "delete") {
    removeChannel(id);
  } else {
    showPreview(allchannels.find((c) => c.id === id));
  }
});

searchInput.addEventListener("input", applyFilters);

categoryToggle.addEventListener("click", () => {
  categoryMenu.classList.toggle("hidden");
});

categoryMenu.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    categoryLabel.textContent = button.textContent;
    categoryMenu.classList.add("hidden");
    applyFilters();
  });
});

Object.entries(viewButtons).forEach(([name, button]) => {
  button.addEventListener("click", () => setView(name));
});

document.querySelector("#retry").addEventListener("click", init);

updateViewButtons();
init();