const list = document.getElementById("channel-list");
const placeholder = document.getElementById("preview-placeholder");
const previewContent = document.getElementById("preview-content");
const previewImage = document.getElementById("preview-image");
const channelNumber = document.getElementById("channel-number");
const channelTitle = document.getElementById("channel-title");
const channelCategory = document.getElementById("channel-category");

export const showPreview = (channel) => {
  channelNumber.textContent = channel.channelNumber;
  channelTitle.textContent = channel.name;
  channelCategory.textContent = channel.category;
  previewImage.src = channel.previewImage;
  previewImage.alt = channel.name;

  placeholder.classList.add("hidden");
  previewContent.classList.remove("hidden");
};

const actionButtons = (isFavorite, inBlacklist) =>
  inBlacklist
    ? `<button data-action="restore" class="rounded bg-gray-600 px-2 py-1 text-xs">Restaurer</button>
       <button data-action="delete" class="rounded bg-gray-600 px-2 py-1 text-xs">Supprimer</button>`
    : `<button data-action="favorite" class="text-xl text-yellow-400">${isFavorite ? "★" : "☆"}</button>
       <button data-action="blacklist" class="text-lg" title="Cacher">🚫</button>`;

export const afficher = (channels, inBlacklist = false) => {
  if (channels.length === 0) {
    list.innerHTML = `<p class="p-4 text-center text-sm text-gray-400">
      ${inBlacklist ? "La liste noire est vide." : "Aucune chaîne trouvée."}
    </p>`;
    return;
  }

  list.innerHTML = channels
    .map(
      ({ id, channelNumber, name, logo, category, isFavorite }) => `
        <li data-id="${id}" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700">
          <img src="${logo}" alt="${name}" class="h-10 w-10 rounded-2xl object-cover">
          <div class="flex-1">
            <p class="text-sm font-medium">${channelNumber} · ${name}</p>
            <p class="text-xs text-gray-400">${category}</p>
          </div>
          ${actionButtons(isFavorite, inBlacklist)}
        </li>`
    )
    .join("");
};