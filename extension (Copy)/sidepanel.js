/**
 * SAMAAN AI Chatbot — Side Panel v3
 * ===================================
 * Smart chatbot powered by Featherless.ai.
 * Extracts full page content and uses it as context for every answer.
 */

(function () {
    "use strict";

    // ── Hard-coded LLM Configuration ──────────────────────────────────────
    const LLM_API_KEY   = "rc_60c188585eec8d6ef4555e65d2d5bfe5056610c480b005f8bdb6748267763077";
    const LLM_BASE_URL  = "https://api.featherless.ai/v1";
    const LLM_MODEL     = "openai/gpt-oss-120b";
    const MAX_TOKENS    = 800;   // keep responses tight = faster TTFT
    const MAX_HISTORY   = 8;    // sliding context window: last N messages
    const CTX_CHARS     = 6000; // page text limit sent to LLM

    // ── DOM References ─────────────────────────────────────────────────────
    const chatMessages     = document.getElementById("chat-messages");
    const chatInput        = document.getElementById("chat-input");
    const sendBtn          = document.getElementById("send-btn");
    const themeToggle      = document.getElementById("theme-toggle");
    const themeIconMoon    = document.getElementById("theme-icon-moon");
    const themeIconSun     = document.getElementById("theme-icon-sun");
    const clearChatBtn     = document.getElementById("clear-chat-btn");
    const refreshCtxBtn    = document.getElementById("refresh-context-btn");
    const pageDomain       = document.getElementById("page-domain");
    const contextBanner    = document.getElementById("context-banner");
    const contextStatus    = document.getElementById("context-status");
    const ctxDot           = document.getElementById("ctx-dot");
    const voiceBtn         = document.getElementById("voice-btn");

    // ── State ──────────────────────────────────────────────────────────────
    let pageContext   = null;   // { url, title, description, bodyText, headings, links }
    let chatHistory   = [];     // [{ role: "user"|"assistant", content: string }]
    let isLoading     = false;
    let abortCtrl     = null;   // AbortController for in-flight request
    let voiceActive   = false;  // mic state
    let rafPending    = false;  // rAF throttle flag for stream renders

    // ── Theme ──────────────────────────────────────────────────────────────
    function initTheme() {
        const saved = localStorage.getItem("samaan-theme") || "dark";
        applyTheme(saved);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("samaan-theme", theme);
        if (themeIconMoon) themeIconMoon.style.display = theme === "dark" ? "block" : "none";
        if (themeIconSun)  themeIconSun.style.display  = theme === "light" ? "block" : "none";
    }

    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
    });

    // ── Page Context Loader ────────────────────────────────────────────────
    async function loadPageContext() {
        setContextStatus("reading", "Reading page…");
        pageDomain.textContent = "loading";

        try {
            const response = await chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" });

            if (response && response.success && response.data) {
                pageContext = response.data;
                const domain = new URL(pageContext.url).hostname;
                pageDomain.textContent = domain;
                const chars = pageContext.bodyText ? pageContext.bodyText.length : 0;
                setContextStatus(
                    "ready",
                    `${pageContext.title || domain} · ${chars.toLocaleString()} chars`
                );
                addWelcomeMessage();
            } else {
                throw new Error(response?.error || "Unknown error");
            }
        } catch (err) {
            pageContext = null;
            pageDomain.textContent = "no page";
            setContextStatus("error", err.message || "Cannot read page");
            addWelcomeMessage();
        }
    }

    function setContextStatus(state, text) {
        contextStatus.textContent = text;
        // Remove old state classes, add new one
        contextBanner.className = "ctx-pill ctx-" + state;
    }

    // ── Welcome Message ────────────────────────────────────────────────────
    function addWelcomeMessage() {
        if (chatMessages.querySelector(".chat-bubble")) return;

        const pageName = pageContext ? `"${pageContext.title || pageContext.url}"` : null;
        const msg = pageContext
            ? `**Page loaded:** ${pageName}\n\nI've read this page. Ask me anything about it:\n\n- Summarise the main points\n- Explain any section\n- Find specific information\n- Compare or analyse content`
            : `**No page context** \u2014 I couldn't read the current page (you may be on a browser internal page).\n\nYou can still ask me general questions, or navigate to a website and click **Re-read**.`;

        appendBubble("assistant", msg);
    }

    // ── Build System Prompt ────────────────────────────────────────────────
    // Aggressively compact to minimise input tokens → faster first-token time.
    function buildSystemPrompt() {
        const base =
            "You are SAMAAN AI, a fast, expert browser assistant. " +
            "Be concise + accurate. Use markdown (bold/lists) where helpful. " +
            "Answer using the page context below if relevant; otherwise use general knowledge.";

        if (!pageContext) return base;

        // Truncate body text to CTX_CHARS and only top 15 headings
        const body  = pageContext.bodyText.slice(0, CTX_CHARS);
        const heads = (pageContext.headings || "").split("\n").slice(0, 15).join("\n");

        const ctx = [
            `\n--- PAGE: ${pageContext.title} (${pageContext.url}) ---`,
            heads ? `HEADINGS:\n${heads}` : "",
            `CONTENT:\n${body}`,
            "--- END PAGE ---",
        ].filter(Boolean).join("\n");

        return base + ctx;
    }

    // ── LLM API Call (streaming) ───────────────────────────────────────────
    async function callLLM(userMessage) {
        // Sliding window: keep only the last MAX_HISTORY turns
        const historySlice = chatHistory.slice(-MAX_HISTORY);

        const messages = [
            { role: "system", content: buildSystemPrompt() },
            ...historySlice,
            { role: "user", content: userMessage },
        ];

        abortCtrl = new AbortController();
        const timeoutId = setTimeout(() => abortCtrl.abort(), 30000);

        const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages,
                max_tokens: MAX_TOKENS,
                temperature: 0.3,  // lower = faster + more focused
                top_p: 0.9,
                stream: true,
            }),
            signal: abortCtrl.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            let detail = `API error ${response.status}`;
            try { detail = JSON.parse(errText).error?.message || detail; } catch {}
            throw new Error(detail);
        }

        return response; // streamed
    }

    // ── Send Message ───────────────────────────────────────────────────────
    async function sendMessage(userText) {
        const text = userText.trim();
        if (!text || isLoading) return;

        isLoading = true;
        setInputState(false);

        // Show user bubble
        appendBubble("user", text);
        chatHistory.push({ role: "user", content: text });

        // Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            const response = await callLLM(text);

            // Remove typing indicator, create streaming assistant bubble
            removeTypingIndicator(typingId);
            const { el: assistantBubble, textEl } = appendBubble("assistant", "", true);

            let fullContent = "";
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // rAF-throttled renderer — avoids blocking the main thread on every token
            function scheduleRender() {
                if (rafPending) return;
                rafPending = true;
                requestAnimationFrame(() => {
                    rafPending = false;
                    renderMarkdown(textEl, fullContent);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

                for (const line of lines) {
                    const dataStr = line.replace(/^data: /, "").trim();
                    if (dataStr === "[DONE]") break;
                    try {
                        const delta = JSON.parse(dataStr).choices?.[0]?.delta?.content || "";
                        fullContent += delta;
                        scheduleRender();
                    } catch {}
                }
            }

            if (!fullContent) fullContent = "(No response received)";
            renderMarkdown(textEl, fullContent); // final flush
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatHistory.push({ role: "assistant", content: fullContent });

            // Add copy button to this bubble
            addCopyButton(assistantBubble, fullContent);

        } catch (err) {
            removeTypingIndicator(typingId);
            if (err.name === "AbortError") {
                appendBubble("error", "⏹️ **Request cancelled or timed out.** Try again.");
            } else {
                appendBubble("error", `⚠️ **Error:** ${err.message}`);
            }
            console.error("[SAMAAN] LLM error:", err);
        } finally {
            isLoading = false;
            abortCtrl = null;
            setInputState(true);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // ── DOM Helpers ────────────────────────────────────────────────────────
    function appendBubble(role, text, empty = false) {
        const wrap = document.createElement("div");
        wrap.className = `chat-bubble-wrap bubble-${role}`;
        // Label ("You" / "SAMAAN AI")
        const label = document.createElement("div");
        label.className = "bubble-label";
        label.textContent = role === "user" ? "You" : role === "assistant" ? "SAMAAN AI" : "";
        if (role !== "error") wrap.appendChild(label);
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";

        const textEl = document.createElement("div");
        textEl.className = "bubble-text";

        if (!empty) renderMarkdown(textEl, text);

        bubble.appendChild(textEl);
        wrap.appendChild(bubble);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return { el: wrap, textEl };
    }

    function appendTypingIndicator() {
        const id = "typing-" + Date.now();
        const wrap = document.createElement("div");
        wrap.className = "chat-bubble-wrap bubble-assistant";
        wrap.id = id;
        wrap.innerHTML = `<div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function addCopyButton(wrapEl, text) {
        const btn = document.createElement("button");
        btn.className = "bubble-copy-btn";
        btn.title = "Copy response";
        btn.textContent = "📋 Copy";
        btn.addEventListener("click", async () => {
            await navigator.clipboard.writeText(text).catch(() => {});
            btn.textContent = "✅ Copied!";
            setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
        });
        wrapEl.querySelector(".chat-bubble").appendChild(btn);
    }

    // Simple markdown → HTML (bold, italic, lists, code)
    // ── Markdown renderer ──────────────────────────────────────────────────
    // Full block-level parser: handles bold/italic, tables, lists, headings,
    // code blocks and links without any regex-order conflicts.

    function escHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function inlineMd(text) {
        return escHtml(text)
            // inline code (handle before bold/italic so backtick content is safe)
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            // bold-italic ***
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            // bold **
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // italic * or _
            .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
            .replace(/_([^_\n]+?)_/g, '<em>$1</em>')
            // link [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    function splitTableCols(line) {
        return line.split('|')
            .map(c => c.trim())
            .filter((c, i, a) => !(i === 0 && c === '') && !(i === a.length - 1 && c === ''));
    }

    function renderMarkdown(el, md) {
        const lines = md.split('\n');
        let html = '';
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // ── Fenced code block ─────────────────────────────────────────
            if (line.startsWith('```')) {
                let code = '';
                i++;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    code += lines[i] + '\n';
                    i++;
                }
                html += `<pre class="code-block"><code>${escHtml(code.replace(/\n$/, ''))}</code></pre>`;
                i++; // skip closing ```
                continue;
            }

            // ── Markdown table ────────────────────────────────────────────
            // Detect: current line has pipes AND next line is a separator (---|---)
            if (line.includes('|') && i + 1 < lines.length &&
                /^[\|:\-\s]+$/.test(lines[i + 1])) {
                const headers = splitTableCols(line);
                html += '<div class="md-table-wrap"><table class="md-table">';
                html += '<thead><tr>' +
                    headers.map(h => `<th>${inlineMd(h)}</th>`).join('') +
                    '</tr></thead><tbody>';
                i += 2; // skip header row + separator row
                while (i < lines.length && lines[i].includes('|') &&
                       !/^[\|:\-\s]+$/.test(lines[i])) {
                    const cells = splitTableCols(lines[i]);
                    html += '<tr>' +
                        cells.map(c => `<td>${inlineMd(c)}</td>`).join('') +
                        '</tr>';
                    i++;
                }
                html += '</tbody></table></div>';
                continue;
            }

            // ── Headings ──────────────────────────────────────────────────
            if (line.startsWith('### ')) { html += `<h4>${inlineMd(line.slice(4))}</h4>`; i++; continue; }
            if (line.startsWith('## '))  { html += `<h3>${inlineMd(line.slice(3))}</h3>`; i++; continue; }
            if (line.startsWith('# '))   { html += `<h2>${inlineMd(line.slice(2))}</h2>`; i++; continue; }

            // ── Bullet list (collect consecutive) ─────────────────────────
            if (/^[-*•] /.test(line)) {
                html += '<ul>';
                while (i < lines.length && /^[-*•] /.test(lines[i])) {
                    html += `<li>${inlineMd(lines[i].slice(2))}</li>`;
                    i++;
                }
                html += '</ul>';
                continue;
            }

            // ── Numbered list ─────────────────────────────────────────────
            if (/^\d+\. /.test(line)) {
                html += '<ol>';
                while (i < lines.length && /^\d+\. /.test(lines[i])) {
                    html += `<li>${inlineMd(lines[i].replace(/^\d+\. /, ''))}</li>`;
                    i++;
                }
                html += '</ol>';
                continue;
            }

            // ── Empty line ────────────────────────────────────────────────
            if (line.trim() === '') {
                if (html && !html.endsWith('<br>') && !html.endsWith('>')) html += '<br>';
                i++;
                continue;
            }

            // ── Paragraph line ────────────────────────────────────────────
            html += `<span class="md-line">${inlineMd(line)}</span><br>`;
            i++;
        }

        el.innerHTML = html;
    }

    function setInputState(enabled) {
        chatInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        sendBtn.style.opacity = enabled ? "" : "0.4";
        if (enabled) chatInput.focus();
    }

    // ── Clear Chat ─────────────────────────────────────────────────────────
    clearChatBtn.addEventListener("click", () => {
        chatMessages.innerHTML = "";
        chatHistory = [];
        addWelcomeMessage();
    });

    // ── Refresh Context ────────────────────────────────────────────────────
    refreshCtxBtn.addEventListener("click", async () => {
        chatMessages.innerHTML = "";
        chatHistory = [];
        pageContext = null;
        await loadPageContext();
    });

    // ── Input Events ───────────────────────────────────────────────────────
    sendBtn.addEventListener("click", () => {
        const text = chatInput.value;
        chatInput.value = "";
        autoResize();
        sendMessage(text);
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const text = chatInput.value;
            chatInput.value = "";
            autoResize();
            sendMessage(text);
        }
    });

    chatInput.addEventListener("input", autoResize);

    function autoResize() {
        chatInput.style.height = "auto";
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
    }

    // ── Voice Control ─────────────────────────────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (SpeechRecognition && voiceBtn) {
        recognition = new SpeechRecognition();
        recognition.continuous  = false;
        recognition.interimResults = true;
        recognition.lang        = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            voiceActive = true;
            voiceBtn.classList.add("voice-active");
            voiceBtn.title = "Listening… click to stop";
        };

        recognition.onend = () => {
            voiceActive = false;
            voiceBtn.classList.remove("voice-active");
            voiceBtn.title = "Voice input";
        };

        // Show interim transcript in the textarea live
        recognition.onresult = (event) => {
            let interim = "";
            let finalText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalText += t;
                else interim += t;
            }
            chatInput.value = finalText || interim;
            autoResize();
            // If we got a final result, auto-send after a short pause
            if (finalText.trim()) {
                setTimeout(() => {
                    const text = chatInput.value.trim();
                    if (text) {
                        chatInput.value = "";
                        autoResize();
                        sendMessage(text);
                    }
                }, 600);
            }
        };

        recognition.onerror = (e) => {
            console.warn("[SAMAAN Voice] error:", e.error);
            if (e.error === "not-allowed") {
                appendBubble("error", "⚠️ Microphone permission denied. Please allow microphone access.");
            }
        };

        voiceBtn.addEventListener("click", () => {
            if (voiceActive) {
                recognition.stop();
            } else {
                chatInput.value = "";
                autoResize();
                recognition.start();
            }
        });
    } else if (voiceBtn) {
        // Browser doesn't support Speech API
        voiceBtn.title = "Voice input not supported in this browser";
        voiceBtn.style.opacity = "0.4";
        voiceBtn.style.cursor = "not-allowed";
    }

    // ── Messages from Background (context menu / FAB) ──────────────────────
    if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === "CLARIFY_TEXT" && message.text) {
                chatInput.value = `Please explain: ${message.text}`;
                autoResize();
                chatInput.focus();
            }
        });
    }

    // ── Init ───────────────────────────────────────────────────────────────
    initTheme();
    loadPageContext();
})();
