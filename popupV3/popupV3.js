
// Store the prompt data
let promptData = [];

// Get the DOM elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const useCaseFilter = document.getElementById('use-case-filter');
const tagFilter = document.getElementById('tag-filter');
const promptList = document.getElementById('prompt-list');
const createPromptBtn = document.getElementById('create-prompt-btn');

// Function to filter prompts based on search input and filter options
function filterPrompts() {
    const searchValue = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const useCaseValue = useCaseFilter.value;
    const tagValue = tagFilter.value;

    // Filter the prompts based on the search input and filter options
    const filteredPrompts = promptData.filter((prompt) => {
        const title = prompt.title.toLowerCase();
        const summary = prompt.summary.toLowerCase();
        const category = prompt.category;
        const useCase = prompt.useCase;
        const tags = prompt.tags;

        // Check if the prompt matches the search input
        if (title.includes(searchValue) || summary.includes(searchValue)) {
            // Check if the prompt matches the filter options
            if (
                (categoryValue === '' || category === categoryValue) &&
                (useCaseValue === '' || useCase === useCaseValue) &&
                (tagValue === '' || tags.includes(tagValue))
            ) {
                return true;
            }
        }

        return false;
    });

    // Update the prompt list display
    displayPrompts(filteredPrompts);
}

function filterPrompts() {
    const filteredPrompts = promptData.filter((prompt) => {
        const categoryMatch = filterCategory === '' || prompt.category.toLowerCase().includes(filterCategory.toLowerCase());
        const useCaseMatch = filterUseCase === '' || prompt.useCase.toLowerCase().includes(filterUseCase.toLowerCase());
        const tagsMatch = filterTags.length === 0 || filterTags.every((tag) => prompt.tags.includes(tag));

        return categoryMatch && useCaseMatch && tagsMatch;
    });

    displayPromptsForPage(filteredPrompts, 1);
    updatePaginationButtons(filteredPrompts);
}

// Function to handle category filter changes
function handleCategoryFilterChange(event) {
    filterCategory = event.target.value;
    filterPrompts();
}

// Function to handle use case filter changes
function handleUseCaseFilterChange(event) {
    filterUseCase = event.target.value;
    filterPrompts();
}

// Function to handle tags filter changes
function handleTagsFilterChange(event) {
    filterTags = event.target.value.split(',').map((tag) => tag.trim());
    filterPrompts();
}

// Event listener for the category filter input
categoryFilterInput.addEventListener('input', handleCategoryFilterChange);

// Event listener for the use case filter input
useCaseFilterInput.addEventListener('input', handleUseCaseFilterChange);

// Event listener for the tags filter input
tagsFilterInput.addEventListener('input', handleTagsFilterChange);

// Function to display the prompts in the prompt list
function displayPrompts(prompts) {
    promptList.innerHTML = '';

    prompts.forEach((prompt) => {
        const promptItem = document.createElement('div');
        promptItem.classList.add('prompt-item');

        const title = document.createElement('h3');
        title.textContent = prompt.title;

        const summary = document.createElement('p');
        summary.textContent = prompt.summary;

        promptItem.appendChild(title);
        promptItem.appendChild(summary);

        // Add event listener to show prompt modal when clicked
        promptItem.addEventListener('click', () => {
            // Show the modal with the prompt content
            showPromptModal(prompt);
        });

        promptList.appendChild(promptItem);
    });
}

// Function to show the modal with the prompt content
function showPromptModal(prompt) {
    const modal = document.getElementById('show-prompt-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Set the content of the modal
    modalContent.innerHTML = `
    <h3>${prompt.title}</h3>
    <p>${prompt.summary}</p>
    <!-- Add additional content for the prompt modal as needed -->
  `;

    // Display the modal
    modal.style.display = 'block';
}

// Event listeners for search input and filter options
searchInput.addEventListener('input', filterPrompts);
categoryFilter.addEventListener('change', filterPrompts);
useCaseFilter.addEventListener('change', filterPrompts);
tagFilter.addEventListener('change', filterPrompts);

// Event listener for the "Create New Prompt" button
createPromptBtn.addEventListener('click', () => {
    // Show the modal for creating a new prompt
    showCreatePromptModal();
});

// Function to show the modal for creating a new prompt
function showCreatePromptModal() {
    const modal = document.getElementById('edit-prompt-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Set the content of the modal for creating a new prompt
    modalContent.innerHTML = `
    <h3>Create New Prompt</h3>
    <form id="create-prompt-form">
      <label for="title-input">Title:</label>
      <input type="text" id="title-input" required>

      <label for="summary-input">Summary:</label>
      <textarea id="summary-input" required></textarea>

      <label for="category-input">Category:</label>
      <input type="text" id="category-input" required>

      <label for="use-case-input">Use Case:</label>
      <input type="text" id="use-case-input" required>

      <label for="tags-input">Tags (comma-separated):</label>
      <input type="text" id="tags-input" required>

      <button type="submit">Create</button>
    </form>
  `;

    // Add event listener for form submission
    const createPromptForm = document.getElementById('create-prompt-form');
    createPromptForm.addEventListener('submit', handleCreatePrompt);

    // Display the modal
    modal.style.display = 'block';
}

// Function to handle the form submission for creating a new prompt
function handleCreatePrompt(event) {
    event.preventDefault();

    // Get the form input values
    const titleInput = document.getElementById('title-input');
    const summaryInput = document.getElementById('summary-input');
    const categoryInput = document.getElementById('category-input');
    const useCaseInput = document.getElementById('use-case-input');
    const tagsInput = document.getElementById('tags-input');

    // Validate the form inputs
    if (
        titleInput.value.trim() === '' ||
        summaryInput.value.trim() === '' ||
        categoryInput.value.trim() === '' ||
        useCaseInput.value.trim() === '' ||
        tagsInput.value.trim() === ''
    ) {
        alert('Please fill in all the fields.');
        return;
    }

    // Create a new prompt object
    const newPrompt = {
        title: titleInput.value.trim(),
        summary: summaryInput.value.trim(),
        category: categoryInput.value.trim(),
        useCase: useCaseInput.value.trim(),
        tags: tagsInput.value.split(',').map((tag) => tag.trim()),
    };

    // Add the new prompt to the prompt data
    promptData.push(newPrompt);

    // Update the prompt list display
    filterPrompts();

    // Close the modal
    const modal = document.getElementById('edit-prompt-modal');
    modal.style.display = 'none';

    // Reset the form inputs
    createPromptForm.reset();
}

// Fetch and load the prompt data
function fetchPromptData() {
    // Make an API call or fetch the prompt data from the JSON/CSV file
    // Assign the fetched data to the promptData variable
    // For example:
    promptData = [
        {
            title: 'Prompt 1',
            summary: 'Summary of Prompt 1',
            category: 'Category 1',
            useCase: 'Use Case 1',
            tags: ['Tag 1', 'Tag 2']
        },
        {
            title: 'Prompt 2',
            summary: 'Summary of Prompt 2',
            category: 'Category 2',
            useCase: 'Use Case 2',
            tags: ['Tag 3', 'Tag 4']
        },
        // Add more prompt objects as needed
    ];

    // Display all prompts initially
    displayPrompts(promptData);
}

// Load the prompt data when the popup is opened
fetchPromptData();

// Function to inject the selected prompt into the ChatGPT text box
function injectPrompt(prompt) {
    // Find the ChatGPT text box on the page and inject the prompt
    const chatGptTextBox = document.querySelector('#chat-gpt .text-box');
    if (chatGptTextBox) {
        // Insert the prompt at the beginning of the text box
        chatGptTextBox.value = `${prompt}\n\n${chatGptTextBox.value}`;
    } else {
        alert('Unable to find the ChatGPT text box.');
    }
}

// Event listener for showing prompt modal when a prompt item is clicked
promptItem.addEventListener('click', () => {
    // Show the modal with the prompt content
    showPromptModal(prompt);

    // Inject the selected prompt into the ChatGPT text box
    injectPrompt(prompt.promptContent);
});

// Function to show the modal for editing a prompt
function showEditPromptModal(prompt) {
    const modal = document.getElementById('edit-prompt-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Set the content of the modal for editing a prompt
    modalContent.innerHTML = `
    <h3>Edit Prompt</h3>
    <form id="edit-prompt-form">
      <label for="edit-title-input">Title:</label>
      <input type="text" id="edit-title-input" value="${prompt.title}" required>

      <label for="edit-summary-input">Summary:</label>
      <textarea id="edit-summary-input" required>${prompt.summary}</textarea>

      <label for="edit-category-input">Category:</label>
      <input type="text" id="edit-category-input" value="${prompt.category}" required>

      <label for="edit-use-case-input">Use Case:</label>
      <input type="text" id="edit-use-case-input" value="${prompt.useCase}" required>

      <label for="edit-tags-input">Tags (comma-separated):</label>
      <input type="text" id="edit-tags-input" value="${prompt.tags.join(',')}" required>

      <button type="submit">Save</button>
    </form>
  `;

    // Add event listener for form submission
    const editPromptForm = document.getElementById('edit-prompt-form');
    editPromptForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleEditPrompt(prompt);
    });

    // Display the modal
    modal.style.display = 'block';
}

// Function to handle the form submission for editing a prompt
function handleEditPrompt(prompt) {
    // Get the form input values
    const editTitleInput = document.getElementById('edit-title-input');
    const editSummaryInput = document.getElementById('edit-summary-input');
    const editCategoryInput = document.getElementById('edit-category-input');
    const editUseCaseInput = document.getElementById('edit-use-case-input');
    const editTagsInput = document.getElementById('edit-tags-input');

    // Validate the form inputs
    if (
        editTitleInput.value.trim() === '' ||
        editSummaryInput.value.trim() === '' ||
        editCategoryInput.value.trim() === '' ||
        editUseCaseInput.value.trim() === '' ||
        editTagsInput.value.trim() === ''
    ) {
        alert('Please fill in all the fields.');
        return;
    }

    // Update the prompt with the edited values
    prompt.title = editTitleInput.value.trim();
    prompt.summary = editSummaryInput.value.trim();
    prompt.category = editCategoryInput.value.trim();
    prompt.useCase = editUseCaseInput.value.trim();
    prompt.tags = editTagsInput.value.split(',').map((tag) => tag.trim());

    // Update the prompt list display
    filterPrompts();

    // Close the modal
    const modal = document.getElementById('edit-prompt-modal');
    modal.style.display = 'none';

    // Reset the form inputs
    editPromptForm.reset();
}

// Function to display the prompts in the prompt list
function displayPrompts(prompts) {
    promptList.innerHTML = '';

    prompts.forEach((prompt, index) => {
        const promptItem = document.createElement('div');
        promptItem.classList.add('prompt-item');

        const title = document.createElement('h3');
        title.textContent = prompt.title;

        const summary = document.createElement('p');
        summary.textContent = prompt.summary;

        const details = document.createElement('div');
        details.classList.add('prompt-details');
        details.innerHTML = `
        <p><strong>Category:</strong> ${prompt.category}</p>
        <p><strong>Use Case:</strong> ${prompt.useCase}</p>
        <p><strong>Tags:</strong> ${prompt.tags.join(', ')}</p>
      `;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deletePrompt(index);
        });

        promptItem.appendChild(title);
        promptItem.appendChild(summary);
        promptItem.appendChild(details);
        promptItem.appendChild(deleteButton);

        // Add event listener to show prompt modal when clicked
        promptItem.addEventListener('click', () => {
            // Show the modal with the prompt content
            showPromptModal(prompt);

            // Inject the selected prompt into the ChatGPT text box
            injectPrompt(prompt.promptContent);
        });

        promptList.appendChild(promptItem);
    });
}

// Function to delete a prompt from the prompt data
function deletePrompt(index) {
    promptData.splice(index, 1);
    filterPrompts();
}

// Function to export the prompt data as a JSON file
function exportPromptData() {
    const filename = 'prompt_data.json';
    const data = JSON.stringify(promptData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}


// Event listener for the export button
exportButton.addEventListener('click', exportPromptData);

// Function to import prompt data from a JSON file
function importPromptData(file) {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
        const importedData = JSON.parse(event.target.result);

        // Validate the imported data (optional)
        if (!Array.isArray(importedData)) {
            alert('Invalid prompt data format.');
            return;
        }

        // Update the prompt data with the imported data
        promptData = importedData;

        // Update the prompt list display
        filterPrompts();
    });

    reader.readAsText(file);
}

// Event listener for the import button
importButton.addEventListener('change', (event) => {
    const file = event.target.files[0];
    importPromptData(file);
});

const itemsPerPage = 10; // Number of prompts to display per page
let currentPage = 1; // Current page number

// Function to display the prompts for the current page
function displayPromptsForPage(prompts, page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    const promptsForPage = prompts.slice(startIndex, endIndex);
    displayPrompts(promptsForPage);
}

// Function to update the pagination buttons
function updatePaginationButtons(prompts) {
    const totalPages = Math.ceil(prompts.length / itemsPerPage);

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Function to go to the previous page
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPromptsForPage(promptData, currentPage);
        updatePaginationButtons(promptData);
    }
}

// Function to go to the next page
function goToNextPage() {
    const totalPages = Math.ceil(promptData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPromptsForPage(promptData, currentPage);
        updatePaginationButtons(promptData);
    }
}

// Event listener for the previous page button
prevPageButton.addEventListener('click', goToPrevPage);

// Event listener for the next page button
nextPageButton.addEventListener('click', goToNextPage);

let sortBy = 'title'; // Default sorting criteria
let sortOrder = 'asc'; // Default sorting order

// Function to sort the prompt data based on the current sorting criteria and order
function sortPromptData() {
    promptData.sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'title') {
            comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'category') {
            comparison = a.category.localeCompare(b.category);
        } else if (sortBy === 'useCase') {
            comparison = a.useCase.localeCompare(b.useCase);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });
}

// Function to handle sorting option changes
function handleSortOptionChange(event) {
    sortBy = event.target.value;
    sortPromptData();
    displayPromptsForPage(promptData, currentPage);
}

// Function to handle sorting order changes
function handleSortOrderChange(event) {
    sortOrder = event.target.value;
    sortPromptData();
    displayPromptsForPage(promptData, currentPage);
}

// Event listener for the sort option select element
sortOptionSelect.addEventListener('change', handleSortOptionChange);

// Event listener for the sort order select element
sortOrderSelect.addEventListener('change', handleSortOrderChange);

const favoritePrompts = []; // Array to store favorite prompts

// Function to toggle a prompt as favorite
function toggleFavoritePrompt(prompt) {
    const index = favoritePrompts.findIndex((favPrompt) => favPrompt.title === prompt.title);

    if (index !== -1) {
        favoritePrompts.splice(index, 1);
    } else {
        favoritePrompts.push(prompt);
    }

    updateFavoriteButton(prompt);
}

// Function to check if a prompt is marked as favorite
function isPromptFavorite(prompt) {
    return favoritePrompts.some((favPrompt) => favPrompt.title === prompt.title);
}

// Function to update the favorite button state
function updateFavoriteButton(prompt) {
    const isFavorite = isPromptFavorite(prompt);
    const buttonText = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    const buttonClass = isFavorite ? 'remove-favorite' : 'add-favorite';

    favoriteButton.textContent = buttonText;
    favoriteButton.classList.remove('add-favorite', 'remove-favorite');
    favoriteButton.classList.add(buttonClass);
}

// Event listener for the favorite button
favoriteButton.addEventListener('click', () => {
    const selectedPrompt = promptData.find((prompt) => prompt.title === selectedPromptTitle);
    toggleFavoritePrompt(selectedPrompt);
    updateFavoriteButton(selectedPrompt);
});

// Function to save prompt data to Chrome storage
function savePromptData() {
    chrome.storage.sync.set({ promptData });
}

// Function to load prompt data from Chrome storage
function loadPromptData() {
    chrome.storage.sync.get(['promptData'], (result) => {
        if (result.promptData) {
            promptData = result.promptData;
            filterPrompts();
            updatePaginationButtons(promptData);
        }
    });
}

// Event listener for the save prompt data button
saveDataButton.addEventListener('click', savePromptData);

// Load prompt data from storage when the extension is opened
loadPromptData();

// Function to export prompt data as a JSON file
function exportPromptData() {
    const data = JSON.stringify(promptData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-data.json';
    a.click();

    URL.revokeObjectURL(url);
}

// Function to import prompt data from a JSON file
function importPromptData(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function () {
            const importedData = JSON.parse(reader.result);
            promptData = importedData;
            filterPrompts();
            updatePaginationButtons(promptData);
            savePromptData();
        };

        reader.readAsText(file);
    }
}

// Event listener for the export prompt data button
exportDataButton.addEventListener('click', exportPromptData);

// Event listener for the import prompt data input
importDataInput.addEventListener('change', importPromptData);

// Function to handle drag start event
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
    event.target.classList.add('dragging');
}

// Function to handle drag over event
function handleDragOver(event) {
    event.preventDefault();
    const draggableElement = document.querySelector('.dragging');
    const currentElement = event.target;
    const promptList = currentElement.closest('.prompt-list');

    if (promptList && draggableElement && draggableElement !== currentElement) {
        const fromIndex = parseInt(draggableElement.dataset.index, 10);
        const toIndex = parseInt(currentElement.dataset.index, 10);

        const movedPrompt = promptData.splice(fromIndex, 1)[0];
        promptData.splice(toIndex, 0, movedPrompt);

        filterPrompts();
        updatePaginationButtons(promptData);
    }
}

// Function to handle drag end event
function handleDragEnd() {
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
}

// Add event listeners for drag and drop events
promptList.addEventListener('dragstart', handleDragStart);
promptList.addEventListener('dragover', handleDragOver);
promptList.addEventListener('dragend', handleDragEnd);

const promptsPerPage = 5; // Number of prompts to display per page
let currentPage = 1; // Current page number

// Function to display prompts for the given page number
function displayPromptsForPage(prompts, page) {
    const startIndex = (page - 1) * promptsPerPage;
    const endIndex = startIndex + promptsPerPage;
    const displayedPrompts = prompts.slice(startIndex, endIndex);

    // Update the display of the prompt list based on the displayed prompts
}

// Function to update the pagination buttons based on the current page and total prompts
function updatePaginationButtons(prompts) {
    const totalPages = Math.ceil(prompts.length / promptsPerPage);
    previousPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

// Event listener for the previous page button
previousPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPromptsForPage(promptData, currentPage);
        updatePaginationButtons(promptData);
    }
});

// Event listener for the next page button
nextPageButton.addEventListener('click', () => {
    const totalPages = Math.ceil(promptData.length / promptsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPromptsForPage(promptData, currentPage);
        updatePaginationButtons(promptData);
    }
});