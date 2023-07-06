document.getElementById('settings-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const theme = document.getElementById('theme').value;
    const sortOrder = document.getElementById('sort-order').value;
    chrome.storage.sync.set({theme, sortOrder}, function() {
        alert('Settings saved.');
    });
});

// Load the current settings when the page is loaded
window.onload = function() {
    chrome.storage.sync.get(['theme', 'sortOrder'], function(items) {
        document.getElementById('theme').value = items.theme || 'light';
        document.getElementById('sort-order').value = items.sortOrder || 'date';
    });
};
