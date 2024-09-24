// JavaScript code to fetch data and handle events

// Fetch leaderboard data on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchLeaderboard();
});

function fetchLeaderboard() {
    fetch(`${CONFIG.BASE_URL}/leaderboard`)
        .then(response => response.json())
        .then(data => displayLeaderboard(data.leaderboard))
        .catch(error => console.error('Error fetching leaderboard:', error));
}

function displayLeaderboard(leaderboard) {
    const tbody = document.querySelector('#leaderboard-table tbody');
    tbody.innerHTML = '';

    leaderboard.forEach(player => {
        const tr = document.createElement('tr');

        const rankTd = document.createElement('td');
        rankTd.textContent = player.rank;
        tr.appendChild(rankTd);

        const avatarTd = document.createElement('td');
        const avatarImg = document.createElement('img');
        avatarImg.src = player.avatarUrl;
        avatarImg.alt = player.name + ' Avatar';
        avatarImg.classList.add('avatar');
        avatarTd.appendChild(avatarImg);
        tr.appendChild(avatarTd);

        const nameTd = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.textContent = player.name;
        nameLink.href = '#';
        nameLink.classList.add('player-name');
        nameLink.dataset.userId = player.userId;
        nameLink.addEventListener('click', (e) => {
            e.preventDefault();
            togglePlayerDetails(e.target);
        });
        nameTd.appendChild(nameLink);
        tr.appendChild(nameTd);

        const totalScoreTd = document.createElement('td');
        const score = (player.totalScore * CONFIG.TOTAL_SCORE_MULTIPLIER).toFixed(CONFIG.TOTAL_SCORE_DECIMALS);
        totalScoreTd.textContent = score;
        tr.appendChild(totalScoreTd);

        const playCountTd = document.createElement('td');
        playCountTd.textContent = player.playCount;
        tr.appendChild(playCountTd);

        tbody.appendChild(tr);

        // Placeholder for player details row
        const detailsTr = document.createElement('tr');
        detailsTr.classList.add('player-details');
        const detailsTd = document.createElement('td');
        detailsTd.colSpan = 5;
        detailsTd.innerHTML = '<div class="player-scores-container" id="player-scores-' + player.userId + '"></div>';
        detailsTr.appendChild(detailsTd);
        tbody.appendChild(detailsTr);
    });
}

function togglePlayerDetails(element) {
    const userId = element.dataset.userId;
    const tr = element.parentElement.parentElement;
    const detailsTr = tr.nextElementSibling;

    if (detailsTr.style.display === 'table-row') {
        detailsTr.style.display = 'none';
    } else {
        // Fetch player scores and display
        fetchPlayerScores(userId, detailsTr);
        detailsTr.style.display = 'table-row';
    }
}

function fetchPlayerScores(userId, detailsTr) {
    const container = detailsTr.querySelector('.player-scores-container');

    // Check if data is already loaded
    if (container.dataset.loaded === 'true') {
        return;
    }

    fetch(`${CONFIG.BASE_URL}/player/${userId}/scores`)
        .then(response => {
            if (response.status === 404) {
                throw new Error('Player not found');
            }
            return response.json();
        })
        .then(data => displayPlayerScores(data, container))
        .catch(error => {
            console.error('Error fetching player scores:', error);
            displayMessage('Error fetching player scores: ' + error.message);
        });
}

function displayPlayerScores(playerData, container) {
    container.innerHTML = '';

    const scoresHeader = document.createElement('div');
    scoresHeader.classList.add('scores-header');

    const playerAvatar = document.createElement('img');
    playerAvatar.src = playerData.avatarUrl;
    playerAvatar.alt = playerData.name + ' Avatar';
    scoresHeader.appendChild(playerAvatar);

    const playerName = document.createElement('h2');
    playerName.textContent = playerData.name;
    playerName.dataset.userId = playerData.userId; // Store userId for force fetch
    scoresHeader.appendChild(playerName);

    const forceFetchButton = document.createElement('button');
    forceFetchButton.textContent = 'Refresh';
    forceFetchButton.classList.add('force-fetch-button');
    forceFetchButton.addEventListener('click', function() {
        forceFetchPlayer(playerData.userId, container);
    });
    scoresHeader.appendChild(forceFetchButton);

    container.appendChild(scoresHeader);

    // Create the scores table
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('scores-table-container');

    const scoresTable = document.createElement('table');
    scoresTable.classList.add('scores-table');

    // Create table headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = [
        'Cover',
        'Song Name [Difficulty]',
        'Accuracy',
        'Time Set',
        'Bad Cuts',
        'Missed Notes',
        'Bomb Cuts',
        'Walls Hit',
        'Pauses',
        'Full Combo'
    ];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    scoresTable.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    playerData.highScores.forEach(scoreEntry => {
        const tr = document.createElement('tr');

        // Cover
        const coverTd = document.createElement('td');
        const coverImg = document.createElement('img');
        coverImg.src = scoreEntry.leaderboard.coverUrl;
        coverImg.alt = scoreEntry.leaderboard.name + ' Cover';
        coverImg.classList.add('song-cover');
        coverTd.appendChild(coverImg);
        tr.appendChild(coverTd);

        // Song Name [Difficulty]
        const songNameTd = document.createElement('td');
        songNameTd.textContent = scoreEntry.leaderboard.name + ' [' + scoreEntry.leaderboard.diffName + ']';
        tr.appendChild(songNameTd);

        if (scoreEntry.score) {
            // Accuracy
            const accuracyTd = document.createElement('td');
            accuracyTd.textContent = (scoreEntry.score.accuracy * 100).toFixed(2) + '%';
            tr.appendChild(accuracyTd);

            // Time Set
            const timeSetTd = document.createElement('td');
            timeSetTd.textContent = new Date(scoreEntry.score.timeset * 1000).toLocaleString();
            tr.appendChild(timeSetTd);

            // Bad Cuts
            const badCutsTd = document.createElement('td');
            badCutsTd.textContent = scoreEntry.score.badCuts;
            tr.appendChild(badCutsTd);

            // Missed Notes
            const missedNotesTd = document.createElement('td');
            missedNotesTd.textContent = scoreEntry.score.missedNotes;
            tr.appendChild(missedNotesTd);

            // Bomb Cuts
            const bombCutsTd = document.createElement('td');
            bombCutsTd.textContent = scoreEntry.score.bombCuts;
            tr.appendChild(bombCutsTd);

            // Walls Hit
            const wallsHitTd = document.createElement('td');
            wallsHitTd.textContent = scoreEntry.score.wallsHit;
            tr.appendChild(wallsHitTd);

            // Pauses
            const pausesTd = document.createElement('td');
            pausesTd.textContent = scoreEntry.score.pauses;
            tr.appendChild(pausesTd);

            // Full Combo
            const fullComboTd = document.createElement('td');
            fullComboTd.textContent = scoreEntry.score.fullCombo ? 'Yes' : 'No';
            tr.appendChild(fullComboTd);
        } else {
            // If no score, fill cells with placeholders
            const placeholders = ['No score yet', '-', '-', '-', '-', '-', '-', '-'];
            placeholders.forEach(placeholder => {
                const td = document.createElement('td');
                td.textContent = placeholder;
                tr.appendChild(td);
            });
        }

        tbody.appendChild(tr);
    });

    scoresTable.appendChild(tbody);
    tableContainer.appendChild(scoresTable);
    container.appendChild(tableContainer);

    // Mark data as loaded
    container.dataset.loaded = 'true';
}

function forceFetchPlayer(userId, container) {
    fetch(`${CONFIG.BASE_URL}/player/${userId}/force-fetch`, {
        method: 'POST'
    })
        .then(response => {
            if (response.status === 404) {
                throw new Error('Player not found');
            } else if (response.status === 500) {
                throw new Error('Re-fetch failed');
            }
            return response.json();
        })
        .then(data => {
            displayMessage(data.message);
            // Clear existing data and re-fetch the player's scores
            container.dataset.loaded = 'false';
            fetchPlayerScores(userId, container.parentElement.parentElement);
        })
        .catch(error => {
            console.error('Error force fetching player:', error);
            displayMessage('Error: ' + error.message);
        });
}

function displayMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 5000);
}
