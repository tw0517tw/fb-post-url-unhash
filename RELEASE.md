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
| `CHROME_EXTENSION_ID` | 擴充功能 ID | Chrome Web Store Developer Dashboard |
| `CHROME_CLIENT_ID` | OAuth2 Client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `CHROME_CLIENT_SECRET` | OAuth2 Client Secret | Google Cloud Console |
| `CHROME_REFRESH_TOKEN` | OAuth2 Refresh Token | 使用 OAuth2 流程取得 |

**取得 Chrome API 憑證步驟**：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)，建立/選擇專案，啟用 **Chrome Web Store API**
2. 設定「OAuth 同意畫面」，填基本資訊（App name、support email 等）即可
3. 「憑證」→「建立憑證」→「OAuth 用戶端 ID」，應用程式類型選 **「網頁應用程式 (Web application)」**（不要選 Desktop app，Desktop 類型無法設定下面要用的重新導向 URI）
4. 在「已授權的重新導向 URI」加入：
   ```
   https://developers.google.com/oauthplayground
   ```
5. 建立後記下 **Client ID** 和 **Client secret**
6. 用 [OAuth Playground](https://developers.google.com/oauthplayground/) 換 refresh token：
   - 右上齒輪 ⚙️ 勾選「Use your own OAuth credentials」，填入上面的 Client ID/Secret
   - Step 1 手動輸入 scope `https://www.googleapis.com/auth/chromewebstore`，點 Authorize APIs
   - 用你發布擴充功能的 Google 帳號登入、同意（會看到「未驗證應用程式」警告，點「進階」→「前往...(不安全)」繼續即可，這是正常的，不需要做 Google 品牌驗證）
   - Step 2 點「Exchange authorization code for tokens」，取得 `refresh_token`
7. **重要**：如果 OAuth 同意畫面停留在「測試中 (Testing)」狀態，換到的 refresh token 只有 **7 天** 效期（回應會有 `refresh_token_expires_in: 604799`）。回「OAuth 同意畫面」點 **「發布應用程式 (Publish App)」** 改成「正式版 (In production)」（不需要送 Google 驗證，因為 `chromewebstore` 是 sensitive scope、非 restricted scope，個人使用不受 100 人上限影響），改完**重新走一次 Playground 授權流程**拿新的 refresh token，這次回應就不會再有 `refresh_token_expires_in` 欄位，代表長期有效
8. Extension ID 是在 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)（需付一次性 $5 註冊費）上傳過一次草稿後，項目清單/網址列上的那組 32 碼字串

**踩過的坑**：
- 授權網址如果手動組，容易漏字/多字（例如 client_id 結尾漏或多打字元）導致 `invalid_client`，建議從 Cloud Console 直接複製貼上
- 部分瀏覽器擴充功能（廣告攔截/隱私類）會攔截、改寫 OAuth 重新導向網址的參數，導致 Google 端出現籠統的 `unknownerror`，換一個沒裝該擴充功能的瀏覽器或用無痕視窗即可解決

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

使用 [Edge Add-ons Update API v1.1](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api)，用 API Key 驗證，**不需要**自己去 Azure Portal 建立/關聯 Entra ID (Azure AD) 租用戶。

| Secret 名稱 | 說明 | 取得方式 |
|------------|------|---------|
| `EDGE_PRODUCT_ID` | Edge 擴充功能 Product ID | Partner Center 擴充功能總覽頁 |
| `EDGE_CLIENT_ID` | API Client ID | Partner Center「Publish API」頁面 |
| `EDGE_API_KEY` | API Key | Partner Center「Publish API」頁面 |

**取得 Edge API 憑證步驟**：

1. 前提：需要有 [Partner Center](https://partner.microsoft.com/dashboard) 開發者帳號，且該擴充功能已經手動上架過一次
2. 前往 [Partner Center Edge 開發者儀表板](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
3. 左側選單 **Microsoft Edge** → **Publish API**
4. 點 **「Create API credentials」**（第一次啟用可能要等幾分鐘）
5. 畫面會直接顯示 **Client ID** 和 **API key**，記下來（API key 只會顯示一次）
6. Product ID：Partner Center → **Microsoft Edge** → **Overview**，點進該擴充功能，總覽頁 / 網址列會有一組 GUID

**踩過的坑**：
- ⚠️ **不要走「帳戶設定 → 使用者管理 → Microsoft Entra Apps」那條路** 手動建立 Azure AD App 走 OAuth client_credentials 流程 —— 這是給其他 Partner Center 用途的通用機制，用在 Edge Add-ons API 上會一直卡在 `AADSTS500014: The service principal for resource 'https://api.addons.microsoftedge.microsoft.com' is disabled`，即使手動建立 Entra 租用戶、關聯、產生 admin consent 都無法解決
- 正確路徑是上面這個「Publish API」頁面，Microsoft 後端會直接幫你建好對應的憑證，完全不用碰 Entra/Azure AD

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
| Edge Add-ons | [Edge Add-ons Update API v1.1](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api) | 微軟官方 REST API（ApiKey 驗證） |

---

## 注意事項

- Tag 名稱必須以 `v` 開頭（例如：`v1.0.0`, `v0.1.1`）
- 建議版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)
- GitHub Release 會先創建為草稿，可以檢查後再手動發布
- 商店發佈需要先完成各商店的開發者帳號註冊
- 首次發佈需要先在各商店手動上架擴充功能，之後才能使用 CI 自動更新
