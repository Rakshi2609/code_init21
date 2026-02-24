/**
 * SAMAAN AI — Background Service Worker v4
 * ==========================================
 * Page content is extracted via chrome.scripting.executeScript with an
 * INLINE FUNCTION — no content-script message-passing race conditions.
 */

// Open side panel on icon click
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("[SAMAAN] Side panel setup error:", err));

// Context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "samaan-clarify",
        title: "SAMAAN: Ask AI about Selected Text",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "samaan-clarify" || !tab?.id) return;
    try {
        await chrome.sidePanel.open({ tabId: tab.id });
        setTimeout(() => chrome.runtime.sendMessage({
            type: "CLARIFY_TEXT", text: info.selectionText || "",
        }), 700);
    } catch (err) {
        console.error("[SAMAAN] Context menu error:", err);
    }
});

// Inline extractor — runs INSIDE the page tab via executeScript
function extractPageContentInline() {
    try {
        const url         = location.href;
        const title       = document.title || "";
        const metaEl      = document.querySelector('meta[name="description"]');
        const description = metaEl ? metaEl.content : "";

        const clone = document.body ? document.body.cloneNode(true) : null;
        if (clone) {
            ["script","style","noscript","svg","iframe","nav","footer","aside"]
                .forEach(t => clone.querySelectorAll(t).forEach(e => e.remove()));
        }
        let bodyText = ((clone && (clone.innerText || clone.textContent)) || "")
            .replace(/[ \t]{2,}/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim()
            .slice(0, 8000);

        const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
            .map(h => `${h.tagName}: ${(h.innerText || "").trim()}`)
            .filter(Boolean).slice(0, 20).join("\n");

        return { url, title, description, bodyText, headings };
    } catch(e) {
        return { url: location.href, title: document.title,
                 description: "", bodyText: "", headings: "", error: e.message };
    }
}

// Message Router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "CONTENT_SELECTION") {
        chrome.runtime.sendMessage({ type: "CLARIFY_TEXT", text: message.text });
        return false;
    }

    if (message.type === "GET_PAGE_CONTENT") {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            if (!tab?.id) return sendResponse({ success: false, error: "No active tab" });

            const url = tab.url || "";
            if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")
                || url.startsWith("about:") || url.startsWith("edge://")
                || url.startsWith("moz-extension://")) {
                return sendResponse({
                    success: false,
                    error: `Cannot access browser internal pages. Open a regular website first.`
                });
            }

            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: extractPageContentInline,
                });
                const data = results?.[0]?.result;
                if (data) sendResponse({ success: true, data });
                else sendResponse({ success: false, error: "No data returned from page" });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
        });
        return true;
    }

    return false;
});
