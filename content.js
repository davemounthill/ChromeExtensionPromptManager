// content.js
const injectPrompt = (promptContent) => {
    const activeElement = document.activeElement
    if (activeElement && (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.isContentEditable)) {
        const start = activeElement.selectionStart
        const end = activeElement.selectionEnd
        const originalValue = activeElement.isContentEditable ? activeElement.textContent : activeElement.value
        const newValue = `${originalValue.substring(0, start)}${promptContent}${originalValue.substring(end)}`
        activeElement[activeElement.isContentEditable ? 'textContent' : 'value'] = newValue
        activeElement.selectionStart = activeElement.selectionEnd = start + promptContent.length
    } else {
        notifyError('Please focus on a text area or a content editable element.')
    }
}
chrome.runtime.onMessage.addListener(({
    type,
    promptContent
}, sender, sendResponse) => {
    if (type === 'injectPrompt' && typeof promptContent === 'string' && promptContent.trim().length > 0) {
        injectPrompt(promptContent)
        sendResponse({
            success: true
        })
    } else {
        notifyError('Invalid prompt content.')
    }
})

function notifyError(errorMessage) {
    // Implement error notification logic here
    console.error(errorMessage)
}

function() {
    let prompts = []
    let options = {}

    function initialize() {
        chrome.runtime.onInstalled.addListener(fetchPrompts)
        chrome.runtime.onMessage.addListener(handleMessage)
    }
    async function fetchPrompts() {
        try {
            const response = await fetch('prompts.json')
            const data = await response.json()
            prompts = Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching prompts:', error)
        }
    }

    function handleMessage(request, sender, sendResponse) {
        switch (request.type) {
            case 'getPrompts':
                sendResponse({
                    prompts
                })
                break
            case 'injectPrompt':
                handleInjectPrompt(request, sender, sendResponse)
                break
            case 'importPromptData':
                handleImportPromptData(request, sendResponse)
                break
            case 'exportPromptData':
                sendResponse({
                    data: JSON.stringify(prompts)
                })
                break
            case 'getOptions':
                sendResponse({
                    options
                })
                break
            case 'saveOptions':
                handleSaveOptions(request, sendResponse)
                break
            default:
                sendResponse({
                    status: 'error',
                    message: 'Unknown message type'
                })
        }
    }

    function handleInjectPrompt(request, sender, sendResponse) {
        if (sender.tab && request.promptContent) {
            chrome.tabs.sendMessage(sender.tab.id, {
                type: 'injectPrompt',
                promptContent: request.promptContent
            }, (response) => {
                sendResponse(response)
            })
        } else {
            sendResponse({
                status: 'error',
                message: 'Invalid message format'
            })
        }
    }

    function handleImportPromptData(request, sendResponse) {
        try {
            const importedData = JSON.parse(request.data)
            prompts = Array.isArray(importedData) ? importedData : []
            sendResponse({
                status: 'success'
            })
        } catch (error) {
            sendResponse({
                status: 'error',
                message: 'Invalid JSON format'
            })
        }
    }

    function handleSaveOptions(request, sendResponse) {
        options = request.options
        sendResponse({
            status: 'success'
        })
    }
    initialize()
}()