// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getAnswer } from './api/gpt/gptRequests';
import { WebViewProvider } from './providers/webViewProvider';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vsc-gpt" is now active!');
	const key = vscode.workspace.getConfiguration('gpt').get("api_key");
	if(!key) {
		console.log('no key found!');
		vscode.window.showWarningMessage("No api key for gpt set!");
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vsc-gpt.askTheThing', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		getAnswer("What is love?", 1, 1000).then(answer => {
			vscode.window.showInformationMessage(answer);
		});
	});
	vscode.window.registerWebviewViewProvider('gptWebView', new WebViewProvider(context));

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
