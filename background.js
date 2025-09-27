// Background script for handling context menu and other background tasks

// Add context menu for right-click functionality
browser.contextMenus.create({
  id: "fb-post-url-unhash",
  title: "以嵌入格式重開此文章",
  contexts: ["page"],
  documentUrlPatterns: ["*://www.facebook.com/*/posts/pfbid*"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fb-post-url-unhash") {
    const encodedUrl = encodeURIComponent(tab.url);
    const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}`;

    // Open in new tab next to current tab
    browser.tabs.create({
      url: embedUrl,
      active: true,
      index: tab.index + 1  // 在當前分頁的下一個位置開啟新分頁
    });
  }
});
