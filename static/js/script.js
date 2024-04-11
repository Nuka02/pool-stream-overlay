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

    $('#p1-name').html(player1.name);
    $('#p2-name').html(player2.name);
    $('#p1-score').html(scoreA);
    $('#p2-score').html(scoreB);
    $('#discipline').html(discipline);
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
            $('#main')[0].style.display = 'none';
        }


        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

main().catch(error => console.error('Error:', error));
