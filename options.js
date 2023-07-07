// options.js

document.addEventListener('DOMContentLoaded', () => {
  const optionsForm = document.getElementById('options-form')

  const loadOptions = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getOptions' })
      const options = response.options || {}

      for (const input of optionsForm.elements) {
        if (input.name && options.hasOwnProperty(input.name)) {
          input.value = options[input.name]
        }
      }
    } catch (error) {
      console.error('Failed to load options:', error)
      // Display error message or provide feedback within the extension's interface
    }
  }

  optionsForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const options = {}

    for (const input of optionsForm.elements) {
      if (input.name) {
        options[input.name] = input.value
      }
    }

    try {
      const response = await chrome.runtime.sendMessage({ type: 'saveOptions', options })
      if (response.status === 'success') {
        // Provide visual feedback or display success message within the extension's interface
        console.log('Options saved successfully.')
      } else {
        console.error('Failed to save options:', response.message)
        // Display error message or provide feedback within the extension's interface
      }
    } catch (error) {
      console.error('Failed to save options:', error)
      // Display error message or provide feedback within the extension's interface
    }
  })

  loadOptions()
})
