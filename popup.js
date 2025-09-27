// Popup script for handling the embedded Facebook post (Manifest V3 compatible)
document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const iframeEl = document.getElementById('embed-frame');
  const urlInfoEl = document.getElementById('url-info');

  try {
    // Get the current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;

    // Display current URL info
    urlInfoEl.textContent = `目前網址： ${currentUrl}`;

    // Check if the current URL is a Facebook post with pfbid
    const facebookPostPattern = /^https:\/\/www\.facebook\.com\/[^\/]+\/posts\/pfbid/;

    if (facebookPostPattern.test(currentUrl)) {
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
        errorEl.innerHTML = '<p>無法載入嵌入的文章。</p><p>您可以嘗試在新分頁中開啟。</p>';
        errorEl.style.display = 'block';

        // Add a button to open in new tab as fallback
        const openButton = document.createElement('button');
        openButton.textContent = '在新分頁中開啟';
        openButton.style.marginTop = '10px';
        openButton.onclick = () => {
          chrome.tabs.create({ url: embedUrl });
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
    errorEl.innerHTML = '<p>載入彈出視窗時發生錯誤。</p>';
    errorEl.style.display = 'block';
  }
});

// Add copy functionality (optional enhancement)
document.addEventListener('click', (e) => {
  if (e.target.id === 'url-info') {
    navigator.clipboard.writeText(e.target.textContent.replace('目前網址： ', ''));
    e.target.style.backgroundColor = '#d4edda';
    setTimeout(() => {
      e.target.style.backgroundColor = '#f0f2f5';
    }, 1000);
  }
});
