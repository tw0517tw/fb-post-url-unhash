# 如何發布新版本

## 自動化 Release 流程

這個專案已經設定了 GitHub Action，會在推送新的 tag 時自動創建 release。

### 發布步驟

1. **更新版本號**：

   ```bash
   # 編輯 manifest.json 中的 version 欄位
   # 例如：從 "0.1" 改為 "0.2"
   ```

2. **提交變更**：

   ```bash
   git add .
   git commit -m "Bump version to 0.2"
   git push origin main
   ```

3. **創建並推送 tag**：

   ```bash
   # 創建 tag（版本號要與 manifest.json 一致）
   git tag v0.2
   
   # 推送 tag 到 GitHub
   git push origin v0.2
   ```

4. **自動化流程**：
   - GitHub Action 會自動觸發
   - 創建包含擴充功能檔案的 ZIP 壓縮檔
   - 生成 release 草稿
   - 附加自動產生的 release notes
   - 上傳 ZIP 檔案作為 release 附件

5. **完成發布**：
   - 前往 GitHub repository 的 Releases 頁面
   - 檢查自動創建的草稿 release
   - 編輯並發布正式版本

### ZIP 檔案內容

自動產生的 ZIP 檔案會包含：

- `manifest.json` - 擴充功能設定檔
- `background.js` - 背景腳本
- `popup.html` - 彈出視窗介面
- `popup.js` - 彈出視窗邏輯
- `icons/` - 圖示資料夾
- `README.md` - 說明檔案

### 注意事項

- Tag 名稱必須以 `v` 開頭（例如：`v1.0.0`, `v0.1.1`）
- 建議版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)
- Release 會先創建為草稿，可以檢查後再手動發布
- 自動產生的 release notes 會包含自上次 release 以來的所有 commit 訊息
