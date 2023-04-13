import openai
import json

openai.api_key = "" # hey if youre reading this, use a config file and DONT DO THIS.

def finish_json(text):
    while True:
        try:
            json_data = json.loads(text)
            return json.dumps(json_data)
        except json.JSONDecodeError as e:
            pos = e.pos
            text = text[:pos].rstrip().rsplit('}', 1)[0] + '}]}'
            # Check if the text has reached a valid starting point
            if text.count('{') == text.count('}') and text.count('[') == text.count(']'):
                break
    return text

def generate_text(prompt, model): # these prompts work but you can change them to your needs.
    try:
        if model == 'text-davinci-003':
            response = openai.Completion.create(
                engine=model,
                prompt=f"Create study cards on these topics, complete with a name of the card, breifly outlining the topic of that card, description detailing information or questions and an answer that has a detailed answer to the question in the description:\n\n{prompt}\n\n Return all the study cards one single response in this format and DO NOT INCLUDE ANYTHING ELSE IN YOUR ANSWER. Only respond with the JSON values:\n\n" + '{"cueCards":[{"name":"Card 1","description":"This is the description for Card 1.","answer":"This is the answer for Card 1."},{"name":"Card 2","description":"This is the description for Card 2.","answer":"This is the answer for Card 2."},{"name":"Card 3","description":"This is the description for Card 3.","answer":"This is the answer for Card 3."}]}',
                max_tokens=550,
                n=1,
                stop=None,
                temperature=0.7,
            )
            finaldata = finish_json(response.choices[0].text.strip())
            return finaldata
        else:
            response = openai.ChatCompletion.create(
                model=model,
                messages=[
                {"role": "user", "content": f"Create study cards on these topics, complete with a name of the card, breifly outlining the topic of that card, description detailing information or questions and an answer that has a detailed answer to the question in the description:\n\n{prompt}\n\n Return all the study cards one single response in this format and DO NOT INCLUDE ANYTHING ELSE IN YOUR ANSWER. Only respond with the JSON values:\n\n" + '{"cueCards":[{"name":"Card 1","description":"This is the description for Card 1.","answer":"This is the answer for Card 1."},{"name":"Card 2","description":"This is the description for Card 2.","answer":"This is the answer for Card 2."},{"name":"Card 3","description":"This is the description for Card 3.","answer":"This is the answer for Card 3."}]}'}
                ],
                max_tokens=550,
                n=1,
                stop=None,
                temperature=0.7,
            )
            finaldata = finish_json(response['choices'][0]['message']['content'])
            return finaldata
    except Exception as e:
        print(f"Error generating text: {e}")
        return None