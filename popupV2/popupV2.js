// Variables
let prompts = [];
let filteredPrompts = [];
let favorites = [];
let currentPage = 1;
const promptsPerPage = 10;

// DOM Elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const useCaseFilter = document.getElementById('use-case-filter');
const tagFilter = document.getElementById('tag-filter');
const promptList = document.getElementById('prompt-list');
const previousPageButton = document.getElementById('previous-page');
const nextPageButton = document.getElementById('next-page');
const exportButton = document.getElementById('export-button');
const importInput = document.getElementById('import-input');

// Function to update the display of the prompt list
function updatePromptList() {
  promptList.innerHTML = '';

  const startIndex = (currentPage - 1) * promptsPerPage;
  const endIndex = startIndex + promptsPerPage;
  const promptsToDisplay = filteredPrompts.slice(startIndex, endIndex);

  promptsToDisplay.forEach((prompt) => {
    const promptItem = document.createElement('div');
    promptItem.classList.add('prompt-item');
    promptItem.dataset.promptId = prompt.id;

    const promptTitle = document.createElement('span');
    promptTitle.textContent = prompt.title;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => openEditPromptModal(prompt));

    const useButton = document.createElement('button');
    useButton.textContent = 'Use in ChatGPT';
    useButton.addEventListener('click', () => usePromptInChatGPT(prompt));

    promptItem.appendChild(promptTitle);
    promptItem.appendChild(editButton);
    promptItem.appendChild(useButton);
    promptList.appendChild(promptItem);
  });

  updatePagination();
}

// Function to open the edit prompt modal
function openEditPromptModal(prompt) {
  // Implement your modal logic here
}

// Function to use the prompt in ChatGPT
function usePromptInChatGPT(prompt) {
  // Implement the logic to inject the prompt into ChatGPT here
}

// Function to update the pagination buttons
function updatePagination() {
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === Math.ceil(filteredPrompts.length / promptsPerPage);
}

// Event listener for search input
searchInput.addEventListener('input', () => {
  const searchQuery = searchInput.value.toLowerCase();
  filteredPrompts = prompts.filter((prompt) => prompt.title.toLowerCase().includes(searchQuery));
  currentPage = 1;
  updatePromptList();
});

// Event listener for category filter
categoryFilter.addEventListener('change', () => {
  const categoryValue = categoryFilter.value;
  filteredPrompts = categoryValue ? prompts.filter((prompt) => prompt.category === categoryValue) : prompts;
  currentPage = 1;
  updatePromptList();
});

// Event listener for use case filter
useCaseFilter.addEventListener('change', () => {
  const useCaseValue = useCaseFilter.value;
  filteredPrompts = useCaseValue ? prompts.filter((prompt) => prompt.useCase === useCaseValue) : prompts;
  currentPage = 1;
  updatePromptList();
});

// Event listener for tag filter
tagFilter.addEventListener('change', () => {
  const tagValue = tagFilter.value;
  filteredPrompts = tagValue ? prompts.filter((prompt) => prompt.tags.includes(tagValue)) : prompts;
  currentPage = 1;
  updatePromptList();
});

// Event listener for previous page button
previousPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    updatePromptList();
  }
});

// Event listener for next page button
nextPageButton.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updatePromptList();
  }
});

// Function to export data as JSON
function exportData() {
  const data = {
    prompts: prompts,
    favorites: favorites
  };
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prompts.json';
  link.click();
}

// Function to import data from JSON
function importData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const data = JSON.parse(content);
    prompts = data.prompts || [];
    filteredPrompts = prompts;
    favorites = data.favorites || [];
    currentPage = 1;
    updatePromptList();
  };
  reader.readAsText(file);
}

// Event listener for export button
exportButton.addEventListener('click', exportData);

// Event listener for import input
importInput.addEventListener('change', importData);

// Load initial data from storage
function loadData() {
  chrome.storage.sync.get(['prompts', 'favorites'], function (data) {
    prompts = data.prompts || [];
    filteredPrompts = prompts;
    favorites = data.favorites || [];
    currentPage = 1;
    updatePromptList();
  });
}

// Save data to storage
function saveData() {
  const data = {
    prompts: prompts,
    favorites: favorites
  };
  chrome.storage.sync.set(data);
}

// Load initial data
loadData();

// Save data on page unload
window.addEventListener('unload', saveData);