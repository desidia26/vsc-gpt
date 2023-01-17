import * as vscode from 'vscode';

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
            <title>Cat Colors</title>
        </head>
        <body>
            <input id="input"/>
            <button id="enter">enter</button>
            <script>
                const vscode = acquireVsCodeApi();
                const input = document.getElementById('input);
                document.getElementById('enter').addEventListener('click', (e) => {
                    console.log("value: " + input.value);
                    console.log("event: ", e);

                    vscode.setState({ text: "asd" });
                    vscode.postMessage({ type: 'newTextEntered', value: "asd" }, '*');
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
                        vscode.window.showInformationMessage(`You entered: ${data.value}`);
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