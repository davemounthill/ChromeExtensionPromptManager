document.addEventListener('DOMContentLoaded', () => {
    const saveOptionsButton = document.getElementById('save-options-button');
  
    saveOptionsButton.addEventListener('click', () => {
      const dataSource = document.querySelector('input[name="data-source"]:checked').value;
      const colorScheme = document.querySelector('input[name="color-scheme"]:checked').value;
  
      chrome.storage.sync.set({ dataSource, colorScheme }, () => {
        alert('Options saved successfully.');
      });
    });
  });
  