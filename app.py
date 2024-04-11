from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

def fetch_cuescore_data():
    lang = os.getenv("LANG", "en")
    table_id = os.getenv("TABLE_ID")
    url = f'https://cuescore.com/ajax/scoreboard/overlay-v2.php?lang={lang}&tableId={table_id}'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch data from Cuescore API", "status_code": response.status_code}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cuescore', methods=['GET'])
def cuescore_data():
    data = fetch_cuescore_data()
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
