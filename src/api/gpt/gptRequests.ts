/* eslint-disable @typescript-eslint/naming-convention */
import { GPTAnswer, GPTRequestBody } from './types';
import * as vscode from 'vscode';
import axios from 'axios';

const gptURL = "https://api.openai.com/v1/completions";

export async function getAnswer(prompt: string, temperature: number, max_tokens: number) : Promise<string> {

  const body: GPTRequestBody = {
    max_tokens,
    prompt,
    temperature,
    model: "text-davinci-003"
  };
  const api_key = vscode.workspace.getConfiguration('gpt').get("api_key");
  if (!api_key) {
    return "No api key!!!";
  }
  try {
    const answer: GPTAnswer = await axios.post(gptURL, 
      body,
      { headers: {"Authorization" : `Bearer ${api_key}`}
    }).then(function(response) {
      return response.data;
    });
    return answer.choices[0].text;
  } catch(err) {
    console.log(err);
    return "error!";
  }
}

// getAnswer("who is lao tzu", 1, 1000).then(ans => {
//   console.log(ans);
// });