
// ============================================
// VOLLEYBALL ROTATION TOOL
// ============================================


// --------------------------------------------
// SYSTEMS
// --------------------------------------------

const positions51 = [
    "Setter",
    "Middle 1",
    "Left Side 2",
    "Right Side",
    "Middle 2",
    "Left Side 1"
];

const positions62 = [
    "Setter 1",
    "Middle 1",
    "Left Side 2",
    "Setter 2",
    "Middle 2",
    "Left Side 1"
];


// --------------------------------------------
// GAME VARIABLES
// --------------------------------------------

let system = null;
let positions = [];

let players = Array(6).fill("");
let jerseyNums = Array(6).fill("");

let libero = {
    name: "",
    jersey: ""
};

// Each item represents the player currently
// occupying a rotational position.
//
// Position 0 = court position 1
// Position 1 = court position 2
// Position 2 = court position 3
// Position 3 = court position 4
// Position 4 = court position 5
// Position 5 = court position 6

let courtPlayers = [];

let rotationNumber = 1;


// --------------------------------------------
// LIBERO STATE
// --------------------------------------------

// This is the important change from the Python version.
//
// Instead of putting the libero into the array as
// player #7, we keep track of:
//
// 1. Which middle player was replaced
// 2. Whether the libero is currently on court
//
// This makes rotations much easier to manage.

let liberoState = {
    active: false,
    replacedMiddle: null
};


// --------------------------------------------
// SCORE VARIABLES
// --------------------------------------------

let teamAScore = 0;
let teamBScore = 0;

let setsWonA = 0;
let setsWonB = 0;

let currentSet = 1;

let servingTeam = "Team A";


// ============================================
// PAGE NAVIGATION
// ============================================

function hideAllSections() {

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("systemSetup").classList.add("hidden");
    document.getElementById("rotationSetup").classList.add("hidden");
    document.getElementById("playerSetup").classList.add("hidden");
    document.getElementById("rotationDisplay").classList.add("hidden");
    document.getElementById("scoreTracker").classList.add("hidden");
}


function goHome() {

    hideAllSections();

    document.getElementById("menu").classList.remove("hidden");
}


// ============================================
// ROTATION SETUP
// ============================================

function showRotationSetup() {

    hideAllSections();

    document.getElementById("systemSetup").classList.remove("hidden");

    // Remember that we're setting up a rotation.
    document.getElementById("systemSetup").dataset.mode = "rotation";
}


function showPlayerSetup() {

    hideAllSections();

    document.getElementById("systemSetup").classList.remove("hidden");

    document.getElementById("systemSetup").dataset.mode = "players";
}


function selectSystem(selectedSystem) {

    system = selectedSystem;

    if (system === 5) {
        positions = [...positions51];
    } else {
        positions = [...positions62];
    }

    const mode = document.getElementById("systemSetup").dataset.mode;

    if (mode === "rotation") {

        hideAllSections();

        document.getElementById("rotationSetup").classList.remove("hidden");

    } else {

        hideAllSections();

        document.getElementById("playerSetup").classList.remove("hidden");

        createPlayerInputs();
    }
}


// ============================================
// PLAYER INPUT
// ============================================

function createPlayerInputs() {

    const container = document.getElementById("playerInputs");

    container.innerHTML = "";

    document.getElementById("playerSystemText").textContent =
        `You are using the ${system === 5 ? "5–1" : "6–2"} system.`;

    for (let i = 0; i < 6; i++) {

        const wrapper = document.createElement("div");

        wrapper.className = "player-input";

        wrapper.innerHTML = `
            <input
                type="text"
                id="player-${i}"
                placeholder="${positions[i]}"
                value="${players[i]}"
            >

            <input
                type="number"
                id="jersey-${i}"
                placeholder="#"
                value="${jerseyNums[i]}"
            >
        `;

        container.appendChild(wrapper);
    }

    const liberoWrapper = document.createElement("div");

    liberoWrapper.innerHTML = `
        <label>Libero</label>

        <div class="player-input">

            <input
                type="text"
                id="libero-name"
                placeholder="Libero"
                value="${libero.name}"
            >

            <input
                type="number"
                id="libero-jersey"
                placeholder="#"
                value="${libero.jersey}"
            >

        </div>
    `;

    container.appendChild(liberoWrapper);
}


function savePlayers() {

    for (let i = 0; i < 6; i++) {

        players[i] =
            document.getElementById(`player-${i}`).value.trim();

        jerseyNums[i] =
            document.getElementById(`jersey-${i}`).value.trim();
    }

    libero.name =
        document.getElementById("libero-name").value.trim();

    libero.jersey =
        document.getElementById("libero-jersey").value.trim();

    alert("Players saved!");

    goHome();
}


// ============================================
// ROTATION START
// ============================================

function startRotation() {

    const setterPosition =
        parseInt(
            document.getElementById("setterPosition").value
        );

    /*
        Python:

        for x in range(6):
            court_pos.append((setter_pos - x) % 6)

        JavaScript uses 0-based arrays, so:
        position 1 becomes index 0.
    */

    courtPlayers = [];

    for (let x = 0; x < 6; x++) {

        let index =
            ((setterPosition - 1 - x) % 6 + 6) % 6;

        courtPlayers.push(index);
    }

    rotationNumber = 1;

    liberoState.active = false;
    liberoState.replacedMiddle = null;

    updateLibero();

    hideAllSections();

    document
        .getElementById("rotationDisplay")
        .classList.remove("hidden");

    displayCourt();
}


// ============================================
// LIBERO LOGIC
// ============================================

function updateLibero() {

    /*
        Back-row rotational positions:

        court index 0 = position 1
        court index 1 = position 2
        court index 2 = position 3
        court index 3 = position 4
        court index 4 = position 5
        court index 5 = position 6

        The back row is positions 1, 5 and 6.

        Therefore:
        indexes 0, 4 and 5.
    */

    const backRow = new Set([0, 4, 5]);


    // ----------------------------------------
    // If libero is currently replacing a middle
    // ----------------------------------------

    if (liberoState.active) {

        const replacedIndex =
            courtPlayers.indexOf(
                liberoState.replacedMiddle
            );

        if (replacedIndex !== -1) {

            /*
                If the replaced middle has moved
                to the front row, the libero leaves.
            */

            if (!backRow.has(replacedIndex)) {

                courtPlayers[replacedIndex] =
                    liberoState.replacedMiddle;

                liberoState.active = false;
                liberoState.replacedMiddle = null;
            }
        }
    }


    // ----------------------------------------
    // If libero isn't on court, look for a
    // middle blocker in the back row.
    // ----------------------------------------

    if (!liberoState.active) {

        for (let i = 0; i < courtPlayers.length; i++) {

            const playerIndex = courtPlayers[i];

            const role = positions[playerIndex];

            const isMiddle =
                role === "Middle 1" ||
                role === "Middle 2";

            if (
                backRow.has(i) &&
                isMiddle
            ) {

                liberoState.active = true;

                liberoState.replacedMiddle =
                    playerIndex;

                /*
                    We do NOT change the underlying
                    rotation permanently.

                    We simply display the libero
                    instead of this middle while
                    they are in the back row.
                */

                break;
            }
        }
    }
}


// ============================================
// ROTATION
// ============================================

function rotatePlayers() {

    /*
        This is equivalent to:

        court_pos.append(court_pos.pop(0))

        from the Python program.
    */

    const firstPlayer = courtPlayers.shift();

    courtPlayers.push(firstPlayer);

    rotationNumber++;

    updateLibero();

    displayCourt();
}


// ============================================
// COURT DISPLAY
// ============================================

function displayCourt() {

    const courtPositions = {

        1: document.getElementById("pos1"),
        2: document.getElementById("pos2"),
        3: document.getElementById("pos3"),
        4: document.getElementById("pos4"),
        5: document.getElementById("pos5"),
        6: document.getElementById("pos6")
    };


    for (let position = 1; position <= 6; position++) {

        const element = courtPositions[position];

        element.classList.remove("libero");

        const courtIndex = position - 1;

        const playerIndex =
            courtPlayers[courtIndex];

        let displayName =
            players[playerIndex];

        let jersey =
            jerseyNums[playerIndex];

        let role =
            positions[playerIndex];

        let isLibero = false;


        /*
            Determine whether the libero is currently
            replacing this player.
        */

        if (
            liberoState.active &&
            playerIndex === liberoState.replacedMiddle
        ) {

            displayName = libero.name || "Libero";

            jersey = libero.jersey || "";

            role = "Libero";

            isLibero = true;
        }


        element.innerHTML = `
            <div class="position-number">
                Position ${position}
            </div>

            <div class="player-name">
                ${displayName || "Empty"}
            </div>

            <div class="jersey-number">
                ${jersey ? "#" + jersey : ""}
            </div>

            <div class="role">
                ${role}
            </div>
        `;


        if (isLibero) {
            element.classList.add("libero");
        }
    }


    document.getElementById("rotationNumber").textContent =
        `Rotation ${rotationNumber}`;


    if (liberoState.active) {

        const middle =
            players[liberoState.replacedMiddle];

        document.getElementById("liberoStatus").textContent =
            `Libero is replacing ${middle || "Middle Blocker"}.`;

    } else {

        document.getElementById("liberoStatus").textContent =
            "Libero is currently off the court.";
    }


    // ----------------------------------------
    // Rotation title
    // ----------------------------------------

    document.getElementById("rotationTitle").textContent =
        `${system === 5 ? "5–1" : "6–2"} Starting Rotation`;
}


// ============================================
// SCORE TRACKER
// ============================================

function showScoreTracker() {

    hideAllSections();

    document
        .getElementById("scoreTracker")
        .classList.remove("hidden");

    updateScoreDisplay();
}


// --------------------------------------------
// Add point
// --------------------------------------------

function addPoint(team) {

    if (setsWonA >= 3 || setsWonB >= 3) {
        return;
    }


    if (team === "A") {

        teamAScore++;

        servingTeam =
            document.getElementById("teamAName").value ||
            "Team A";

    } else {

        teamBScore++;

        servingTeam =
            document.getElementById("teamBName").value ||
            "Team B";
    }


    updateScoreDisplay();

    checkSetWinner();
}


// ============================================
// SET WINNER
// ============================================

function checkSetWinner() {

    const isFinalSet = currentSet === 5;

    const pointsNeeded =
        isFinalSet ? 15 : 25;


    /*
        A set must be won by at least two points.
    */

    if (
        teamAScore >= pointsNeeded &&
        teamAScore - teamBScore >= 2
    ) {

        finishSet("A");

    } else if (
        teamBScore >= pointsNeeded &&
        teamBScore - teamAScore >= 2
    ) {

        finishSet("B");
    }
}


// ============================================
// FINISH SET
// ============================================

function finishSet(winner) {

    const winningScore =
        winner === "A" ? teamAScore : teamBScore;

    const losingScore =
        winner === "A" ? teamBScore : teamAScore;


    if (winner === "A") {
        setsWonA++;
    } else {
        setsWonB++;
    }


    updateScoreDisplay();


    // ----------------------------------------
    // Match winner
    // ----------------------------------------

    if (setsWonA >= 3 || setsWonB >= 3) {

        const teamAName =
            document.getElementById("teamAName").value ||
            "Team A";

        const teamBName =
            document.getElementById("teamBName").value ||
            "Team B";

        const winnerName =
            winner === "A" ? teamAName : teamBName;

        document.getElementById("setMessage").textContent =
            `${winnerName} won the match! Final set score: ${winningScore}-${losingScore}`;

        return;
    }


    // ----------------------------------------
    // Start next set
    // ----------------------------------------

    document.getElementById("setMessage").textContent =
        `Set ${currentSet} finished ${winningScore}-${losingScore}. Starting the next set...`;


    currentSet++;

    teamAScore = 0;
    teamBScore = 0;


    // In volleyball the deciding set is 15 points.
    // Set 5 automatically uses 15.
    updateScoreDisplay();
}


// ============================================
// SCORE DISPLAY
// ============================================

function updateScoreDisplay() {

    const teamAName =
        document.getElementById("teamAName").value ||
        "Team A";

    const teamBName =
        document.getElementById("teamBName").value ||
        "Team B";


    document.getElementById("scoreTeamA").textContent =
        teamAName;

    document.getElementById("scoreTeamB").textContent =
        teamBName;


    document.getElementById("teamAScore").textContent =
        teamAScore;

    document.getElementById("teamBScore").textContent =
        teamBScore;


    document.getElementById("servingTeam").textContent =
        servingTeam;


    document.getElementById("setsScore").textContent =
        `${setsWonA} - ${setsWonB}`;


    document.getElementById("currentSet").textContent =
        currentSet;
}


// ============================================
// RESET SET
// ============================================

function resetSet() {

    teamAScore = 0;
    teamBScore = 0;

    document.getElementById("setMessage").textContent = "";

    updateScoreDisplay();
}


// ============================================
// RESET MATCH
// ============================================

function resetMatch() {

    teamAScore = 0;
    teamBScore = 0;

    setsWonA = 0;
    setsWonB = 0;

    currentSet = 1;

    servingTeam = "Team A";

    document.getElementById("setMessage").textContent = "";

    updateScoreDisplay();
}


// ============================================
// UPDATE TEAM NAMES
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const teamAInput =
        document.getElementById("teamAName");

    const teamBInput =
        document.getElementById("teamBName");


    teamAInput.addEventListener(
        "input",
        updateScoreDisplay
    );

    teamBInput.addEventListener(
        "input",
        updateScoreDisplay
    );

});
