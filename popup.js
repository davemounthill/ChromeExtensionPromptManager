document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const categoryDropdown = document.getElementById('category');
    const tagsDropdown = document.getElementById('tags');
    const promptList = document.getElementById('prompt-list');
    const previousPageButton = document.getElementById('previous-page-button');
    const nextPageButton = document.getElementById('next-page-button');
    const importFileInput = document.getElementById('import-file');
    const exportButton = document.getElementById('export-button');
    const createPromptButton = document.getElementById('create-prompt-button');
    const promptModal = document.getElementById('prompt-modal');
    const promptForm = document.getElementById('prompt-form');
  
    let currentPage = 1;
    let totalPages = 1;
    let prompts = [];
  
    // Function to load prompts from storage and update the UI
    function loadPrompts() {
      chrome.runtime.sendMessage({ type: 'getPrompts' }, (response) => {
        prompts = response.prompts || [];
        filterPrompts();
        updatePaginationButtons();
      });
    }
  
    // Function to filter prompts based on search, category, and tags
    function filterPrompts() {
      const searchQuery = searchBox.value.toLowerCase();
      const selectedCategory = categoryDropdown.value;
      const selectedTags= Array.from(tagsDropdown.selectedOptions).map((option) => option.value);
  
      let filteredPrompts = prompts.filter((prompt) => {
        const promptTitle = prompt.title.toLowerCase();
        const promptSummary = prompt.summary.toLowerCase();
        const promptCategory = prompt.category.toLowerCase();
        const promptTags = prompt.tags.map((tag) => tag.toLowerCase());
  
        // Check if prompt matches search query
        const matchesSearch = promptTitle.includes(searchQuery) || promptSummary.includes(searchQuery);
  
        // Check if prompt matches selected category
        const matchesCategory = selectedCategory === '' || promptCategory === selectedCategory;
  
        // Check if prompt matches selected tags
        const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => promptTags.includes(tag));
  
        return matchesSearch && matchesCategory && matchesTags;
      });
  
      // Sort prompts by title
      filteredPrompts.sort((a, b) => a.title.localeCompare(b.title));
  
      // Update prompt list UI
      updatePromptList(filteredPrompts);
    }
  
    // Function to update the prompt list UI
    function updatePromptList(filteredPrompts) {
      promptList.innerHTML = '';
  
      if (filteredPrompts.length === 0) {
        promptList.innerHTML = '<p>No prompts found.</p>';
        return;
      }
  
      const startIndex = (currentPage - 1) * 10;
      const endIndex = Math.min(startIndex + 10, filteredPrompts.length);
  
      for (let i = startIndex; i < endIndex; i++) {
        const prompt = filteredPrompts[i];
        const promptElement = document.createElement('div');
        promptElement.textContent = prompt.title;
        promptElement.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'injectPrompt', promptContent: prompt.content }, (response) => {
            if (response.success) {
              alert('Prompt injected successfully.');
            } else {
              alert('Failed to inject prompt.');
            }
          });
        });
        promptList.appendChild(promptElement);
      }
    }
  
    // Function to update the pagination buttons UI
    function updatePaginationButtons() {
      totalPages = Math.ceil(promptList.childElementCount / 10);
      previousPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage === totalPages;
    }
  
    // Event listener for search box input
    searchBox.addEventListener('input', () => {
      filterPrompts();
      updatePaginationButtons();
    });
  
    // Event listener for category dropdown change
    categoryDropdown.addEventListener('change', () => {
      filterPrompts();
      updatePaginationButtons();
    });
  
    // Event listener for tags dropdown change
    tagsDropdown.addEventListener('change', () => {
      filterPrompts();
      updatePaginationButtons();
    });
  
    // Event listener for previous page button click
    previousPageButton.addEventListener('click', () => {
      currentPage--;
      filterPrompts();
      updatePaginationButtons();
    });
  
    // Event listener for next page button click
    nextPageButton.addEventListener('click', () => {
      currentPage++;
      filterPrompts();
      updatePaginationButtons();
    });
  
    // Event listener for import file input change
    importFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        const importedData = reader.result;
        chrome.runtime.sendMessage({ type: 'importPromptData', data: importedData }, (response) => {
          if (response.status === 'success') {
            alert('Prompts imported successfully.');
            loadPrompts();
          } else {
            alert('Failed to import prompts. Please check the file format.');
          }
        });
      };
  
      reader.readAsText(file);
    });
  
    // Event listenerfor export button click
    exportButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'exportPromptData' }, (response) => {
        const promptData = response.data;
        const blob = new Blob([promptData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompts.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  
    // Event listener for create prompt button click
    createPromptButton.addEventListener('click', () => {
      promptForm.reset();
      promptModal.style.display = 'block';
    });
  
    // Event listener for prompt form submission
    promptForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const title = document.getElementById('title').value;
      const summary = document.getElementById('summary').value;
      const category = document.getElementById('category').value;
      const useCase = document.getElementById('use-case').value;
      const tags = document.getElementById('tags').value.split(',');
      const content = document.getElementById('content').value;
  
      const prompt = {
        id: Date.now().toString(),
        title,
        summary,
        category,
        useCase,
        tags,
        content,
      };
  
      chrome.runtime.sendMessage({ type: 'savePrompt', prompt }, (response) => {
        if (response.status === 'success') {
          alert('Prompt saved successfully.');
          promptForm.reset();
          promptModal.style.display = 'none';
          loadPrompts();
        } else {
          alert(response.message);
        }
      });
    });
  
    // Load prompts on popup open
    loadPrompts();
  });
  