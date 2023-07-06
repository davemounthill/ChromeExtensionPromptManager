
// Load the prompts from the prompts.json file when the extension initializes
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('promptLibrary', (data) => {
    if (!data.promptLibrary) {
      fetchPromptsFromFile('/prompts.json')
        .then((prompts) => {
          chrome.storage.sync.set({ promptLibrary: prompts });
        })
        .catch((error) => {
          console.error('Failed to fetch prompts:', error);
        });
    }
  });
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ prompts: [] });
});
// Fetch the prompts from the prompts.json file
function fetchPromptsFromFile(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch prompts');
        }
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getPrompts') {
    chrome.storage.sync.get('prompts', (data) => {
      sendResponse({ prompts: data.prompts });
    });
    return true;
  } else if (request.type === 'savePrompt') {
    chrome.storage.sync.get('prompts', (data) => {
      const prompts = data.prompts;
      const existingPrompt = prompts.find((prompt) => prompt.id === request.prompt.id);
      if (existingPrompt) {
        sendResponse({ status: 'error', message: 'Prompt already exists' });
      } else {
        prompts.push(request.prompt);
        chrome.storage.sync.set({ prompts }, () => {
          sendResponse({ status: 'success' });
        });
      }
    });
    return true;
  } else if (request.type === 'updatePrompt') {
    chrome.storage.sync.get('prompts', (data) => {
      const prompts = data.prompts;
      const index = prompts.findIndex((prompt) => prompt.id === request.id);
      if (index !== -1) {
        prompts[index] = request.prompt;
        chrome.storage.sync.set({ prompts }, () => {
          sendResponse({ status: 'success' });
        });
      } else {
        sendResponse({ status: 'error', message: 'Prompt not found' });
      }
    });
    return true;
  } else if (request.type === 'deletePrompt') {
    chrome.storage.sync.get('prompts', (data) => {
      const prompts = data.prompts;
      const index = prompts.findIndex((prompt) => prompt.id === request.id);
      if (index !== -1) {
        prompts.splice(index, 1);
        chrome.storage.sync.set({ prompts }, () => {
          sendResponse({ status: 'success' });
        });
      } else {
        sendResponse({ status: 'error', message: 'Prompt not found' });
      }
    });
    return true;
  } else if (request.type === 'importPromptData') {
    try {
      const importedData = JSON.parse(request.data);
      if (Array.isArray(importedData)) {
        chrome.storage.sync.set({ prompts: importedData }, () => {
          sendResponse({ status: 'success' });
        });
      } else {
        sendResponse({ status: 'error', message: 'Invalid prompt data' });
      }
    } catch (error) {
      sendResponse({ status: 'error', message: 'Invalid JSON data' });
    }
    return true;
  } else if (request.type === 'exportPromptData') {
    chrome.storage.sync.get('prompts', (data) => {
      const promptData = JSON.stringify(data.prompts);
      sendResponse({ data: promptData });
    });
    return true;
  }
});
