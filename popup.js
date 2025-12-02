// Polyfill for cross-browser compatibility (Firefox uses 'browser', Chrome uses 'chrome')
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Initialize i18n
function initializeI18n() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = browserAPI.i18n.getMessage(key);
    if (message) {
      // Only set textContent for leaf elements (no children)
      if (element.children.length === 0) {
        element.textContent = message;
      }
    }
  });
}

// 檢查是否為 Facebook 貼文網址的函數
function isFacebookPostUrl(url) {
  try {
    const urlObj = new URL(url);

    // 確認是 Facebook 網域
    if (urlObj.hostname !== 'www.facebook.com') {
      return false;
    }

    // 類型 1: https://www.facebook.com/{username}/posts/pfbid...
    if (urlObj.pathname.match(/^\/[^\/]+\/posts\/pfbid/)) {
      return true;
    }

    // 類型 2: https://www.facebook.com/permalink.php?story_fbid=pfbid...&id=...
    // 類型 3: https://www.facebook.com/story.php?story_fbid=pfbid...&id=...
    if (urlObj.pathname === '/permalink.php' || urlObj.pathname === '/story.php') {
      const storyFbid = urlObj.searchParams.get('story_fbid');

      if (storyFbid && storyFbid.startsWith('pfbid')) {
        return true;
      }
    }

    return false;
  } catch (error) {
    // 如果 URL 解析失敗，返回 false
    return false;
  }
}

// Popup script for handling the embedded Facebook post (Manifest V3 compatible)
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n texts
  initializeI18n();

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const iframeEl = document.getElementById('embed-frame');
  const urlInfoEl = document.getElementById('url-info');

  try {
    // Get the current active tab
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;

    // Display current URL info
    urlInfoEl.textContent = `${browserAPI.i18n.getMessage('currentUrl')}${currentUrl}`;

    // Check if the current URL is a Facebook post with pfbid
    if (isFacebookPostUrl(currentUrl)) {
      // Create the embed URL
      const encodedUrl = encodeURIComponent(currentUrl);
      const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}`;

      // Load the embedded post
      iframeEl.src = embedUrl;

      // Show iframe and hide loading when loaded
      iframeEl.onload = () => {
        loadingEl.style.display = 'none';
        iframeEl.style.display = 'block';

        // Show instruction message
        const instructionEl = document.getElementById('instruction');
        if (instructionEl) {
          instructionEl.style.display = 'block';
        }
      };

      // Handle iframe load errors
      iframeEl.onerror = () => {
        loadingEl.style.display = 'none';
        errorEl.innerHTML = `<p>${browserAPI.i18n.getMessage('errorCannotLoad')}</p><p>${browserAPI.i18n.getMessage('errorTryNewTab')}</p>`;
        errorEl.style.display = 'block';

        // Add a button to open in new tab as fallback
        const openButton = document.createElement('button');
        openButton.textContent = browserAPI.i18n.getMessage('openInNewTab');
        openButton.style.marginTop = '10px';
        openButton.onclick = () => {
          browserAPI.tabs.create({ url: embedUrl });
          window.close();
        };
        errorEl.appendChild(openButton);
      };

    } else {
      // Show error for invalid URL
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      urlInfoEl.style.backgroundColor = '#fee';
      urlInfoEl.style.color = '#c33';
    }

  } catch (error) {
    console.error('Error in popup:', error);
    loadingEl.style.display = 'none';
    errorEl.innerHTML = `<p>${browserAPI.i18n.getMessage('errorPopup')}</p>`;
    errorEl.style.display = 'block';
  }
});

// Add copy functionality (optional enhancement)
document.addEventListener('click', (e) => {
  if (e.target.id === 'url-info') {
    const currentUrlText = browserAPI.i18n.getMessage('currentUrl');
    navigator.clipboard.writeText(e.target.textContent.replace(currentUrlText, ''));
    e.target.style.backgroundColor = '#d4edda';
    setTimeout(() => {
      e.target.style.backgroundColor = '#f0f2f5';
    }, 1000);
  }
});
