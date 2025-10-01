# FB Post URL Unhash

這個瀏覽器擴充功能可以將 Facebook 文章的 hash URL（包含 pfbid）轉換成可以提取數字 ID 的格式。

## 功能

- 當瀏覽 Facebook 文章頁面時（格式：`https://www.facebook.com/<account_name>/posts/pfbidXXXXXXX`）
- 點擊擴充功能按鈕開啟彈出視窗，直接在視窗內顯示嵌入的 Facebook 文章
- 或使用右鍵選單，在新分頁中開啟 Facebook 嵌入頁面
- 從嵌入的文章中可以手動複製包含數字 ID 的真實 URL

## 靈感來源

本擴充功能的實作靈感來自於 [這個 stack overflow 的回答](https://stackoverflow.com/a/76897937) 其中所指引到的 [Hacker News 討論內容](https://news.ycombinator.com/item?id=32118095)，在此致謝。

## 下載安裝

### 從擴充功能商店安裝

- **Firefox**：[Firefox Add-ons](https://addons.mozilla.org/zh-TW/firefox/addon/fb-post-url-unhash/)
- **Edge**：[Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/fb-post-url-unhash/hlflbmnnaeonnbbiojbhkoemlmamolmj)

### 開發者模式安裝（手動載入）

#### Firefox

1. 開啟 Firefox
2. 前往 `about:debugging`
3. 點擊「This Firefox」
4. 點擊「Load Temporary Add-on」
5. 選擇此專案中的 `manifest.json` 檔案

#### Edge / Chrome

1. 開啟瀏覽器
2. 前往擴充功能管理頁面
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案的資料夾

## 使用方式

### 方法一：使用擴充功能彈出視窗（推薦）

1. 開啟任何 Facebook 單一文章頁面（URL 包含 pfbid）
2. 點擊瀏覽器工具列上的擴充功能按鈕
3. 彈出視窗會顯示目前網址並載入嵌入版本的文章
4. 在嵌入的文章中，右鍵點擊「發文時間」連結
5. 選擇「複製鏈結」即可取得包含數字 ID 的真實網址
6. 點擊網址區域可以複製目前頁面網址

### 方法二：使用右鍵選單

1. 在 Facebook 文章頁面上右鍵點擊
2. 選擇「以嵌入格式重開此文章」
3. 新分頁會在目前分頁的下一個位置開啟，顯示嵌入版本的文章
4. 從嵌入頁面中右鍵點擊「發文時間」連結
5. 選擇「複製鏈結」即可取得包含數字 ID 的真實網址

## 檔案結構

```text
fb-post-url-unhash/
├── manifest.json      # 擴充功能設定檔
├── background.js      # 背景腳本，處理右鍵選單功能
├── popup.html         # 彈出視窗的 HTML 介面
├── popup.js          # 彈出視窗的邏輯腳本
├── icons/
│   ├── border-48.png # 擴充功能圖示
│   └── icon-64.png   # 擴充功能圖示
└── README.md         # 此說明檔案
```

## 技術細節

- 使用 Manifest V3 (支援 Firefox、Chrome、Edge 等瀏覽器)
- 需要 activeTab 權限以及 contextMenus 權限
- 彈出視窗使用 iframe 直接嵌入 Facebook 文章，提供即時預覽
- 右鍵選單僅在符合 Facebook 文章格式的頁面上顯示
- 新分頁會在目前分頁的下一個位置開啟，改善使用體驗
- 使用 encodeURIComponent 正確編碼 URL 參數
- 包含錯誤處理和載入狀態顯示

## 注意事項

- 此擴充功能僅在包含 `pfbid` 的 Facebook 文章 URL 上工作
- 彈出視窗功能需要 Facebook 允許 iframe 嵌入，如果無法載入會提供新分頁開啟的備用選項
- 需要手動從嵌入的文章中複製發文時間連結來取得數字 ID URL
- 右鍵選單僅在符合條件的 Facebook 文章頁面上出現
- 開發者模式載入的擴充功能可能需要在瀏覽器重啟後重新載入

## 故障排除

- 如果彈出視窗中的嵌入文章無法載入，請使用「在新分頁中開啟」按鈕
- 如果右鍵選單沒有出現，請確認目前頁面是 Facebook 文章且 URL 包含 pfbid
- 點擊彈出視窗中的網址區域可以複製目前頁面的網址
