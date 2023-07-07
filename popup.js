// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box')
    const categoryDropdown = document.getElementById('category')
    const tagsDropdown = document.getElementById('tags')
    const promptList = document.getElementById('prompt-list')
    const previousPageButton = document.getElementById('previous-page-button')
    const nextPageButton = document.getElementById('next-page-button')
    const importFileInput = document.getElementById('import-file')
    const exportButton = document.getElementById('export-button')
    const createPromptButton = document.getElementById('create-prompt-button')
    const promptModal = document.getElementById('prompt-modal')
    const promptForm = document.getElementById('prompt-form')
    let currentPage = 1
    let totalPages = 1
    let prompts = []
    const loadPrompts = async () => {
        const response = await chrome.runtime.sendMessage({
            type: 'getPrompts'
        })
        prompts = response.prompts || []
        filterPrompts()
        updatePaginationButtons()
    }
    const filterPrompts = () => {
        const searchQuery = searchBox.value.toLowerCase()
        const selectedCategory = categoryDropdown.value
        const selectedTags = Array.from(tagsDropdown.selectedOptions).map((option) => option.value)
        const filteredPrompts = prompts.filter((prompt) => {
            const promptTitle = prompt.title.toLowerCase()
            const promptSummary = prompt.summary.toLowerCase()
            const promptCategory = prompt.category.toLowerCase()
            const promptTags = prompt.tags.map((tag) => tag.toLowerCase())
            const matchesSearch = promptTitle.includes(searchQuery) || promptSummary.includes(searchQuery)
            const matchesCategory = selectedCategory === '' || promptCategory === selectedCategory
            const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => promptTags.includes(tag))
            return matchesSearch && matchesCategory && matchesTags
        })
        filteredPrompts.sort((a, b) => a.title.localeCompare(b.title))
        updatePromptList(filteredPrompts)
    }
    const updatePromptList = (filteredPrompts) => {
        promptList.innerHTML = ''
        if (filteredPrompts.length === 0) {
            promptList.innerHTML = '<p>No prompts found.</p>'
            return
        }
        const startIndex = (currentPage - 1) * 10
        const endIndex = Math.min(startIndex + 10, filteredPrompts.length)
        for (let i = startIndex; i < endIndex; i++) {
            const prompt = filteredPrompts[i]
            const promptElement = document.createElement('div')
            promptElement.textContent = prompt.title
            promptElement.addEventListener('click', () => {
                injectPrompt(prompt.content)
            })
            promptList.appendChild(promptElement)
        }
    }
    const updatePaginationButtons = () => {
        totalPages = Math.ceil(promptList.childElementCount / 10)
        previousPageButton.disabled = currentPage === 1
        nextPageButton.disabled = currentPage === totalPages
    }
    const injectPrompt = async (promptContent) => {
        const response = await chrome.runtime.sendMessage({
            type: 'savePrompt',
            promptContent
        })
        if (response.success) {
            alert('Prompt injected successfully.')
        } else {
            alert('Failed to inject prompt.')
        }
    }
    const handleImportFile = async (event) => {
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = async () => {
            const importedData = reader.result
            const response = await chrome.runtime.sendMessage({
                type: 'importPromptData',
                data: importedData
            })
            if (response.status === 'success') {
                alert('Prompts imported successfully.')
                loadPrompts()
            } else {
                alert('Failed to import prompts: ' + response.message)
            }
        }
        reader.readAsText(file)
    }
    const handlePromptFormSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData(promptForm)
        const prompt = Object.fromEntries(formData.entries())
        const response = await chrome.runtime.sendMessage({
            type: 'savePrompt',
            prompt
        })
        if (response.status === 'success') {
            alert('Prompt saved successfully.')
            loadPrompts()
            promptModal.style.display = 'none'
            promptForm.reset()
        } else {
            alert('Failed to save prompt: ' + response.message)
        }
    }
    const initialize = () => {
        searchBox.addEventListener('input', filterPrompts)
        categoryDropdown.addEventListener('change', filterPrompts)
        tagsDropdown.addEventListener('change', filterPrompts)
        previousPageButton.addEventListener('click', () => {
            currentPage--
            filterPrompts()
            updatePaginationButtons()
        })
        nextPageButton.addEventListener('click', () => {
            currentPage++
            filterPrompts()
            updatePaginationButtons()
        })
        importFileInput.addEventListener('change', handleImportFile)
        exportButton.addEventListener('click', handleExportButtonClick)
        createPromptButton.addEventListener('click', () => {
            promptModal.style.display = 'block'
        })
        promptForm.addEventListener('submit', handlePromptFormSubmit)
        loadPrompts()
    }
    initialize()
})