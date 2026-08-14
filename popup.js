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

    // 類型 2: https://www.facebook.com/permalink.php?story_fbid=...&id=...
    // 類型 3: https://www.facebook.com/story.php?story_fbid=...&id=...
    // 支援 pfbid 開頭的 hash 或純數字的 story_fbid
    if (urlObj.pathname === '/permalink.php' || urlObj.pathname === '/story.php') {
      const storyFbid = urlObj.searchParams.get('story_fbid');
      const id = urlObj.searchParams.get('id');

      // 支援 pfbid 開頭的 hash 或純數字的 story_fbid（需要同時有 id 參數）
      if (storyFbid && id && (storyFbid.startsWith('pfbid') || /^\d+$/.test(storyFbid))) {
        return true;
      }
    }

    // 類型 4: https://www.facebook.com/photo.php?fbid=...&set=...
    if (urlObj.pathname === '/photo.php') {
      const fbid = urlObj.searchParams.get('fbid');
      const set = urlObj.searchParams.get('set');

      // 需要同時有 fbid 和 set 參數
      if (fbid && set) {
        return true;
      }
    }

    return false;
  } catch (error) {
    // 如果 URL 解析失敗，返回 false
    return false;
  }
}

// 從網址中找出 pfbid，並提供一個組出還原後網址的函式
function extractPfbidInfo(url) {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname !== 'www.facebook.com') {
      return null;
    }

    // 類型 1: https://www.facebook.com/{username}/posts/pfbid...
    const pathMatch = urlObj.pathname.match(/^\/[^\/]+\/posts\/(pfbid[^\/?]+)/);
    if (pathMatch) {
      const pfbid = pathMatch[1];
      return {
        pfbid,
        buildResolvedUrl: (numericId) => {
          const resolved = new URL(url);
          resolved.pathname = resolved.pathname.replace(pfbid, numericId);
          return resolved.toString();
        }
      };
    }

    // 類型 2/3: story_fbid=pfbid...
    if (urlObj.pathname === '/permalink.php' || urlObj.pathname === '/story.php') {
      const storyFbid = urlObj.searchParams.get('story_fbid');
      if (storyFbid && storyFbid.startsWith('pfbid')) {
        return {
          pfbid: storyFbid,
          buildResolvedUrl: (numericId) => {
            const resolved = new URL(url);
            resolved.searchParams.set('story_fbid', numericId);
            return resolved.toString();
          }
        };
      }
    }

    // 類型 4 (photo.php) 或純數字 story_fbid：沒有 pfbid 需要還原
    return null;
  } catch (error) {
    return null;
  }
}

// 呼叫 Graph API，從錯誤訊息中取得數字 ID（不需要 access token）
async function resolvePfbidViaGraphApi(pfbid) {
  const apiUrl = `https://graph.facebook.com/posts/${encodeURIComponent(pfbid)}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  const message = data && data.error && data.error.message;
  if (!message) {
    throw new Error('Graph API did not return a parseable error message');
  }
  const match = message.match(/\d{10,}/);
  if (!match) {
    throw new Error('Could not find a numeric ID in the Graph API error message');
  }
  return match[0];
}

// Popup script for handling the embedded Facebook post (Manifest V3 compatible)
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n texts
  initializeI18n();

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const iframeEl = document.getElementById('embed-frame');
  const urlInfoEl = document.getElementById('url-info');
  const graphResultEl = document.getElementById('graph-result');
  const graphFallbackNoticeEl = document.getElementById('graph-fallback-notice');

  // 載入嵌入版本的文章（原本的手動流程）
  function loadIframeMethod(currentUrl) {
    const encodedUrl = encodeURIComponent(currentUrl);
    const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}`;

    loadingEl.style.display = 'block';
    loadingEl.textContent = browserAPI.i18n.getMessage('loading');

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
  }

  // 顯示 Graph API 解析出來的結果
  function showGraphResult(numericId, resolvedUrl) {
    loadingEl.style.display = 'none';

    document.getElementById('graph-numeric-id').textContent = numericId;
    const resolvedUrlEl = document.getElementById('graph-resolved-url');
    resolvedUrlEl.textContent = resolvedUrl;
    resolvedUrlEl.href = resolvedUrl;

    graphResultEl.style.display = 'block';

    document.getElementById('graph-copy-button').onclick = (e) => {
      navigator.clipboard.writeText(resolvedUrl);
      const button = e.target;
      const originalText = button.textContent;
      button.textContent = browserAPI.i18n.getMessage('graphCopiedMessage');
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    };
  }

  try {
    // Get the current active tab
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;

    // Display current URL info
    urlInfoEl.textContent = `${browserAPI.i18n.getMessage('currentUrl')}${currentUrl}`;

    // Check if the current URL is a Facebook post with pfbid
    if (isFacebookPostUrl(currentUrl)) {
      const pfbidInfo = extractPfbidInfo(currentUrl);

      if (pfbidInfo) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = browserAPI.i18n.getMessage('graphResolving');

        try {
          const numericId = await resolvePfbidViaGraphApi(pfbidInfo.pfbid);
          const resolvedUrl = pfbidInfo.buildResolvedUrl(numericId);
          showGraphResult(numericId, resolvedUrl);
        } catch (graphError) {
          console.error('Graph API resolve failed:', graphError);
          graphFallbackNoticeEl.style.display = 'block';
          loadIframeMethod(currentUrl);
        }
      } else {
        loadIframeMethod(currentUrl);
      }

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
