chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.prompt) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
          textarea.value = request.prompt;
      }
  }
});


// Inject the ChatGPT prompt into the text box on the webpage
function injectPromptIntoWebpage(promptContent) {
    const textInput = document.querySelector('input[type="text"]');
    if (textInput) {
      textInput.value = promptContent;
    }
  }
  
  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'injectPrompt') {
      injectPromptIntoWebpage(message.promptContent);
      sendResponse({ success: true });
    }
  });
  