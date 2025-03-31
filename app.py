import time
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


# Global shot clock state for two players.
shot_clocks = {
    "p1": {
        "duration": 30,
        "remaining": 30,
        "total": 30,
        "running": False,
        "last_update": time.time(),
        "extension_available": True,
        # "time_up": False
    },
    "p2": {
        "duration": 30,
        "remaining": 30,
        "total": 30,
        "running": False,
        "last_update": time.time(),
        "extension_available": True,
        # "time_up": False
    }
}


def update_clock_state(player):
    clock = shot_clocks[player]
    if clock["running"]:
        now = time.time()
        elapsed = now - clock["last_update"]  # use float difference
        clock["remaining"] = max(0, clock["remaining"] - elapsed)
        clock["last_update"] = now
        if clock["remaining"] <= 0:
            clock["running"] = False
            # clock["time_up"] = True


@app.route('/shotclock', methods=['GET'])
def get_shotclock():
    # Update both players before returning state
    update_clock_state("p1")
    update_clock_state("p2")
    return jsonify(shot_clocks)


@app.route('/shotclock', methods=['POST'])
def update_shotclock():
    data = request.json
    command = data.get("command")
    player = data.get("player")  # 'p1' or 'p2'

    # Special command to reset everything at end of rack
    if command == "end_rack":
        for p in shot_clocks:
            shot_clocks[p]["remaining"] = shot_clocks[p]["duration"]
            shot_clocks[p]["running"] = False
            shot_clocks[p]["extension_available"] = True
            shot_clocks[p]["last_update"] = time.time()
            # shot_clocks[p]["time_up"] = False
        return jsonify(shot_clocks)

    # Ensure player key is provided for other commands
    if player not in shot_clocks:
        return jsonify({"error": "Invalid player"}), 400

    clock = shot_clocks[player]

    # clock["time_up"] = False
    if command == "set_30":
        clock["duration"] = 30
        clock["remaining"] = 30
        clock["running"] = True
        clock["stopped_manually"] = False
        clock["last_update"] = time.time()
    elif command == "set_60":
        clock["duration"] = 60
        clock["remaining"] = 60
        clock["running"] = True
        clock["stopped_manually"] = False
        clock["last_update"] = time.time()
    elif command == "extension":
        if clock["extension_available"]:
            clock["remaining"] += 30
            clock["total"] += 30
            clock["extension_available"] = False
            clock["last_update"] = time.time()
        else:
            return jsonify({"error": "Extension already used"}), 400
    elif command == "stop":
        clock["running"] = False
        clock["remaining"] = 0
        clock["stopped_manually"] = True
    elif command == "pause":
        if clock["running"]:
            now = time.time()
            elapsed = int(now - clock["last_update"])
            clock["remaining"] = max(0, clock["remaining"] - elapsed)
            clock["running"] = False
        # else ignore if already paused.
    elif command == "continue":
        if not clock["running"] and clock["remaining"] > 0:
            clock["running"] = True
            clock["last_update"] = time.time()
    else:
        return jsonify({"error": "Invalid command"}), 400

    return jsonify(shot_clocks)

@app.route('/control')
def control():
    return render_template('control.html')


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cuescore', methods=['GET'])
def cuescore_data():
    data = fetch_cuescore_data()
    return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
    # app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000)
