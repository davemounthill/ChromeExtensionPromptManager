chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({prompts: []});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getPrompts') {
      chrome.storage.sync.get('prompts', (data) => {
          sendResponse({prompts: data.prompts});
      });
      return true;
  } else if (request.type === 'savePrompt') {
      chrome.storage.sync.get('prompts', (data) => {
          const prompts = data.prompts;
          // Check if the prompt already exists
          const existingPrompt = prompts.find(prompt => prompt.id === request.prompt.id);
          if (existingPrompt) {
              sendResponse({status: 'error', message: 'Prompt already exists'});
          } else {
              prompts.push(request.prompt);
              chrome.storage.sync.set({prompts}, () => {
                  sendResponse({status: 'success'});
              });
          }
      });
      return true;
  } else if (request.type === 'updatePrompt') {
      chrome.storage.sync.get('prompts', (data) => {
          const prompts = data.prompts;
          const index = prompts.findIndex(prompt => prompt.id === request.id);
          if (index !== -1) {
              prompts[index] = request.prompt;
              chrome.storage.sync.set({prompts}, () => {
                  sendResponse({status: 'success'});
              });
          } else {
              sendResponse({status: 'error', message: 'Prompt not found'});
          }
      });
      return true;
  } else if (request.type === 'deletePrompt') {
      chrome.storage.sync.get('prompts', (data) => {
          const prompts = data.prompts;
          const index = prompts.findIndex(prompt => prompt.id === request.id);
          if (index !== -1) {
              prompts.splice(index, 1);
              chrome.storage.sync.set({prompts}, () => {
                  sendResponse({status: 'success'});
              });
          } else {
              sendResponse({status: 'error', message: 'Prompt not found'});
          }
      });
      return true;
  }
});

// Handle message passing between content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getPromptData') {
      try {
        const promptData = JSON.parse(localStorage.getItem('promptLibrary'));
        sendResponse(promptData);
      } catch (error) {
        sendResponse({status: 'error', message: 'Invalid JSON data in localStorage'});
      }
    }
});

// Handle importing and exporting prompt data
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'importPromptData') {
      try {
        const importedData = JSON.parse(message.data);
        // Validate the imported data
        if (Array.isArray(importedData) && importedData.every(isValidPrompt)) {
          localStorage.setItem('promptLibrary', JSON.stringify(importedData));
          sendResponse({ success: true });
        } else {
          sendResponse({status: 'error', message: 'Invalid prompt data'});
        }
      } catch (error) {
        sendResponse({status: 'error', message: 'Invalid JSON data'});
      }
    } else if (message.type === 'exportPromptData') {
      const promptData = localStorage.getItem('promptLibrary');
      sendResponse({ data: promptData });
    }
});

// Helper function to validate a prompt
function isValidPrompt(prompt) {
  return typeof prompt.title === 'string' &&
    typeof prompt.summary === 'string' &&
    typeof prompt.category === 'string' &&
    typeof prompt.useCase === 'string' &&
    Array.isArray(prompt.tags) &&
    prompt.tags.every(tag => typeof tag === 'string') &&
    typeof prompt.favorite === 'boolean';
}
