document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');

    // Function to update UI based on audio state
    function updateUI(audioState) {
        if (audioState.isPlaying) {
            statusElement.textContent = `Audio playing in tab: ${audioState.tabTitle}`;
            statusElement.classList.add('audio-playing');
            statusElement.classList.remove('audio-silent');
        } else {
            statusElement.textContent = 'No audio playing in any tab';
            statusElement.classList.add('audio-silent');
            statusElement.classList.remove('audio-playing');
        }
    }

    // Function to get audio state from background script
    async function getAudioState() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getAudioState" });
            updateUI(response);
        } catch (error) {
            statusElement.textContent = 'Error detecting audio state';
            console.error('Error:', error);
        }
    }

    // Start polling for updates
    getAudioState();
    setInterval(getAudioState, 1000);
}); 