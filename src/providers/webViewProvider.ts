import * as vscode from 'vscode';
import { getAnswer } from '../api/gpt/gptRequests';

export class WebViewProvider implements vscode.WebviewViewProvider {
    constructor(
        private readonly _extensionContext: vscode.ExtensionContext
	) { }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        // Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

        webviewView.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
                Use a content security policy to only allow loading styles from our extension directory,
                and only allow scripts that have a specific nonce.
                (See the 'webview-sample' extension sample for img-src content security policy examples)
            -->
        </head>
        <style nonce=${nonce}>
            .vs-style {
                background: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                font-weight: var(--vscode-editor-font-weight);
            }
            .button {
                border-color: var(--vscode-editor-foreground);
            }
            .textarea {
                border-color: var(--vscode-editor-foreground);
                resize: none;
                width: 100%;
                height: 150px;
                background: none;
                margin: 10px 0px;
            }
        </style>
        <body>
            <div style="display: flex; flex-direction: column;">
                <textarea class="vs-style textarea" id="input" class="vs-style"></textarea>
                <div>
                    <button class="button vs-style" id="enter">enter</button>
                    <button class="button vs-style" id="clear">clear</button>
                </div>
                <p id="answer"></p>
            </div>
            <script nonce=${nonce}>
                const vscode = acquireVsCodeApi();
                const input = document.getElementById('input');
                document.getElementById('enter').addEventListener('click', (e) => {
                    vscode.postMessage({ type: 'newTextEntered', value: input.value }, '*');
                });
                document.getElementById('clear').addEventListener('click', (e) => {
                    document.getElementById('answer').innerHTML = "";
                    document.getElementById('input').value = "";
                });
                window.addEventListener('message', event => {
                    switch(event.data.type) {
                        case 'message':
                            document.getElementById('answer').innerHTML = event.data.value;
                            break;
                        case 'action':
                            switch(event.data.value) {
                                case 'disable-button':
                                    document.getElementById('enter').disabled = true;
                                    break;  
                                case 'enable-button':
                                    document.getElementById('enter').disabled = false;
                                    break;
                            }
                            break;
                    }
                });
            </script>
        </body>
        </html>
        `;

        webviewView.webview.options = {enableScripts:true};

        webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'newTextEntered':
					{
                        if(!data.value) {
                            webviewView.webview.postMessage({type: 'message', value: 'Please enter some text'});
                            return;
                        }
                        webviewView.webview.postMessage({type: 'action', value: 'disable-button'});
                        webviewView.webview.postMessage({type: 'message', value: 'Thinking...'});
                        getAnswer(data.value, 0, 4000).then(answer => {
                        webviewView.webview.postMessage({type: 'message', value: 'Thinking...'});
                            webviewView.webview.postMessage({type: 'message', value: answer});
                            webviewView.webview.postMessage({type: 'action', value: 'enable-button'});
                        });
						break;
					}
			}
		}, undefined, this._extensionContext.subscriptions);
    }

}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}