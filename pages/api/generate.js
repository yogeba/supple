import { Configuration, OpenAIApi } from "openai";
import {NextResponse} from "next/server";

const apiKey = process.env.OPENAI_API_KEY || "";

const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export const config = {
  edge: 'runtime'
}

export default async function (req) {
  if (!apiKey) {
    return NextResponse.json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    }).status(500)
  }

  const health = req.body.health || '';
  if (health.trim().length === 0) {
    return NextResponse.json({
      error: {
        message: "Please enter a valid Health Condition, Sypmtom, Disease or Supplement ",
      }
    }).status(400);
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(health),
      temperature: 0,
      max_tokens: 1000,
    });

    return NextResponse.json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json(error.response.data).status(error.response.status)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return NextResponse.json({
        error: {
          message: 'An error occurred during your request.',
        }
      }).status(500)
    }
  }
}

function generatePrompt(health) {
  return `
answer the following questions about ${health}  in an array of JSON objects:

What is ${health}?
What are the main signs and symptoms of ${health}?
How is ${health} diagnosed?
What are some of the main medical treatments for ${health}?
Have any supplements been studied for ${health}?
How could diet affect ${health}?
Are there any other treatments for ${health}?
What causes ${health}?
The latest research on ${health}?
List 10 supplements for ${health}  `
}

export { generatePrompt };
