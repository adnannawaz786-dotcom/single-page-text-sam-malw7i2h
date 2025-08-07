// Sam Text Application - JavaScript Functionality
// Modern text handling with smooth animations and responsive design

class SamTextApp {
    constructor() {
        this.textArea = null;
        this.charCount = null;
        this.wordCount = null;
        this.lineCount = null;
        this.saveBtn = null;
        this.clearBtn = null;
        this.copyBtn = null;
        this.downloadBtn = null;
        this.themeToggle = null;
        this.fontSizeSlider = null;
        this.statusMessage = null;
        
        this.autoSaveInterval = null;
        this.typingTimer = null;
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }
    
    setupElements() {
        try {
            // Get DOM elements
            this.textArea = document.getElementById('textInput');
            this.charCount = document.getElementById('charCount');
            this.wordCount = document.getElementById('wordCount');
            this.lineCount = document.getElementById('lineCount');
            this.saveBtn = document.getElementById('saveBtn');
            this.clearBtn = document.getElementById('clearBtn');
            this.copyBtn = document.getElementById('copyBtn');
            this.downloadBtn = document.getElementById('downloadBtn');
            this.themeToggle = document.getElementById('themeToggle');
            this.fontSizeSlider = document.getElementById('fontSizeSlider');
            this.statusMessage = document.getElementById('statusMessage');
            
            // Check if essential elements exist
            if (!this.textArea) {
                throw new Error('Text area element not found');
            }
            
            this.bindEvents();
            this.loadSavedContent();
            this.initializeTheme();
            this.initializeFontSize();
            this.startAutoSave();
            this.updateStats();
            
        } catch (error) {
            console.error('Error initializing Sam Text App:', error);
            this.showStatus('Error initializing application', 'error');
        }
    }
    
    bindEvents() {
        // Text area events
        this.textArea.addEventListener('input', this.handleTextInput.bind(this));
        this.textArea.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.textArea.addEventListener('paste', this.handlePaste.bind(this));
        
        // Button events
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', this.saveContent.bind(this));
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', this.clearContent.bind(this));
        }
        
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', this.copyContent.bind(this));
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', this.downloadContent.bind(this));
        }
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
        
        if (this.fontSizeSlider) {
            this.fontSizeSlider.addEventListener('input', this.handleFontSizeChange.bind(this));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleTextInput(event) {
        this.updateStats();
        this.setTypingIndicator(true);
        
        // Clear previous timer
        clearTimeout(this.typingTimer);
        
        // Set new timer
        this.typingTimer = setTimeout(() => {
            this.setTypingIndicator(false);
        }, 1000);
        
        // Auto-save after typing stops
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveToLocalStorage();
        }, 2000);
    }
    
    handleKeyDown(event) {
        // Handle tab key for indentation
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = this.textArea.selectionStart;
            const end = this.textArea.selectionEnd;
            const value = this.textArea.value;
            
            if (event.shiftKey) {
                // Remove tab/spaces at beginning of line
                this.removeIndentation(start, end);
            } else {
                // Add tab
                this.textArea.value = value.substring(0, start) + '\t' + value.substring(end);
                this.textArea.selectionStart = this.textArea.selectionEnd = start + 1;
            }
            
            this.updateStats();
        }
    }
    
    handlePaste(event) {
        // Update stats after paste
        setTimeout(() => {
            this.updateStats();
            this.saveToLocalStorage();
        }, 10);
    }
    
    handleGlobalKeyDown(event) {
        // Ctrl/Cmd + S for save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveContent();
        }
        
        // Ctrl/Cmd + D for download
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            this.downloadContent();
        }
        
        // Ctrl/Cmd + K for clear (with confirmation)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.clearContent();
        }
    }
    
    handleBeforeUnload(event) {
        // Save content before page unload
        this.saveToLocalStorage();
    }
    
    handleResize() {
        // Adjust textarea height on window resize if needed
        this.adjustTextAreaHeight();
    }
    
    updateStats() {
        const text = this.textArea.value;
        const chars = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const lines = text === '' ? 0 : text.split('\n').length;
        
        if (this.charCount) {
            this.animateNumber(this.charCount, chars);
        }
        
        if (this.wordCount) {
            this.animateNumber(this.wordCount, words);
        }
        
        if (this.lineCount) {
            this.animateNumber(this.lineCount, lines);
        }
    }
    
    animateNumber(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = newValue > currentValue ? 1 : -1;
        const steps = Math.abs(newValue - currentValue);
        
        if (steps <= 10) {
            let current = currentValue;
            const timer = setInterval(() => {
                current += increment;
                element.textContent = current;
                
                if (current === newValue) {
                    clearInterval(timer);
                }
            }, 20);
        } else {
            element.textContent = newValue;
        }
    }
    
    saveContent() {
        try {
            this.saveToLocalStorage();
            this.showStatus('Content saved successfully!', 'success');
            
            // Add visual feedback to save button
            if (this.saveBtn) {
                this.saveBtn.classList.add('saved');
                setTimeout(() => {
                    this.saveBtn.classList.remove('saved');
                }, 1000);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            this.showStatus('Error saving content', 'error');
        }
    }
    
    clearContent() {
        if (this.textArea.value.trim() === '') {
            this.showStatus('Text area is already empty', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all text? This action cannot be undone.')) {
            this.textArea.value = '';
            this.textArea.focus();
            this.updateStats();
            this.saveToLocalStorage();
            this.showStatus('Content cleared', 'success');
        }
    }
    
    async copyContent() {
        try {
            if (this.textArea.value.trim() === '') {
                this.showStatus('Nothing to copy', 'info');
                return;
            }
            
            await navigator.clipboard.writeText(this.textArea.value);
            this.showStatus('Content copied to clipboard!', 'success');
            
            // Add visual feedback to copy button
            if (this.copyBtn) {
                this.copyBtn.classList.add('copied');
                setTimeout(() => {
                    this.copyBtn.classList.remove('copied');
                }, 1000);
            }
        } catch (error) {
            console.error('Error copying content:', error);
            
            // Fallback for older browsers
            this.textArea.select();
            document.execCommand('copy');
            this.showStatus('Content copied to clipboard!', 'success');
        }
    }
    
    downloadContent() {
        try {
            if (this.textArea.value.trim() === '') {
                this.showStatus('Nothing to download', 'info');
                return;
            }
            
            const content = this.textArea.value;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `sam-text-${timestamp}.txt`;
            
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus(`Downloaded as ${filename}`, 'success');
        } catch (error) {
            console.error('Error downloading content:', error);
            this.showStatus('Error downloading content', 'error');
        }
    }
    
    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('sam-theme', newTheme);
            
            this.showStatus(`Switched to ${newTheme} theme`, 'success');
        } catch (error) {
            console.error('Error toggling theme:', error);
            this.showStatus('Error changing theme', 'error');
        }
    }
    
    handleFontSizeChange(event) {
        try {
            const fontSize = event.target.value;
            this.textArea.style.fontSize = fontSize + 'px';
            localStorage.setItem('sam-font-size', fontSize);
        } catch (error) {
            console.error('Error changing font size:', error);
        }
    }
    
    initializeTheme() {
        try {
            const savedTheme = localStorage.getItem('sam-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
        } catch (error) {
            console.error('Error initializing theme:', error);
        }
    }
    
    initializeFontSize() {
        try {
            const savedFontSize = localStorage.getItem('sam-font-size') || '16';
            if (this.fontSizeSlider) {
                this.fontSizeSlider.value = savedFontSize;
            }
            this.textArea.style.fontSize = savedFontSize + 'px';
        } catch (error) {
            console.error('Error initializing font size:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            const content = this.textArea.value;
            const timestamp = new Date().toISOString();
            const data = {
                content: content,
                timestamp: timestamp,
                stats: {
                    chars: content.length,
                    words: content.trim() === '' ? 0 : content.trim().split(/\s+/).length,
                    lines: content === '' ? 0 : content.split('\n').length
                }
            };
            
            localStorage.setItem('sam-text-content', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    loadSavedContent() {
        try {
            const savedData = localStorage.getItem('sam-text-content');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.textArea.value = data.content || '';
                this.updateStats();
                
                if (data.timestamp) {
                    const lastSaved = new Date(data.timestamp);
                    const now = new Date();
                    const diffMinutes = Math.floor((now - lastSaved) / (1000 * 60));
                    
                    if (diffMinutes < 60) {
                        this.showStatus(`Restored content from ${diffMinutes} minutes ago`, 'info');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved content:', error);
        }
    }
    
    startAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.textArea.value.trim() !== '') {
                this.saveToLocalStorage();
            }
        }, 30000);
    }
    
    setTypingIndicator(isTyping) {
        this.isTyping = isTyping;
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.opacity = isTyping ? '1' : '0';
        }
    }
    
    showStatus(message, type = 'info') {
        if (!this.statusMessage) return;
        
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.opacity = '1';
        this.statusMessage.style.transform = 'translateY(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            this.statusMessage.style.opacity = '0';
            this.statusMessage.style.transform = 'translateY(-10px)';
        }, 3000);
    }
    
    removeIndentation(start, end) {
        const value = this.textArea.value;
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].startsWith('\t')) {
                lines[i] = lines[i].substring(1);
            } else if (lines[i].startsWith('    ')) {
                lines[i] = lines[i].substring(4);
            }
        }
        
        this.textArea.value = lines.join('\