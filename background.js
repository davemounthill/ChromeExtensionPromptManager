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
          prompts.push(request.prompt);
          chrome.storage.sync.set({prompts}, () => {
              sendResponse({status: 'success'});
          });
      });
      return true;
  }
});


// Handle message passing between content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getPromptData') {
      const promptData = JSON.parse(localStorage.getItem('promptLibrary'));
      sendResponse(promptData);
    }
  });
  
  // Handle importing and exporting prompt data
  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'importPromptData') {
     const importedData = JSON.parse(message.data);
      localStorage.setItem('promptLibrary', JSON.stringify(importedData));
      sendResponse({ success: true });
    } else if (message.type === 'exportPromptData') {
      const promptData = localStorage.getItem('promptLibrary');
      sendResponse({ data: promptData });
    }
  });
  