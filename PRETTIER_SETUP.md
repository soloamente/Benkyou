# Prettier Format on Save Setup

## ✅ What's Configured

1. **Prettier installed** in `package.json` (version 3.7.2)
2. **`.prettierrc`** configuration file created
3. **`.prettierignore`** file created
4. **VS Code settings** configured in `.vscode/settings.json`

## 🔧 Setup Steps

### 1. Install Prettier Extension

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for: **"Prettier - Code formatter"**
4. Author: **Prettier**
5. Click **Install**

### 2. Verify Extension is Active

1. Open any `.tsx` or `.ts` file
2. Look at the **bottom-right corner** of VS Code status bar
3. You should see **"Prettier"** or a formatter icon
4. If you see something else (like "TypeScript"), click it and select **"Prettier - Code formatter"**

### 3. Test Manual Formatting

1. Open `apps/web/src/components/sign-up-form.tsx`
2. Make a small change (add some spaces)
3. Press `Shift+Alt+F` (or `Shift+Option+F` on Mac)
4. If prompted, select **"Prettier - Code formatter"** and check **"Always use this formatter"**

### 4. Reload VS Code

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Reload Window"**
3. Press Enter

### 5. Verify Format on Save Works

1. Open a file
2. Make a formatting change (add extra spaces, break a line)
3. Press `Ctrl+S` to save
4. The file should auto-format

## 🐛 Troubleshooting

### If format on save still doesn't work:

1. **Check Output Panel for Errors:**
   - Press `Ctrl+Shift+U`
   - Select **"Prettier"** from the dropdown
   - Look for error messages

2. **Check User Settings:**
   - Press `Ctrl+,` to open Settings
   - Search for "format on save"
   - Make sure it's enabled
   - Search for "default formatter"
   - Make sure Prettier is selected

3. **Try Format Document With:**
   - Press `Ctrl+Shift+P`
   - Type: **"Format Document With..."**
   - Select **"Prettier - Code formatter"**
   - This should format the file

4. **Verify Prettier is Installed:**

   ```bash
   bunx prettier --version
   ```

   Should show: `3.7.2` or similar

5. **Test from Command Line:**
   ```bash
   bun run format -- apps/web/src/components/sign-up-form.tsx
   ```

## 📝 Notes

- Prettier **won't format** content inside string literals (like `className=" w-full  "`)
- Prettier formats code structure, not string content
- For string content, you may need to fix manually or use a linter

## 🎯 Quick Test

Run this command to format all files:

```bash
bun run format
```
