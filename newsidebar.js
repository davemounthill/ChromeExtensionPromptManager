  document.addEventListener("DOMContentLoaded", () => {
              const searchInput = document.getElementById("search");
              const categorySelect = document.getElementById("category");
              const templatesContainer = document.getElementById("templates");
              const paginationContainer = document.getElementById("pagination");
              const prevPageBtn = document.getElementById("prevPageBtn");
              const nextPageBtn = document.getElementById("nextPageBtn");
              const promptModal = document.getElementById("promptModal");
              const promptText = document.getElementById("promptText");
              const promptForm = document.getElementById("promptForm");
              let currentPage = 0;
              let prompts = [];
              const promptsPerPage = 10;
              // Define the global variable for prompt templates
              window.prompttemplates = [];
              // Function to load user prompts from prompts.json
              function loadUserPrompts() {
                  fetch(chrome.runtime.getURL('prompts.json')).then((response) => response.json()).then((prompts) => {
                      window.prompttemplates = prompts.reverse();
                      insertPromptTemplatesSection();
                  }).catch((error) => {
                      console.error('Failed to load prompts:', error);
                  });
              }

              function insertPromptTemplatesSection(templates = window.prompttemplates, category = "", searchTerm = "") {
                  const templatesContainer = document.getElementById("templates");
                  templatesContainer.innerHTML = "";
                  // Filter the prompts based on the category and search term
                  const filteredTemplates = templates.filter((template) => {
                      const templateCategory = template.category.toLowerCase();
                      const templateTitle = template.title.toLowerCase();
                      const templateText = template.text.toLowerCase();
                      const searchCategory = category.toLowerCase();
                      const searchKeyword = searchTerm.toLowerCase();
                      return (
                          (searchCategory === "" || templateCategory.includes(searchCategory)) && (searchKeyword === "" || templateTitle.includes(searchKeyword) || templateText.includes(searchKeyword)));
                  });
                  if (filteredTemplates.length === 0) {
                      templatesContainer.innerHTML = "No prompts found.";
                      return;
                  }
                  const fragment = document.createDocumentFragment();
                  filteredTemplates.forEach((template) => {
                      const templateElement = document.createElement("button");
                      templateElement.classList.add("template", "card");
                      templateElement.id = template.id;
                      templateElement.innerHTML = `
      <h3 class="child h3">${template.title}</h3>
      <p class="child compact-hide temp-text p">${template.text}</p>
      <p class="child compact-hide category">${template.category}</p>
      <span class="child font-medium compact-hide">Use prompt →</span>
    `;
                      templateElement.addEventListener("click", () => {
                          selectPromptTemplate(template.text, true);
                      });
                      fragment.appendChild(templateElement);
                  });
                  templatesContainer.appendChild(fragment);
              }
              // Call the loadUserPrompts function with a delay to ensure insertPromptTemplatesSection works correctly
              setTimeout(loadUserPrompts, 500);
              // Call the initializeSidebar function to set up the sidebar
              initializeSidebar();
              // Update templates
              function updateTemplates(prompts) {
                  let html = prompts.map(prompt => `
    <div class="prompt" id="${prompt.id}">
      <h3>${prompt.title}</h3>
      <p>${prompt.prompt}</p>
      <button class="use-prompt">Use Prompt</button>
    </div>
  `).join('');
                  document.querySelector('#prompts').innerHTML = html;
                  document.querySelectorAll('.use-prompt').forEach(button => {
                      button.addEventListener('click', function() {
                          let id = this.parentElement.id;
                          usePrompt(id);
                      });
                  });
              }
              // Create new prompt
              function createNewPrompt(title, prompt, tags = [], category = '') {
                  let newPrompt = {
                      id: generateUUID(),
                      title,
                      prompt,
                      tags,
                      category,
                      date: new Date().toLocaleDateString(),
                      time: new Date().toLocaleTimeString(),
                      lastChanged: new Date().getTime()
                  };
                  let prompts = window.prompttemplates;
                  prompts.push(newPrompt);
                  localStorage.setItem('prompts', JSON.stringify(prompts));
                  updateTemplates(prompts);
                  return newPrompt;
              }
              // Use a prompt
              function usePrompt(promptId) {
                  let prompt = window.prompttemplates.find(p => p.id === promptId);
                  // Implement the logic to use the prompt
                  console.log('Using prompt:', prompt);
              }
              // Generate UUID
              function generateUUID() {
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                      let r = Math.random() * 16 | 0,
                          v = c === 'x' ? r : (r & 0x3 | 0x8);
                      return v.toString(16);
                  });
              }

              function getCategoryOptions() {
                  let categories = window.prompttemplates.reduce((uniqueCategories, prompt) => {
                      if (!uniqueCategories.includes(prompt.category)) {
                          uniqueCategories.push(prompt.category);
                      }
                      return uniqueCategories;
                  }, []);
                  let options = categories.map(category => `<option value="${category}">${category}</option>`).join('');
                  document.querySelector("#category").innerHTML += options;
              }
              // Initialize the sidebar
              function initSidebar() {
                  loadPrompts();
                  getCategoryOptions();
                  document.querySelector('#search').addEventListener('input', function() {
                      let searchTerm = this.value;
                      let prompts = window.prompttemplates;
                      let category = document.querySelector("#category").value;
                      if (category) {
                          prompts = getMatchingCategory(category, prompts);
                      }
                      if (searchTerm) {
                          prompts = searchPrompts(prompts, searchTerm);
                      }
                      updateTemplates(prompts);
                  });
                  document.querySelector('#create').addEventListener('click', function() {
                      document.querySelector('#modal').style.display = 'block';
                  });
                  document.querySelector('.close').addEventListener('click', function() {
                      document.querySelector('#modal').style.display = 'none';
                  });
                  document.querySelector('#new-prompt-form').addEventListener('submit', function(event) {
                      event.preventDefault();
                      let title = this.title.value;
                      let prompt = this.prompt.value;
                      let tags = this.tags.value.split(',');
                      let category = this.category.value;
                      createNewPrompt(title, prompt, tags, category);
                      this.reset();
                      document.querySelector('#modal').style.display = 'none';
                  });
              }
              document.addEventListener('DOMContentLoaded', initSidebar);

              function initializeSidebar() {
                  loadUserPrompts();
                  setupEventListeners();
              }

              function loadUserPrompts() {
                  const promptsRawString = document.querySelector("#prompts_storage").value;
                  const isCompact = document.querySelector("#isCompact") ? .value === "true";
                  if (promptsRawString) {
                      prompts = JSON.parse(promptsRawString).reverse();
                      insertPromptTemplatesSection();
                      document.querySelector("#prompts_storage").remove();
                  }
                  // Update the sidebar UI based on the loaded prompts
                  updateTemplates();
              }

              function setupEventListeners() {
                  searchInput.addEventListener("input", handleSearch);
                  categorySelect.addEventListener("change", handleCategoryChange);
                  prevPageBtn.addEventListener("click", handlePrevPage);
                  nextPageBtn.addEventListener("click", handleNextPage);
                  templatesContainer.addEventListener("click", handleTemplateClick);
                  promptForm.addEventListener("submit", handlePromptFormSubmit);
                  promptModal.addEventListener("click", handleModalClick);
              }

              function handleSearch() {
                  const searchTerm = searchInput.value.trim().toLowerCase();
                  const filteredPrompts = prompts.filter((prompt) => containsSearchTerm(prompt, searchTerm));
                  updateTemplates(filteredPrompts);
              }

              function containsSearchTerm(prompt, searchTerm) {
                  return (prompt.title.toLowerCase().includes(searchTerm) || (prompt.text && prompt.text.toLowerCase().includes(searchTerm)) || (prompt.tags && prompt.tags.includes(searchTerm)));
              }

              function handleCategoryChange() {
                  const selectedCategory = categorySelect.value;
                  if (selectedCategory) {
                      const filteredPrompts = prompts.filter(
                          (prompt) => prompt.category === selectedCategory);
                      updateTemplates(filteredPrompts);
                  } else {
                      updateTemplates(prompts);
                  }
              }

              function handlePrevPage() {
                  if (currentPage > 0) {
                      currentPage--;
                      updateTemplates();
                  }
              }

              function handleNextPage() {
                  if (currentPage < getPageCount() - 1) {
                      currentPage++;
                      updateTemplates();
                  }
              }

              function getPageCount() {
                  return Math.ceil(prompts.length / promptsPerPage);
              }

              function updateTemplates(filteredPrompts) {
                  const startIndex = currentPage * promptsPerPage;
                  const endIndex = startIndex + promptsPerPage;
                  const currentPrompts = filteredPrompts ? filteredPrompts.slice(startIndex, endIndex) : prompts.slice(startIndex, endIndex);
                  renderTemplates(currentPrompts);
                  updatePagination();
              }

              function renderTemplates(templates) {
                  templatesContainer.innerHTML = "";
                  templates.forEach((template) => {
                      const templateElement = createTemplateElement(template);
                      templatesContainer.appendChild(templateElement);
                  });
              }

              function createTemplateElement(template) {
                  const templateElement = document.createElement("li");
                  templateElement.classList.add("template");
                  const titleElement = document.createElement("h3");
                  titleElement.textContent = template.title;
                  const textElement = document.createElement("p");
                  textElement.classList.add("template-text");
                  textElement.textContent = template.text;
                  const categoryElement = document.createElement("p");
                  categoryElement.classList.add("template-category");
                  categoryElement.textContent = template.category;
                  templateElement.appendChild(titleElement);
                  templateElement.appendChild(textElement);
                  templateElement.appendChild(categoryElement);
                  return templateElement;
              }

              function updatePagination() {
                  const pageCount = getPageCount();
                  paginationContainer.textContent = `Page ${
      currentPage + 1
    } of ${pageCount}`;
                  prevPageBtn.disabled = currentPage === 0;
                  nextPageBtn.disabled = currentPage === pageCount - 1;
              }

              function handleTemplateClick(event) {
                  const clickedTemplate = event.target.closest(".template");
                  if (clickedTemplate) {
                      const templateId = clickedTemplate.id;
                      const template = prompts.find((prompt) => prompt.id === templateId);
                      if (template) {
                          selectPromptTemplate(template.text, true);
                          closeModal();
                      }
                  }
              }

              function handlePromptFormSubmit(event) {
                  event.preventDefault();
                  const formInput = promptForm.elements["userInput"].value;
                  const selectedPromptText = promptText.textContent;
                  const formattedPromptText = replaceTemplateVars(selectedPromptText, formInput);
                  setChatInput(formattedPromptText);
                  closeModal();
              }

              function selectPromptTemplate(text, hasVars = true) {
                  promptText.textContent = text;
                  if (hasVars) {
                      openModal();
                  } else {
                      const formattedPromptText = replaceTemplateVars(text);
                      setChatInput(formattedPromptText);
                  }
              }

              function replaceTemplateVars(text, userInput = "") {
                  const templateRegex = /\{\{(\w+)\}\}/g;
                  const replacedText = text.replace(templateRegex, (match, variable) => {
                      // Implement the logic to replace template variables in the text with user input or predefined values
                      // You can use a switch statement or an object to handle different variables
                      switch (variable) {
                          case "var1":
                              return userInput;
                          case "var2":
                              return "predefined value";
                          default:
                              return match; // Return the original match if the variable is not recognized
                      }
                  });
                  return replacedText;
              }

              function setChatInput(text) {
                  const chatInput = document.getElementById("chat-input");
                  chatInput.value = text;
              }

              function openModal() {
                  const promptModal = document.getElementById("prompt-modal");
                  promptModal.classList.add("open");
              }

              function closeModal() {
                  const promptModal = document.getElementById("prompt-modal");
                  promptModal.classList.remove("open");
              }
              initializeSidebar();
              // Filter prompts based on search term
              function searchPrompts(prompts, searchTerm) {
                  searchTerm = searchTerm.toLowerCase();
                  return prompts.filter(prompt => {
                      return (prompt.title.toLowerCase().includes(searchTerm) || (prompt.text && prompt.text.toLowerCase().includes(searchTerm)) || (prompt.tags && prompt.tags.includes(searchTerm)));
                  });
              }
              // Filter prompts based on category
              function getMatchingCategory(category, prompts) {
                  return prompts.filter(prompt => {
                      return prompt.category.toLowerCase() === category.toLowerCase();
                  });
              }
              // Highlight search term in string
              function highlightString(string, searchTerm) {
                  const searchTermRegex = new RegExp(searchTerm, "gi");
                  return string ? .replace(searchTermRegex, `<span class="highlight">$&</span>`);
              }
              // Update templates based on search term and category
              function searchAndCat(fs) {
                  focusSearch = fs;
                  promptTemplateSection.currentPage = 0;
                  const searchTerm = document.querySelector("#search").value;
                  let prompts = window.prompttemplates;
                  const category = document.querySelector("#category").value;
                  if (category !== "") {
                      prompts = getMatchingCategory(category, prompts);
                  }
                  if (searchTerm !== "") {
                      prompts = searchPrompts(prompts, searchTerm);
                  }
                  updateTemplates(prompts);
              }
              // Create template element
              function createTemplateElement(template) {
                  const templateElement = document.createElement("button");
                  templateElement.id = template.id;
                  templateElement.className = "template";
                  templateElement.innerHTML = `
        <h3>${template.title}</h3>
        <p>${template.prompt}</p>
        <p>${template.category}</p>
        <span>Use prompt →</span>
    `;
                  templateElement.addEventListener("click", () => {
                      selectPromptTemplate(template.text);
                  });
                  return templateElement;
              }
              // Select prompt template
              function selectPromptTemplate(text, hasVars = true) {
                  if (hasVars) {
                      // Prompt template has variables
                      const modal = document.getElementById("promptModal");
                      const promptText = document.getElementById("promptText");
                      const promptForm = document.getElementById("promptForm");
                      promptText.innerHTML = text;
                      // Display the modal
                      modal.style.display = "block";
                      // Handle form submission
                      promptForm.addEventListener("submit", (event) => {
                          event.preventDefault();
                          // Get the user input values
                          const inputs = Array.from(promptForm.elements).filter((element) => {
                              return element.tagName === "INPUT";
                          });
                          const values = inputs.map((input) => {
                              return input.value.trim();
                          });
                          // Replace variables with user input values
                          let updatedText = text;
                          values.forEach((value, index) => {
                              updatedText = updatedText.replace(`{${index + 1}}`, value);
                          });
                          // Use the updated prompt text
                          usePrompt(updatedText);
                          // Close the modal
                          modal.style.display = "none";
                          // Reset form values
                          promptForm.reset();
                      });
                      // Handle modal close button click
                      const closeButton = document.getElementById("modalClose");
                      closeButton.addEventListener("click", () => {
                          modal.style.display = "none";
                          promptForm.reset();
                      });
                  } else {
                      // Prompt template does not have variables
                      usePrompt(text);
                  }
              }
              // Previous prompt templates page
              function prevPromptTemplatesPage() {
                  promptTemplateSection.currentPage -= 1;
                  updateTemplates(window.prompttemplates);
              }
              // Next prompt templates page
              function nextPromptTemplatesPage() {
                  promptTemplateSection.currentPage += 1;
                  updateTemplates(window.prompttemplates);
              }
              // Update templates
              function updateTemplates(templates) {
                  const templatesContainer = document.getElementById("templates");
                  templatesContainer.innerHTML = "";
                  const start = promptTemplateSection.currentPage * promptTemplateSection.templatesPerPage;
                  const end = start + promptTemplateSection.templatesPerPage;
                  const currentTemplates = templates.slice(start, end);
                  for (const template of currentTemplates) {
                      const templateElement = createTemplateElement(template);
                      templatesContainer.appendChild(templateElement);
                  }
                  const paginationText = document.querySelector("#pagination");
                  paginationText.innerHTML = `Showing ${start + 1} to ${Math.min(end, templates.length)} of ${templates.length} Entries`;
              }
              // Handle element added
              function handleElementAdded(e) {
                  if (e.id === "headless") {
                      setupSidebar();
                  }
              }
              // Start observing the document body for changes
              const observer = new MutationObserver((mutationsList, observer) => {
                  for (const mutation of mutationsList) {
                      if (mutation.type === "childList") {
                          for (const node of mutation.addedNodes) {
                              handleElementAdded(node);
                          }
                      }
                  }
              });
              // Call the `handleElementAdded` function with the added node
              handleElementAdded(document.body);
              // Start observing the document body
              observer.observe(document.body, {
                  childList: true,
                  subtree: true
              });