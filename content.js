// Inject the ChatGPT prompt into the text box on the webpage
function injectPromptIntoWebpage(promptContent) {
  const textInput = document.querySelector('input[type="text"]');
  if (textInput) {
    textInput.value = promptContent;
  } else {
    // If no text input is found, try to find a textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = promptContent;
    } else {
      // If no text input or textarea is found, alert the user
      alert('No text input or textarea found on the page.');
    }
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.type === 'injectPrompt') {
  injectPromptIntoWebpage(message.promptContent);
  sendResponse({ success: true });
}
});
