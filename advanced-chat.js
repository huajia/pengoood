import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class AdvancedChat extends LitElement {
    // 1. 样式 (完整重写，确保布局和视觉效果正确)
    static styles = css`
        :host { display: block; height: 100vh; width: 100vw; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; }
        *, *:before, *:after { box-sizing: inherit; }
        
        #api-key-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
        #api-key-modal { background: white; padding: 30px 40px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; width: 90%; max-width: 400px; }
        #api-key-modal h2 { margin: 0 0 10px 0; color: #333; }
        #api-key-modal p { margin: 0 0 20px 0; color: #666; font-size: 0.9em; }
        #api-key-input { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px; font-size: 1em; }
        #save-key-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold; }

        #chat-container { width: 100%; height: 100%; background-color: #ffffff; display: flex; flex-direction: column; overflow: hidden; }
        
        #chat-header { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; padding: 10px 20px; font-size: 1.2em; font-weight: bold; flex-shrink: 0; }
        .header-controls { display: flex; align-items: center; gap: 15px; }
        .header-selector { font-size: 0.8em; padding: 4px 8px; border-radius: 4px; border: 1px solid white; background: rgba(255,255,255,0.2); color: white; }
        .header-selector option { color: black; background: white; }
        #change-key-btn { background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.7em; }
        
        #chat-box { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
        .node-container { padding-left: var(--depth, 0); }
        .message-wrapper { display: flex; flex-direction: column; margin-bottom: 20px; }
        .user-wrapper { align-self: flex-end; align-items: flex-end; }
        .ai-wrapper { align-self: flex-start; align-items: flex-start; }
        .message-content { position: relative; padding: 12px 18px; border-radius: 20px; line-height: 1.6; word-wrap: break-word; background-color: #eef0f2; color: #333; border: 2px solid transparent; transition: border-color 0.3s; }
        .message-content.active-node { border-color: #6e8efb; box-shadow: 0 0 10px rgba(110, 142, 251, 0.5); }
        .user-wrapper .message-content { background-color: #007bff; color: white; }
        .message-content pre { margin: 0; white-space: pre-wrap; font-family: inherit; }
        
        .summary-box, .edit-box { font-size: 0.9em; border-left: 3px solid; padding: 10px 12px; margin-top: 10px; background-color: #f8f9fa; border-radius: 0 8px 8px 0; width: 100%; }
        .summary-box { border-left-color: #6e8efb; color: #555; }
        .summary-box strong { color: #6e8efb; display: block; margin-bottom: 5px; }
        .edit-box { border-left-color: #ffc107; }
        .edit-box textarea { width: 100%; padding: 8px; border: 1px dashed #ccc; border-radius: 4px; font-family: inherit; font-size: 1em; min-height: 60px; background-color: #fff; }

        .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.05); }
        .user-wrapper .controls { border-top-color: rgba(255,255,255,0.2); }
        .ctrl-btn { font-size: 12px; background: #e9ecef; color: #495057; border: 1px solid #ced4da; padding: 4px 10px; border-radius: 15px; cursor: pointer; transition: all 0.2s; }
        .ctrl-btn:hover:not(:disabled) { background: #dee2e6; border-color: #adb5bd;}
        .ctrl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .save-btn { background: #28a745; color: white; border-color: #28a745;}
        .cancel-btn { background: #6c757d; color: white; border-color: #6c757d;}
        .new-branch-btn { background: #17a2b8; color: white; border-color: #17a2b8;}
        .regenerate-btn { background: #ffc107; color: black; border-color: #ffc107;}
        .delete-btn { background: #dc3545; color: white; border-color: #dc3545;}
        .copy-table-btn { margin-left: auto; background: #007bff; color: white; border-color: #007bff;}
        
        .loading-container { align-self: center; padding: 10px 18px;}
        .loading-dot { display: inline-block; width: 8px; height: 8px; background-color: #888; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .loading-dot:nth-child(3) { animation-delay: -0.32s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }

        #input-container { display: flex; padding: 15px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9; flex-shrink: 0; align-items: flex-end; }
        #user-input { flex-grow: 1; padding: 12px 18px; border: 1px solid #ccc; border-radius: 25px; resize: none; font-size: 16px; margin-right: 10px; outline: none; max-height: 200px; }
        #send-btn { height: 48px; padding: 0 25px; background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: bold; flex-shrink: 0; }
        #send-btn:disabled { background: #ccc; cursor: not-allowed; }
    `;

    static properties = {
        apiKey: { type: String },
        conversationTree: { type: Object, state: true },
        activeNodeId: { type: String, state: true },
        summaryStrategy: { type: String, state: true },
        isLoading: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.conversationTree = { 'root': { id: 'root', parentId: null, children: [], role: 'system' } };
        this.activeNodeId = 'root';
        this.summaryStrategy = 'none';
        this.isLoading = false;
        this.API_URL = "https://gateway.ai.cloudflare.com/v1/452ed95357c6a64ce00711d64f4ce307/gemini/google-ai-studio/v1beta/models/gemini-2.0-flash:generateContent";
    }

    // --- Helper & API Functions ---
    isMarkdownTable(text) { return text && text.includes('|') && text.includes('-'); }
    convertMarkdownTableToTsv(text) { return text.split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|') && !/^[| -]+$/.test(l)).map(l => l.slice(1, -1).split('|').map(c => c.trim().replace(/\*\*/g, '')).join('\t')).join('\n'); }
    async callApi(payload) { return fetch(this.API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey }, body: JSON.stringify({ contents: payload }) }); }
    async getSummary(text, type) {
        if (!text || type === 'none') return null;
        const prompt = type === 'short' ? `一句话总结：\n"${text}"` : `详细总结：\n"${text}"`;
        try {
            const response = await this.callApi([{ role: "user", parts: [{ text: prompt }] }]);
            if (!response.ok) return "摘要生成失败";
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "摘要生成失败";
        } catch (error) { return "摘要生成失败"; }
    }
    
    // --- Tree & State Management (重构) ---
    getNode(id) { return this.conversationTree[id]; }
    updateNode(id, updates) {
        if (!this.getNode(id)) return;
        this.conversationTree = { ...this.conversationTree, [id]: { ...this.getNode(id), ...updates } };
    }
    getContextForApi(nodeId) {
        const history = [];
        let currentNode = this.getNode(nodeId);
        while (currentNode && currentNode.id !== 'root') {
            history.unshift(currentNode);
            currentNode = this.getNode(currentNode.parentId);
        }
        return history.map(msg => ({ role: msg.role, parts: [{ text: this.summaryStrategy === 'none' ? msg.fullText : msg.summary || msg.fullText }] }));
    }

    deleteNodeAndChildren(nodeIdToDelete) {
        if (nodeIdToDelete === 'root') return;
        let newTree = { ...this.conversationTree };
        const parent = this.getNode(this.getNode(nodeIdToDelete).parentId);
        
        const nodesToDelete = new Set();
        const queue = [nodeIdToDelete];
        while(queue.length > 0) {
            const currentId = queue.shift();
            if(!currentId || !newTree[currentId]) continue;
            nodesToDelete.add(currentId);
            newTree[currentId].children.forEach(childId => queue.push(childId));
        }

        for (const id of nodesToDelete) {
            delete newTree[id];
        }
        
        if (parent) {
            const updatedParent = {
                ...parent,
                children: parent.children.filter(childId => childId !== nodeIdToDelete)
            };
            newTree[parent.id] = updatedParent;
        }

        this.conversationTree = newTree;
        if (this.activeNodeId === nodeIdToDelete || nodesToDelete.has(this.activeNodeId)) {
            this.activeNodeId = parent ? parent.id : 'root';
        }
    }
    
    // --- Edit, Branch, Send & Regenerate Logic ---
    toggleEdit(id, field) {
        const isEditingKey = `isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`;
        const msg = this.getNode(id);
        if(msg) this.updateNode(id, { [isEditingKey]: !msg[isEditingKey] });
    }

    async saveEdit(id, field, newValue) {
        this.isLoading = true;
        const isEditingKey = `isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`;
        this.updateNode(id, { [field]: newValue, [isEditingKey]: false });
        if (field === 'fullText') {
            this.updateNode(id, { summary: '正在重新生成...' });
            const newSummary = await this.getSummary(newValue, this.summaryStrategy);
            this.updateNode(id, { summary: newSummary });
        }
        this.isLoading = false;
    }

    async sendMessage(parentNodeId) {
        const userInput = this.shadowRoot.getElementById('user-input');
        const userText = userInput.value.trim();
        if (userText === "" || this.isLoading) return;
        
        this.isLoading = true;
        userInput.value = "";
        
        const parentNode = this.getNode(parentNodeId);
        // If the active node is not a leaf node, it means we are creating a new branch.
        // We must delete the old branch first.
        if (parentNode.children.length > 0) {
            // Create a copy before iterating to avoid issues with modification during loop
            const childrenToDelete = [...parentNode.children];
            childrenToDelete.forEach(childId => this.deleteNodeAndChildren(childId));
        }
        
        const newNodeId = `user-${Date.now()}`;
        const userNode = { id: newNodeId, parentId: parentNodeId, role: 'user', fullText: userText, summary: null, children: [], isEditingText: false, isEditingSummary: false };
        this.conversationTree = { ...this.conversationTree, [newNodeId]: userNode };
        this.updateNode(parentNodeId, { children: [...this.getNode(parentNodeId).children, newNodeId] });
        this.activeNodeId = newNodeId;
        
        this.updateNode(newNodeId, { summary: '正在生成...' });
        const summary = await this.getSummary(userText, this.summaryStrategy);
        this.updateNode(newNodeId, { summary });

        await this.generateAiResponse(newNodeId);
    }
    
    async regenerateResponse(aiNodeId) {
        this.isLoading = true;
        const parentId = this.getNode(aiNodeId).parentId;
        this.deleteNodeAndChildren(aiNodeId); // Delete only the AI node and its children
        this.activeNodeId = parentId; // Set active node back to the user's prompt
        await this.generateAiResponse(parentId);
    }

    async generateAiResponse(parentId) {
        this.isLoading = true;
        const contextForAI = this.getContextForApi(parentId);
        try {
            const response = await this.callApi(contextForAI);
            if (!response.ok) throw new Error((await response.json()).error.message);
            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiText) {
                const aiNodeId = `model-${Date.now()}`;
                const aiNode = { id: aiNodeId, parentId: parentId, role: 'model', fullText: aiText, summary: null, children: [], isEditingText: false, isEditingSummary: false };
                this.conversationTree = { ...this.conversationTree, [aiNodeId]: aiNode };
                this.updateNode(parentId, { children: [...this.getNode(parentId).children, aiNodeId] });
                this.activeNodeId = aiNodeId;
                
                this.updateNode(aiNodeId, { summary: '正在生成...' });
                const aiSummary = await this.getSummary(aiText, this.summaryStrategy);
                this.updateNode(aiNodeId, { summary: aiSummary });
            } else { this.activeNodeId = parentId; }
        } catch (error) { this.activeNodeId = parentId; } 
        finally { this.isLoading = false; }
    }

    // --- Render Functions (Complete and Corrected) ---
    render() {
        if (!this.apiKey) {
            return html`
                <div id="api-key-overlay">
                    <div id="api-key-modal">
                        <h2>请输入 API 密钥</h2>
                        <p>密钥将保存在您的浏览器中，方便下次使用。</p>
                        <input id="api-key-input" type="password" placeholder="AIzaSy...">
                        <button id="save-key-btn" @click=${this._saveKeyAndStart}>开始聊天</button>
                    </div>
                </div>
            `;
        }
        
        return html`
            <div id="chat-container">
                <div id="chat-header">
                    <div class="header-controls">
                        <select class="header-selector" .value=${this.summaryStrategy} @change=${(e) => this.summaryStrategy = e.target.value}>
                            <option value="none">无摘要 (记性差)</option>
                            <option value="short">短摘要 (推荐)</option>
                            <option value="long">长摘要 (精准)</option>
                        </select>
                    </div>
                    <span>Gemini AI 聊天</span>
                    <button id="change-key-btn" @click=${this._changeKey}>更换密钥</button>
                </div>

                <div id="chat-box" @copy=${this._handleCopy}>
                    ${this.renderTree(this.conversationTree.root)}
                    ${this.isLoading ? html`<div class="loading-container"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>` : ''}
                </div>

                <div id="input-container">
                     <textarea id="user-input" placeholder="在活动节点 (${this.activeNodeId}) 继续对话..." @keypress=${this._handleKeypress}></textarea>
                     <button id="send-btn" @click=${() => this.sendMessage(this.activeNodeId)} ?disabled=${this.isLoading}>发送</button>
                </div>
            </div>
        `;
    }

    renderTree(node, depth = 0) {
        if (!node) return '';
        // Recursive rendering of the conversation tree
        return html`
            ${node.id !== 'root' ? html`
                <div class="node-container" style="--depth: ${depth * 20}px">
                    ${this._renderNode(node)}
                </div>
            ` : ''}
            ${node.children.map(childId => this.renderTree(this.getNode(childId), depth + 1))}
        `;
    }

    _renderNode(node) {
        return html`
            <div class="message-wrapper ${node.role === 'user' ? 'user-wrapper' : 'ai-wrapper'}">
                <div class="message-content ${this.activeNodeId === node.id ? 'active-node' : ''}">
                    ${node.isEditingText ? 
                        html`<textarea class="edit-area" .value=${node.fullText}></textarea>` : 
                        html`<pre>${node.fullText}</pre>`
                    }
                    <div class="controls">
                        ${node.isEditingText ?
                            html`
                                <button class="ctrl-btn save-btn" @click=${(e) => this.saveEdit(node.id, 'fullText', e.target.closest('.edit-box, .message-content').querySelector('.edit-area').value)}>保存</button>
                                <button class="ctrl-btn cancel-btn" @click=${() => this.toggleEdit(node.id, 'fullText')}>取消</button>` :
                            html``
                        }
                        <button class="ctrl-btn delete-btn" @click=${() => this.deleteNodeAndChildren(node.id)} ?disabled=${this.isLoading}>删除分支</button>
                        ${node.role === 'model' ? 
                            html`<button class="ctrl-btn regenerate-btn" @click=${() => this.regenerateResponse(node.id)} ?disabled=${this.isLoading}>重新生成</button>` :
                            html`<button class="ctrl-btn new-branch-btn" @click=${() => this.activeNodeId = node.id} ?disabled=${this.isLoading}>从此回复</button>`
                        }
                        ${this.isMarkdownTable(node.fullText) ? html`<button class="ctrl-btn copy-table-btn" @click=${() => navigator.clipboard.writeText(this.convertMarkdownTableToTsv(node.fullText))}>复制表格</button>` : ''}
                    </div>
                </div>
                ${this.summaryStrategy !== 'none' ? this._renderSummary(node) : ''}
            </div>
        `;
    }

    _renderSummary(node) {
        return html`
            <div class="summary-box">
                <strong>摘要:</strong>
                ${node.isEditingSummary ?
                    html`
                        <textarea class="edit-area" .value=${node.summary || ''}></textarea>
                        <div class="controls">
                             <button class="ctrl-btn save-btn" @click=${(e) => this.saveEdit(node.id, 'summary', e.target.closest('.edit-box, .summary-box').querySelector('.edit-area').value)}>保存</button>
                             <button class="ctrl-btn cancel-btn" @click=${() => this.toggleEdit(node.id, 'summary')}>取消</button>
                        </div>` :
                    html`
                        <pre class="summary-text">${node.summary || (this.summaryStrategy !== 'none' ? '正在生成...' : '已禁用')}</pre>
                        <div class="controls">
                            <button class="ctrl-btn" @click=${() => this.toggleEdit(node.id, 'summary')} ?disabled=${this.isLoading || !node.summary || node.summary === '正在生成...'}>编辑摘要</button>
                        </div>`
                }
            </div>
        `;
    }

    _handleCopy(event) {
        const selection = this.shadowRoot.getSelection();
        const selectedText = selection.toString();
        if (this.isMarkdownTable(selectedText)) {
            event.preventDefault();
            navigator.clipboard.writeText(this.convertMarkdownTableToTsv(selectedText));
        }
    }
    _handleKeypress(event) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.sendMessage(this.activeNodeId); } }
    _saveKeyAndStart() {
        const keyInput = this.shadowRoot.getElementById('api-key-input');
        const key = keyInput.value.trim();
        if (key && key.startsWith("AIzaSy")) { localStorage.setItem('geminiApiKey', key); this.apiKey = key; } 
        else { alert('密钥格式似乎不正确。'); }
    }
    _changeKey() { if(confirm('您确定要清除已保存的密钥并重新输入吗？')) { localStorage.removeItem('geminiApiKey'); this.apiKey = ''; } }
}
customElements.define('advanced-chat', AdvancedChat);