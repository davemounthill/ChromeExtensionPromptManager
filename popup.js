let currentPage = 1;
let currentPrompt = null;
let prompts = [];

// DOM elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const useCaseFilter = document.getElementById('useCaseFilter');
const tagsFilter = document.getElementById('tagsFilter');
const sortFilter = document.getElementById('sortFilter');
const promptList = document.getElementById('promptList');
const previousPageButton = document.getElementById('previousPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const exportButton = document.getElementById('exportButton');
const importInput = document.getElementById('importInput');
const importButton = document.getElementById('importButton');
const promptDetails = document.getElementById('promptDetails');
const promptTitle = document.getElementById('promptTitle');
const promptSummary = document.getElementById('promptSummary');
const showPromptButton = document.getElementById('showPromptButton');
const editPromptButton = document.getElementById('editPromptButton');
const usePromptButton = document.getElementById('usePromptButton');
const favoritePromptButton = document.getElementById('favoritePromptButton');
const createPromptForm = document.getElementById('createPromptForm');
const newPromptTitle = document.getElementById('newPromptTitle');
const newPromptSummary = document.getElementById('newPromptSummary');
const newPromptCategory = document.getElementById('newPromptCategory');
const newPromptUseCase = document.getElementById('newPromptUseCase');
const newPromptTags = document.getElementById('newPromptTags');
const cancelPromptButton = document.getElementById('cancelPromptButton');
const savePromptButton = document.getElementById('savePromptButton');

// Event listeners
searchInput.addEventListener('input', filterPrompts);
categoryFilter.addEventListener('input', filterPrompts);
useCaseFilter.addEventListener('input', filterPrompts);
tagsFilter.addEventListener('input', filterPrompts);
sortFilter.addEventListener('change', sortPrompts);
previousPageButton.addEventListener('click', goToPreviousPage);
nextPageButton.addEventListener('click', goToNextPage);
exportButton.addEventListener('click', exportPrompts);
importButton.addEventListener('click', importPrompts);
showPromptButton.addEventListener('click', showPrompt);
editPromptButton.addEventListener('click', editPrompt);
usePromptButton.addEventListener('click', usePrompt);
favoritePromptButton.addEventListener('click', favoritePrompt);
cancelPromptButton.addEventListener('click', cancelPrompt);
savePromptButton.addEventListener('click', savePrompt);

// Fetch prompts from storage
chrome.storage.sync.get('prompts', (data) => {
    if (data.prompts) {
        prompts = data.prompts;
        renderPrompts();
    }
});

// Filter prompts based on search and filters
function filterPrompts() {
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value.toLowerCase();
    const useCase = useCaseFilter.value.toLowerCase();
    const tags = tagsFilter.value.toLowerCase().split(',');

    const filteredPrompts = prompts.filter((prompt) => {
        const promptTags = prompt.tags.toLowerCase().split(',');
        return (
            prompt.title.toLowerCase().includes(search) &&
            prompt.category.toLowerCase().includes(category) &&
            prompt.useCase.toLowerCase().includes(useCase) &&
            tags.every((tag) => promptTags.includes(tag.trim()))
        );
    });

    renderPrompts(filteredPrompts);
}

// Sort prompts based on the selected sort filter
function sortPrompts() {
    const sort = sortFilter.value;
    const sortedPrompts = [...prompts].sort((a, b) => a[sort].localeCompare(b[sort]));
    renderPrompts(sortedPrompts);
}

// Render prompts in the prompt list
function renderPrompts(promptsToRender = prompts) {
    promptList.innerHTML = '';
    promptsToRender.forEach((prompt, index) => {
        const promptElement = document.createElement('div');
        promptElement.textContent = prompt.title;
        promptElement.addEventListener('click', () => selectPrompt(index));
        promptList.appendChild(promptElement);
    });
}

// Select a prompt and show its details
function selectPrompt(index) {
    currentPrompt = prompts[index];
    promptTitle.textContent = currentPrompt.title;
    promptSummary.textContent = currentPrompt.summary;
    promptDetails.style.display = 'block';
    createPromptForm.style.display = 'none';
}

// Go to the previous page of prompts
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPrompts();
    }
}

// Go to the next page of prompts
function goToNextPage() {
    currentPage++;
    renderPrompts();
}

// Export prompts to a JSON file
function exportPrompts() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(prompts)], {
        type: 'application/json'
    }));
    a.download = 'prompts.json';
    a.click();
}

// Import prompts from a JSON file
function importPrompts() {
    const file = importInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (evt) => {
            prompts = JSON.parse(evt.target.result);
            chrome.storage.sync.set({prompts});
            renderPrompts();
        };
        reader.onerror = (evt) => {
            console.error('Error reading file');
        };
    }
}

// Show the full prompt
function showPrompt() {
    alert(currentPrompt.prompt);
}

// Edit the current prompt
function editPrompt() {
    newPromptTitle.value = currentPrompt.title;
    newPromptSummary.value = currentPrompt.summary;
    newPromptCategory.value = currentPrompt.category;
    newPromptUseCase.value = currentPrompt.useCase;
    newPromptTags.value = currentPrompt.tags;
    promptDetails.style.display = 'none';
    createPromptForm.style.display = 'block';
}

// Use the current prompt
function usePrompt() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {prompt: currentPrompt.prompt});
    });
}

// Favorite the current prompt
function favoritePrompt() {
    currentPrompt.favorite = !currentPrompt.favorite;
    chrome.storage.sync.set({prompts});
    renderPrompts();
}

// Cancel creating a new prompt
function cancelPrompt() {
    newPromptTitle.value = '';
    newPromptSummary.value = '';
    newPromptCategory.value = '';
    newPromptUseCase.value = '';
    newPromptTags.value = '';
    promptDetails.style.display = 'block';
    createPromptForm.style.display = 'none';
}

// Save a new prompt
function savePrompt() {
    const title = newPromptTitle.value;
    const summary = newPromptSummary.value;
    const category = newPromptCategory.value;
    const useCase = newPromptUseCase.value;
    const tags = newPromptTags.value;

    if (title && summary && category && useCase && tags) {
        const newPrompt = {
            title,
            summary,
            category,
            useCase,
            tags,
            prompt: `${title}\n\n${summary}\n\nCategory: ${category}\nUse Case: ${useCase}\nTags: ${tags}`
        };

        prompts.push(newPrompt);
        chrome.storage.sync.set({prompts});

        newPromptTitle.value = '';
        newPromptSummary.value = '';
        newPromptCategory.value = '';
        newPromptUseCase.value = '';
        newPromptTags.value = '';

        promptDetails.style.display = 'block';
        createPromptForm.style.display = 'none';

        renderPrompts();
    } else {
        alert('Please fill out all fields.');
    }
}
