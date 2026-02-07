# Figma MCP setup for Cursor

Use this so the AI can read your Figma selection and implement the deck detail design.

## 1. Add Figma MCP to Cursor

**Option A – One-click (recommended)**  
Open this link in your browser; it should open Cursor and prompt to install the Figma MCP server:

[Figma MCP – Install in Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=Figma&config=eyJ1cmwiOiJodHRwczovL21jcC5maWdtYS5jb20vbWNwIn0=)

Then click **Install** and **Connect**, and complete the Figma OAuth in the browser.

**Option B – Manual**  
1. In Cursor: **File → Preferences → Cursor Settings → MCP** (or open `%USERPROFILE%\.cursor\mcp.json`).
2. In the `mcpServers` object, add this entry (keep the comma before it if it’s not the first server):

```json
"figma": {
  "type": "http",
  "url": "https://mcp.figma.com/mcp"
}
```

3. Save, then restart Cursor or reload MCP servers.
4. In MCP settings, click **Connect** next to Figma and complete the Figma OAuth flow.

## 2. Get your design into the chat

1. In **Figma**, select the **frame** (or top-level layer) that represents your deck detail screen.
2. **Right-click → Copy link to selection** (or Copy link to frame).
3. Paste that link here in the chat and say: “Implement this design for the deck detail page” (or similar).

The AI will use the Figma MCP to read that frame and then update the deck detail page to match.

## Notes

- The Figma MCP is link-based: it uses the **node ID** from the URL to know which frame to read.
- If Figma MCP tools don’t appear, restart Cursor and try again.
- Rate limits: Starter plan ≈ 6 tool calls/month; paid plans use normal Figma API limits.
