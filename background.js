// Store the current audio state
let currentAudioState = {
    isPlaying: false,
    tabTitle: '',
    tabId: null
};

// Function to update extension icon and badge
async function updateExtensionIcon(isPlaying) {
    console.log('Updating icon, isPlaying:', isPlaying);
    
    try {
        const canvas = new OffscreenCanvas(16, 16);
        const context = canvas.getContext('2d');
        
        // Clear canvas with transparency
        context.clearRect(0, 0, 16, 16);
        
        // Load and draw the icon
        const response = await fetch(chrome.runtime.getURL('icon.png'));
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        context.drawImage(imageBitmap, 0, 0, 16, 16);
        
        chrome.action.setIcon({ 
            imageData: context.getImageData(0, 0, 16, 16)
        });

        // Update badge
        if (isPlaying) {
            chrome.action.setBadgeText({ text: "ON" });
            chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
            chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    } catch (error) {
        console.error('Error updating icon:', error);
        chrome.action.setIcon({ path: 'icon.png' });
    }
}

// Function to check audio status across all tabs
async function checkAudioStatus() {
    try {
        const tabs = await chrome.tabs.query({});
        let isPlayingInAnyTab = false;
        let playingTabTitle = '';
        let playingTabId = null;

        for (const tab of tabs) {
            if (tab.audible) {
                isPlayingInAnyTab = true;
                playingTabTitle = tab.title;
                playingTabId = tab.id;
                break;
            }
        }

        currentAudioState = {
            isPlaying: isPlayingInAnyTab,
            tabTitle: playingTabTitle,
            tabId: playingTabId
        };

        updateExtensionIcon(isPlayingInAnyTab);

    } catch (error) {
        console.error('Error checking audio status:', error);
    }
}

// Start checking audio status immediately
checkAudioStatus();
setInterval(checkAudioStatus, 1000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getAudioState") {
        sendResponse(currentAudioState);
    }
    return true;
}); 