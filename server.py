from flask import Flask, render_template, request, send_from_directory, flash, redirect, url_for, jsonify
import json
from openai_api import generate_text

app = Flask(__name__)
app.secret_key = 'your_secret_key'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/import', methods=['POST'])
def import_data():
    if 'file' not in request.files:
        flash('No file was uploaded', 'error')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('No file was selected', 'error')
        return redirect(request.url)
    if file and file.filename.lower().endswith('.json'):
        data = json.load(file)
        return jsonify(data)
    else:
        flash('File must be a JSON file', 'error')
        return redirect(request.url)

@app.route('/export', methods=['POST'])
def export_data():
    data = request.get_json()
    filename = 'exported_cue_cards.json'
    with open(filename, 'w') as file:
        json.dump(data, file)
    return send_from_directory('.', filename, as_attachment=True)

@app.route('/generate-text', methods=['POST'])
def generate_text_route():
    data = request.get_json()
    prompt = data.get('prompt')
    model = data.get('model')
    
    if not prompt or not model:
        return jsonify({'error': 'Invalid request'}), 400

    generated_text = generate_text(prompt, model)
    if generated_text:
        return jsonify({'generated_text': generated_text})
    else:
        return jsonify({'error': 'Unable to generate text'}), 500
    
if __name__ == '__main__':
    app.run(debug=True)