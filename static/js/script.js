async function fetchCuescoreData() {
    const url = '/cuescore';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateOverlayData(data) {
    const match = data.match;
    const player1 = match.playerA;
    const player2 = match.playerB;
    const raceTo = match.raceTo;
    const discipline = match.discipline;
    const scoreA = match.scoreA;
    const scoreB = match.scoreB;
    const round = match.roundName;

    // const match = data.match;
    // const player1 = {
    // name: 'Ajdin',
    //     country: { image: '../static/assets/your-flag.png' }
    // };
    // const player2 = {
    //     name: 'Player Two',
    //     country: { image: '../static/assets/another-flag.png' }
    // };
    //
    // const raceTo = 'match.raceTo';
    // const discipline = '9 ball';
    // const scoreA = '0';
    // const scoreB = '1';
    // const round = 'match.roundName';

    let bottomBar = "";

    if (discipline !== '' && round !== '') {
        bottomBar = discipline + '<br>' + round;
    } else if (discipline !== '') {
        bottomBar = discipline;
    } else if (round !== '') {
        bottomBar = round;
    }

    $('#p1-name').html(player1.name);
    $('#p2-name').html(player2.name);
    $('#p1-score').html(scoreA);
    $('#p2-score').html(scoreB);
    $('#discipline').html(bottomBar);
    $('#race-to').html(`<div class="race-to">Race to ${raceTo} </div>`);
    $('#p1-flag').html(`<img class="flag-hg" src=${player1.country.image} alt="">`);
    $('#p2-flag').html(`<img class="flag-hg" src=${player2.country.image} alt="">`);;
}


async function main() {
    while (true) {
        const data = await fetchCuescoreData();
        if (data["status"] === "PLAYING") {
            await updateOverlayData(data);
            $('#main')[0].style.display = 'block';
        } else {
            $('#main')[0].style.display = 'block';
        }


        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

// Function to update the shot clock display for a given player
function updateShotClockDisplay(playerId, clockState) {
    const container = document.getElementById(playerId + "-shotclock");
    const bar = container.querySelector(".shotclock-bar");
    const timeDisplay = container.querySelector(".shotclock-time");
    const extDisplay = container.querySelector(".shotclock-extension");
    const warningAudio = document.getElementById("alarm-sound-" + playerId);
    const buzzAudio = document.getElementById("buzz-sound-" + playerId);

    // Update clock state if running
    // (Assuming the backend already updated the remaining time)
    const remaining = clockState.remaining;
    const duration = clockState.duration;
    const percent = (remaining / duration) * 100;

    bar.style.width = Math.min(percent, 100) + "%";

    if (clockState.running) {
        displayShotClock(playerId, true);
    } else if (!clockState.stopped_manually && remaining <= 0) {
        buzzAudio.loop = false;
        buzzAudio.play();
        setTimeout(() => {
          displayShotClock(playerId, false);
        }, 1000);
    } else {
        displayShotClock(playerId, false);
    }

    // Change bar color based on thresholds
    if (remaining <= 5 && remaining > 0) {
        console.log(remaining);
        bar.style.backgroundColor = "red";

        if (warningAudio) {
            warningAudio.play().catch(err => {
                console.warn("Audio playback not allowed yet.", err);
            });
        }
    } else if (remaining <= 10) {
        bar.style.backgroundColor = "orange";
    } else {
        bar.style.backgroundColor = "green";
    }

    // Update numeric display
    timeDisplay.textContent = Math.ceil(remaining) + "s";


    // Show extension indicator if available
    extDisplay.style.backgroundColor = clockState.extension_available ? "green" : "red";

}

function displayShotClock(playerId, isDisplay) {
    const container = document.getElementById(playerId + "-shotclock");
    const warningAudio = document.getElementById("alarm-sound-" + playerId);
    const buzzAudio = document.getElementById("buzz-sound-" + playerId);
    if (!isDisplay) {
        container.style.display = 'none';
        stopAudio(warningAudio);
        stopAudio(buzzAudio);
    } else {
        container.style.display = 'block';
    }
}

function stopAudio(audio) {
        audio.pause();
        audio.currentTime = 0;
    }

// Poll shot clock state every second and update both players' displays
async function updateAllShotClocks() {
    try {
        const response = await fetch('/shotclock');
        const data = await response.json();

        updateShotClockDisplay("p1", data.p1);
        updateShotClockDisplay("p2", data.p2);
    } catch (error) {
        console.error("Error fetching shot clock state:", error);
    }
}

setInterval(updateAllShotClocks, 1000);

// Also call it once at start
updateAllShotClocks();


main().catch(error => console.error('Error:', error));
