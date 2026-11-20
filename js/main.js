import { fetchchannel, setFavorite, setBlacklisted, deleteChannel,addchannel } from "./api.js";
import { afficher, showPreview } from "./ui.js";

const loader = document.querySelector("#loader");
const errorBox = document.querySelector("#error");
const errorMessage = document.querySelector("#error-msg");

const list = document.querySelector("#channel-list");
const searchInput = document.querySelector("#search-input");
const categoryToggle = document.querySelector("#category-toggle");
const categoryMenu = document.querySelector("#category-menu");
const categoryLabel = document.querySelector("#category-label");

//formulaire
const toggleAddBtn = document.querySelector("#toggle-add");
const addForm = document.querySelector("#add-form");
const addError = document.querySelector("#add-error");
//formulaire

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



//erreur
const showFormError = (message) => {
  addError.textContent = message;
  addError.classList.remove("hidden");
};

const submitChannel = async (event) => {
  event.preventDefault();

  const channelNumber = document.querySelector("#add-number").value.trim();
  const name = document.querySelector("#add-name").value.trim();
  const category = document.querySelector("#add-category").value;
  const logo = document.querySelector("#add-logo").value.trim();

  if (channelNumber==='' || name==='') {
    showFormError("Le numéro et le nom sont obligatoires.");
    return;
  }

  if (allchannels.some((c) => c.channelNumber === channelNumber)) {
    showFormError("Ce numéro existe déjà.");
    return;
  }

  addError.classList.add("hidden");
const newChannel = {
    channelNumber,
    name,
    category,
    logo,
    isFavorite: false,
    isBlacklisted: false,
  };

  try {
    const created = await addchannel(newChannel);
    allchannels.push(created);
    addForm.reset();
    addForm.classList.add("hidden");
    setView("all");
  } catch (error) {
    showFormError(error.message);
  }
};
toggleAddBtn.addEventListener("click", () => addForm.classList.toggle("hidden"));
addForm.addEventListener("submit", submitChannel);

// //regex

// const NUMBER_REGEX = /^\d{3,4}$/;
// const NAME_REGEX = /^[A-Za-zÀ-ÿ0-9 .'&+-]{2,40}$/;
// const URL_REGEX = /^https?:\/\/\S+$/i;

// if (!NUMBER_REGEX.test(channelNumber)) {
//   showFormError("Le numéro doit contenir 3 ou 4 chiffres.");
//   return;
// }

// if (!NAME_REGEX.test(name)) {
//   showFormError("Le nom doit contenir entre 2 et 40 caractères valides.");
//   return;
// }

// if (logo && !URL_REGEX.test(logo)) {
//   showFormError("Le logo doit être un lien commençant par http:// ou https://");
//   return;
// }
init();