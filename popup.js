// Consolidated popup.js

// Store the prompt data
let promptData = [];

// Get the DOM elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const useCaseFilter = document.getElementById('use-case-filter');
const tagFilter = document.getElementById('tag-filter');
const promptList = document.getElementById('prompt-list');
const createPromptBtn = document.getElementById('create-prompt-btn');
const previousPageButton = document.getElementById('previous-page');
const nextPageButton = document.getElementById('next-page');

let filteredPrompts = [];
let currentPage = 1;
const promptsPerPage = 10;

// Function to filter prompts based on search input and filter options
function filterPrompts() {
    const searchValue = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const useCaseValue = useCaseFilter.value;
    const tagValue = tagFilter.value;

    // Filter the prompts based on the search input and filter options
    filteredPrompts = promptData.filter((prompt) => {
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

    // Reset the current page to 1
    currentPage = 1;

    // Update the prompt list display
    displayPromptsForPage(filteredPrompts, currentPage);
    updatePaginationButtons(filteredPrompts);
}

// Function to display the prompts in the prompt list for the specified page
function displayPromptsForPage(prompts, pageNumber) {
    promptList.innerHTML = '';

    const startIndex = (pageNumber - 1) * promptsPerPage;
    const endIndex = startIndex + promptsPerPage;
    const promptsToDisplay = prompts.slice(startIndex, endIndex);

    promptsToDisplay.forEach((prompt) => {
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

// Function to update the pagination buttons
function updatePaginationButtons(prompts) {
    previousPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === Math.ceil(prompts.length / promptsPerPage);
}

// Function to go to the previous page of prompts
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPromptsForPage(filteredPrompts, currentPage);
        updatePaginationButtons(filteredPrompts);
    }
}

// Function to go to the next page of prompts
function goToNextPage() {
    const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPromptsForPage(filteredPrompts, currentPage);
        updatePaginationPaginationButtons(filteredPrompts);
    }
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
previousPageButton.addEventListener('click', goToPreviousPage);
nextPageButton.addEventListener('click', goToNextPage);

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
        favorite: false,
    };

    // Add the new prompt to the prompt data
    promptData.push(newPrompt);

    //// Update the prompt list display
    filterPrompts();

    // Close the modal
    const modal = document.getElementById('edit-prompt-modal');
    modal.style.display = 'none';

    // Reset the form inputs
    createPromptForm.reset();
}

// Function to fetch and load the prompt data
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
            tags: ['Tag 1', 'Tag 2'],
            favorite: false,
        },
        {
            title: 'Prompt 2',
            summary: 'Summary of Prompt 2',
            category: 'Category 2',
            useCase: 'Use Case 2',
            tags: ['Tag 3', 'Tag 4'],
            favorite: true,
        },
        // Add more prompt objects as needed
    ];

    // Display all prompts initially
    displayPromptsForPage(promptData, currentPage);
    updatePaginationButtons(promptData);
}

// Load the prompt data when the popup is opened
fetchPromptData();

// Function to toggle the favorite state of a prompt
function toggleFavorite(prompt) {
    prompt.favorite = !prompt.favorite;
    filterPrompts();
}

// Event listener for favorite button click
promptItem.addEventListener('click', (event) => {
    const clickedPrompt = promptData.find((prompt) => prompt.title === event.target.dataset.title);
    toggleFavorite(clickedPrompt);
});
