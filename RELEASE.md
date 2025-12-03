# 如何發布新版本

## 自動化 Release 流程

這個專案已經設定了 GitHub Action，會在推送新的 tag 時自動創建 release，並可透過手動觸發發佈到各大瀏覽器擴充功能商店。

### 發布步驟

1. **更新版本號**：

   ```bash
   # 編輯 manifest.json 中的 version 欄位
   # 例如：從 "0.3.3" 改為 "0.3.4"
   ```

2. **提交變更**：

   ```bash
   git add .
   git commit -m "Bump version to 0.3.4"
   git push origin main
   ```

3. **創建並推送 tag**：

   ```bash
   # 創建 tag（版本號要與 manifest.json 一致）
   git tag v0.3.4
   
   # 推送 tag 到 GitHub
   git push origin v0.3.4
   ```

4. **自動化流程**：
   - GitHub Action 會自動觸發
   - 創建 Chrome/Edge 版本（Manifest V3）和 Firefox 版本（Manifest V2）的 ZIP 壓縮檔
   - 生成 release 草稿並上傳 ZIP 檔案

5. **完成發布**：
   - 前往 GitHub repository 的 Releases 頁面
   - 檢查自動創建的草稿 release
   - 編輯並發布正式版本

---

## 手動發佈到瀏覽器商店

商店發佈採用手動觸發方式，讓你可以在確認 GitHub Release 沒問題後，再選擇要發佈到哪些商店。

### 發佈步驟

1. 前往 GitHub repository 的 **Actions** 頁面
2. 在左側選擇 **Create Release** workflow
3. 點擊右上角的 **Run workflow** 按鈕
4. 填入以下資訊：
   - **tag_name**：要發佈的 tag 名稱（例如：`v0.3.4`）
   - **publish_chrome**：勾選以發佈到 Chrome Web Store
   - **publish_firefox**：勾選以發佈到 Firefox Add-ons
   - **publish_edge**：勾選以發佈到 Edge Add-ons
5. 點擊 **Run workflow** 開始發佈

### 設定各商店的 Secrets

前往 **Settings → Secrets and variables → Actions → Secrets** 新增以下 secrets：

#### Chrome Web Store

| Secret 名稱 | 說明 | 取得方式 |
|------------|------|---------|
| `CHROME_EXTENSION_ID` | 擴充功能 ID | Chrome Web Store URL 中的 ID |
| `CHROME_CLIENT_ID` | OAuth2 Client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `CHROME_CLIENT_SECRET` | OAuth2 Client Secret | Google Cloud Console |
| `CHROME_REFRESH_TOKEN` | OAuth2 Refresh Token | 使用 OAuth2 流程取得 |

**取得 Chrome API 憑證步驟**：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立專案並啟用 Chrome Web Store API
3. 建立 OAuth2 憑證（Desktop App 類型）
4. 使用 OAuth2 授權流程取得 refresh token

#### Firefox Add-ons (AMO)

| Secret 名稱 | 說明 | 取得方式 |
|------------|------|---------|
| `FIREFOX_JWT_ISSUER` | AMO API Key | [AMO API Key 頁面](https://addons.mozilla.org/developers/addon/api/key/) |
| `FIREFOX_JWT_SECRET` | AMO API Secret | AMO API Key 頁面 |

**取得 Firefox API 憑證步驟**：

1. 登入 [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. 前往 [API Keys 頁面](https://addons.mozilla.org/developers/addon/api/key/)
3. 產生新的 API 金鑰

#### Microsoft Edge Add-ons

| Secret 名稱 | 說明 | 取得方式 |
|------------|------|---------|
| `EDGE_PRODUCT_ID` | Edge 擴充功能 Product ID | Partner Center |
| `EDGE_CLIENT_ID` | Azure AD App Client ID | Azure Portal |
| `EDGE_CLIENT_SECRET` | Azure AD App Client Secret | Azure Portal |
| `EDGE_ACCESS_TOKEN_URL` | Token URL | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token` |

**取得 Edge API 憑證步驟**：

1. 前往 [Partner Center](https://partner.microsoft.com/dashboard)
2. 在 Azure Portal 註冊應用程式
3. 設定 API 權限並取得憑證

---

## ZIP 檔案內容

自動產生兩種版本的 ZIP 檔案：

### Chrome/Edge 版本（Manifest V3）

- `manifest.json` - Manifest V3 格式
- `background.js` - Service Worker
- `popup.html` - 彈出視窗介面
- `popup.js` - 彈出視窗邏輯
- `icons/` - 圖示資料夾
- `_locales/` - 多語言支援
- `README.md` - 說明檔案

### Firefox 版本（Manifest V2）

- `manifest.json` - Manifest V2 格式（含 browser_specific_settings）
- `background.js` - 背景腳本
- `popup.html` - 彈出視窗介面
- `popup.js` - 彈出視窗邏輯
- `icons/` - 圖示資料夾
- `_locales/` - 多語言支援
- `README.md` - 說明檔案

---

## 使用的工具

| 商店 | 方式 | 說明 |
|-----|------|------|
| Chrome Web Store | [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api_update) | Google 官方 REST API |
| Firefox Add-ons | [web-ext](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/) | Mozilla 官方 CLI 工具 |
| Edge Add-ons | [Edge Add-ons API](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api) | 微軟官方 REST API |

---

## 注意事項

- Tag 名稱必須以 `v` 開頭（例如：`v1.0.0`, `v0.1.1`）
- 建議版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)
- GitHub Release 會先創建為草稿，可以檢查後再手動發布
- 商店發佈需要先完成各商店的開發者帳號註冊
- 首次發佈需要先在各商店手動上架擴充功能，之後才能使用 CI 自動更新
