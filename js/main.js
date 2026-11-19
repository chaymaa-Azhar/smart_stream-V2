import { fetchchannel, setFavorite } from "./api.js";
import { afficher } from "./ui.js";

const loader = document.querySelector("#loader");
const errorBox = document.querySelector("#error");
const errorMessage = document.querySelector("#error-msg");

const searchInput = document.querySelector("#search-input");
const categoryToggle = document.querySelector("#category-toggle");
const categoryMenu = document.querySelector("#category-menu");
const categoryLabel = document.querySelector("#category-label");
const showAllBtn = document.querySelector("#show-all");
const showFavBtn = document.querySelector("#show-favorites");

let view = localStorage.getItem("view") || "all";

let allchannels = [];
let selectedCategory = "TOUS";

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
    const notBlacklisted = !channel.isBlacklisted;
    const matchView = view === "all" || channel.isFavorite;

    const matchCategory =
      selectedCategory === "TOUS" || channel.category === selectedCategory;

    const matchText =
      channel.name.toLowerCase().includes(text) ||
      String(channel.channelNumber).includes(text);

    return notBlacklisted && matchView && matchCategory && matchText;
  });

  afficher(filtered, toggleFavorite);
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

document.querySelector("#retry").addEventListener("click", init);




//update
const updateViewButtons = () => {
  showAllBtn.classList.toggle("bg-gray-500", view === "all");
  showAllBtn.classList.toggle("bg-gray-700", view !== "all");
  showFavBtn.classList.toggle("bg-gray-500", view === "favorites");
  showFavBtn.classList.toggle("bg-gray-700", view !== "favorites");
};

const setView = (newView) => {
  view = newView;
  localStorage.setItem("view", newView);
  updateViewButtons();
  applyFilters();
};

//.......
showAllBtn.addEventListener("click", () => setView("all"));
showFavBtn.addEventListener("click", () => setView("favorites"));
updateViewButtons();
init();
