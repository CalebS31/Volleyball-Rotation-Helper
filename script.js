/* =========================================
   VOLLEYBALL ROTATION TOOL
   VERSION 1.1
   ========================================= */


/* =========================================
   SYSTEM POSITIONS
   ========================================= */

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


let positions = [];

let system = 0;


/* =========================================
   PLAYER DATA
   ========================================= */

let players = [
    "",
    "",
    "",
    "",
    "",
    ""
];


let jerseyNums = [
    "",
    "",
    "",
    "",
    "",
    ""
];


let libero = {
    name: "",
    jersey: ""
};


/* =========================================
   LIBERO
   ========================================= */

let usingLibero = false;


/*
    The libero is NOT stored as a seventh
    rotational player.

    Instead, we remember which middle blocker
    the libero is temporarily replacing.
*/

let liberoState = {
    active: false,
    replacedMiddle: null
};


/* =========================================
   ROTATION
   ========================================= */

let courtPos = [];

let rotationNumber = 1;


/* =========================================
   SCORE
   ========================================= */

let teamAScore = 0;

let teamBScore = 0;

let setsWonA = 0;

let setsWonB = 0;

let currentSet = 1;

let servingTeam = "A";


/* =========================================
   NAVIGATION
   ========================================= */

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });
}


function goHome() {

    hideAllScreens();

    document
        .getElementById("homeScreen")
        .classList.remove("hidden");
}


/* =========================================
   ROTATION SETUP
   ========================================= */

function openRotationSetup() {

    hideAllScreens();

    document
        .getElementById("systemScreen")
        .classList.remove("hidden");

    document
        .getElementById("systemScreen")
        .dataset.mode = "rotation";
}


function openPlayerSetup() {

    hideAllScreens();

    document
        .getElementById("systemScreen")
        .classList.remove("hidden");

    document
        .getElementById("systemScreen")
        .dataset.mode = "players";
}


function chooseSystem(selectedSystem) {

    system = selectedSystem;

    if (system === 5) {

        positions = [...positions51];

    } else {

        positions = [...positions62];

    }


    const mode =
        document
            .getElementById("systemScreen")
            .dataset.mode;


    if (mode === "rotation") {

        hideAllScreens();

        document
            .getElementById("rotationSetupScreen")
            .classList.remove("hidden");


        document
            .getElementById("selectedSystemText")
            .textContent =
                `Selected system: ${system === 5 ? "5–1" : "6–2"}`;

    } else {

        openPlayerInputs();

    }
}


/* =========================================
   LIBERO SELECTION
   ========================================= */

function setLiberoUsage(value) {

    usingLibero = value;

    const yesButton =
        document.getElementById(
            "liberoYesButton"
        );

    const noButton =
        document.getElementById(
            "liberoNoButton"
        );


    if (value) {

        yesButton.style.opacity = "1";

        noButton.style.opacity = "0.5";

    } else {

        yesButton.style.opacity = "0.5";

        noButton.style.opacity = "1";

    }
}


/* =========================================
   PLAYER INPUT
   ========================================= */

function openPlayerInputs() {

    hideAllScreens();

    document
        .getElementById("playerSetupScreen")
        .classList.remove("hidden");


    document
        .getElementById("playerSystemText")
        .textContent =
            `Player setup for the ${system === 5 ? "5–1" : "6–2"} system.`;


    const container =
        document.getElementById(
            "playerInputs"
        );


    container.innerHTML = "";


    for (let i = 0; i < 6; i++) {

        const row =
            document.createElement("div");

        row.className = "player-row";


        row.innerHTML = `

            <input
                id="player-${i}"
                type="text"
                placeholder="${positions[i]}"
                value="${players[i]}"
            >

            <input
                id="jersey-${i}"
                type="number"
                placeholder="#"
                value="${jerseyNums[i]}"
            >

        `;


        container.appendChild(row);
    }


    const liberoContainer =
        document.getElementById(
            "liberoInputContainer"
        );


    liberoContainer.innerHTML = `

        <label>
            Libero
        </label>

        <div class="player-row">

            <input
                id="libero-name"
                type="text"
                placeholder="Libero"
                value="${libero.name}"
            >

            <input
                id="libero-jersey"
                type="number"
                placeholder="#"
                value="${libero.jersey}"
            >

        </div>

    `;
}


function savePlayers() {

    for (let i = 0; i < 6; i++) {

        players[i] =
            document
                .getElementById(
                    `player-${i}`
                )
                .value
                .trim();


        jerseyNums[i] =
            document
                .getElementById(
                    `jersey-${i}`
                )
                .value
                .trim();
    }


    libero.name =
        document
            .getElementById("libero-name")
            .value
            .trim();


    libero.jersey =
        document
            .getElementById("libero-jersey")
            .value
            .trim();


    localStorage.setItem(
        "volleyballPlayers",
        JSON.stringify(players)
    );


    localStorage.setItem(
        "volleyballJerseys",
        JSON.stringify(jerseyNums)
    );


    localStorage.setItem(
        "volleyballLibero",
        JSON.stringify(libero)
    );


    alert("Players saved!");

    goHome();
}


/* =========================================
   LOAD SAVED PLAYERS
   ========================================= */

function loadSavedPlayers() {

    const savedPlayers =
        localStorage.getItem(
            "volleyballPlayers"
        );


    const savedJerseys =
        localStorage.getItem(
            "volleyballJerseys"
        );


    const savedLibero =
        localStorage.getItem(
            "volleyballLibero"
        );


    if (savedPlayers) {

        players =
            JSON.parse(savedPlayers);

    }


    if (savedJerseys) {

        jerseyNums =
            JSON.parse(savedJerseys);

    }


    if (savedLibero) {

        libero =
            JSON.parse(savedLibero);

    }
}


/* =========================================
   ROTATION START
   ========================================= */

function startRotation() {

    const setterPosition =
        parseInt(
            document
                .getElementById(
                    "setterPosition"
                )
                .value
        );


    /*
        0-based rotation.

        If setter starts at position 1:

        Position 1 -> index 0
        Position 6 -> index 5
        Position 5 -> index 4
        etc.
    */

    courtPos = [];


    for (let x = 0; x < 6; x++) {

        const index =
            (
                setterPosition -
                1 -
                x +
                600
            ) % 6;


        courtPos.push(index);
    }


    rotationNumber = 1;


    liberoState.active = false;

    liberoState.replacedMiddle = null;


    if (usingLibero) {

        updateLibero();

    }


    hideAllScreens();


    document
        .getElementById(
            "rotationScreen"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "rotationSystemTitle"
        )
        .textContent =
            `${system === 5 ? "5–1" : "6–2"} Rotation`;


    displayCourt();
}


/* =========================================
   LIBERO LOGIC
   ========================================= */

function updateLibero() {

    if (!usingLibero) {

        liberoState.active = false;

        liberoState.replacedMiddle = null;

        return;
    }


    /*
        Court array indexes:

        0 = Position 1
        1 = Position 2
        2 = Position 3
        3 = Position 4
        4 = Position 5
        5 = Position 6


        Back row:

        Position 1
        Position 5
        Position 6

        Therefore:

        0, 4, 5
    */

    const backRow = [0, 4, 5];


    /*
        If the libero is already replacing
        a middle, check whether that middle
        has moved to the front row.
    */

    if (
        liberoState.active &&
        liberoState.replacedMiddle !== null
    ) {

        const middlePosition =
            courtPos.indexOf(
                liberoState.replacedMiddle
            );


        if (
            middlePosition !== -1 &&
            !backRow.includes(
                middlePosition
            )
        ) {

            /*
                The middle is now in the
                front row.

                The libero comes off.
            */

            liberoState.active = false;

            liberoState.replacedMiddle = null;
        }
    }


    /*
        If the libero isn't currently on,
        look for a middle in the back row.
    */

    if (!liberoState.active) {

        for (
            let i = 0;
            i < courtPos.length;
            i++
        ) {

            const playerIndex =
                courtPos[i];


            const role =
                positions[playerIndex];


            const isMiddle =
                role === "Middle 1" ||
                role === "Middle 2";


            if (
                backRow.includes(i) &&
                isMiddle
            ) {

                liberoState.active = true;

                liberoState.replacedMiddle =
                    playerIndex;

                break;
            }
        }
    }
}


/* =========================================
   ROTATE FORWARD
   ========================================= */

function nextRotation() {

    if (courtPos.length !== 6) {
        return;
    }


    const first =
        courtPos.shift();


    courtPos.push(first);


    rotationNumber++;


    updateLibero();


    displayCourt();
}


/* =========================================
   ROTATE BACKWARD
   ========================================= */

function previousRotation() {

    if (courtPos.length !== 6) {
        return;
    }


    const last =
        courtPos.pop();


    courtPos.unshift(last);


    rotationNumber--;


    if (rotationNumber < 1) {
        rotationNumber = 6;
    }


    updateLibero();


    displayCourt();
}


/* =========================================
   DISPLAY COURT
   ========================================= */

function displayCourt() {

    const courtElements = {

        1: document.getElementById(
            "courtPos1"
        ),

        2: document.getElementById(
            "courtPos2"
        ),

        3: document.getElementById(
            "courtPos3"
        ),

        4: document.getElementById(
            "courtPos4"
        ),

        5: document.getElementById(
            "courtPos5"
        ),

        6: document.getElementById(
            "courtPos6"
        )
    };


    for (
        let position = 1;
        position <= 6;
        position++
    ) {

        const element =
            courtElements[position];


        const arrayIndex =
            position - 1;


        const playerIndex =
            courtPos[arrayIndex];


        let displayName =
            players[playerIndex];


        let displayNumber =
            jerseyNums[playerIndex];


        let displayRole =
            getShortRole(
                positions[playerIndex]
            );


        let isLibero = false;


        /*
            If this player is the middle
            being replaced, display the
            libero instead.
        */

        if (
            usingLibero &&
            liberoState.active &&
            playerIndex ===
                liberoState.replacedMiddle
        ) {

            displayName =
                libero.name ||
                "Libero";


            displayNumber =
                libero.jersey ||
                "";


            displayRole = "LIB";

            isLibero = true;
        }


        /*
            If no name/number has been
            entered, use the role.
        */

        if (
            !displayName &&
            !displayNumber
        ) {

            displayName =
                displayRole;
        }


        element.innerHTML = `

            <div class="player-number">

                ${
                    displayNumber
                        ? "#" + escapeHtml(
                            displayNumber
                        )
                        : displayName
                }

            </div>

            ${
                displayNumber
                    ? `
                        <div class="player-name">
                            ${escapeHtml(
                                displayName ||
                                displayRole
                            )}
                        </div>
                    `
                    : ""
            }

            <div class="player-role">
                ${displayRole}
            </div>

        `;


        element.classList.toggle(
            "libero-player",
            isLibero
        );
    }


    document
        .getElementById(
            "rotationCounter"
        )
        .textContent =
            `Rotation ${rotationNumber}`;


    /*
        6–2 special display.

        The rotation itself is still based
        on the player's actual rotational
        position. This means the setter can
        naturally appear in the back row
        rather than being forced into the
        front row.
    */
}


/* =========================================
   ROLE ABBREVIATIONS
   ========================================= */

function getShortRole(role) {

    if (!role) {
        return "";
    }


    if (
        role === "Setter" ||
        role === "Setter 1" ||
        role === "Setter 2"
    ) {

        return "S";
    }


    if (
        role === "Middle 1" ||
        role === "Middle 2"
    ) {

        return "MB";
    }


    if (
        role === "Left Side 1" ||
        role === "Left Side 2"
    ) {

        return "LS";
    }


    if (role === "Right Side") {

        return "RS";
    }


    if (role === "Libero") {

        return "LIB";
    }


    return role;
}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================
   SERVE RECEIVE
   ========================================= */

function toggleServeReceive() {

    const court =
        document.querySelector(
            ".volleyball-court"
        );


    court.classList.toggle(
        "serve-receive"
    );


    const info =
        document.getElementById(
            "animationInfo"
        );


    const text =
        document.getElementById(
            "animationText"
        );


    if (
        court.classList.contains(
            "serve-receive"
        )
    ) {

        text.textContent =
            "Serve receive positions shown.";

        info.classList.remove(
            "hidden"
        );

    } else {

        info.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   MOVEMENT
   ========================================= */

function toggleMovement() {

    const court =
        document.querySelector(
            ".volleyball-court"
        );


    court.classList.toggle(
        "movement-active"
    );


    const info =
        document.getElementById(
            "animationInfo"
        );


    const text =
        document.getElementById(
            "animationText"
        );


    if (
        court.classList.contains(
            "movement-active"
        )
    ) {

        text.textContent =
            "Player movement after the serve is being shown.";

        info.classList.remove(
            "hidden"
        );

    } else {

        info.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   SCOREKEEPER
   ========================================= */

function openScorekeeper() {

    hideAllScreens();

    document
        .getElementById(
            "scoreScreen"
        )
        .classList.remove(
            "hidden"
        );


    updateScoreDisplay();
}


/* =========================================
   ADD POINT
   ========================================= */

function addPoint(team) {

    /*
        Don't allow points after the
        match has finished.
    */

    if (
        setsWonA >= 3 ||
        setsWonB >= 3
    ) {

        return;
    }


    if (team === "A") {

        teamAScore++;

        servingTeam = "A";

    } else {

        teamBScore++;

        servingTeam = "B";
    }


    updateScoreDisplay();

    checkSetWinner();
}


/* =========================================
   REMOVE POINT
   ========================================= */

function removePoint(team) {

    if (team === "A") {

        if (teamAScore > 0) {

            teamAScore--;
        }

    } else {

        if (teamBScore > 0) {

            teamBScore--;
        }
    }


    updateScoreDisplay();
}


/* =========================================
   CHECK SET WINNER
   ========================================= */

function checkSetWinner() {

    /*
        Sets 1–4:

        First to 25
        Win by 2

        Set 5:

        First to 15
        Win by 2
    */

    const pointsNeeded =
        currentSet === 5
            ? 15
            : 25;


    if (
        teamAScore >= pointsNeeded &&
        teamAScore - teamBScore >= 2
    ) {

        finishSet("A");

        return;
    }


    if (
        teamBScore >= pointsNeeded &&
        teamBScore - teamAScore >= 2
    ) {

        finishSet("B");
    }
}


/* =========================================
   FINISH SET
   ========================================= */

function finishSet(winner) {

    if (winner === "A") {

        setsWonA++;

    } else {

        setsWonB++;
    }


    const teamAName =
        document
            .getElementById(
                "teamAName"
            )
            .value ||
        "Team A";


    const teamBName =
        document
            .getElementById(
                "teamBName"
            )
            .value ||
        "Team B";


    const winnerName =
        winner === "A"
            ? teamAName
            : teamBName;


    /*
        MATCH WON
    */

    if (
        setsWonA >= 3 ||
        setsWonB >= 3
    ) {

        document
            .getElementById(
                "setMessage"
            )
            .textContent =
                `${winnerName} won the match!`;

        updateScoreDisplay();

        return;
    }


    /*
        NEXT SET
    */

    document
        .getElementById(
            "setMessage"
        )
        .textContent =
            `${winnerName} won the set. Next set starting.`;


    currentSet++;


    teamAScore = 0;

    teamBScore = 0;


    updateScoreDisplay();
}


/* =========================================
   SCORE DISPLAY
   ========================================= */

function updateScoreDisplay() {

    const teamAName =
        document
            .getElementById(
                "teamAName"
            )
            .value ||
        "Team A";


    const teamBName =
        document
            .getElementById(
                "teamBName"
            )
            .value ||
        "Team B";


    document
        .getElementById(
            "teamAScore"
        )
        .textContent =
            teamAScore;


    document
        .getElementById(
            "teamBScore"
        )
        .textContent =
            teamBScore;


    document
        .getElementById(
            "currentSet"
        )
        .textContent =
            currentSet;


    document
        .getElementById(
            "setsScore"
        )
        .textContent =
            `${setsWonA} - ${setsWonB}`;


    document
        .getElementById(
            "servingTeam"
        )
        .textContent =
            servingTeam === "A"
                ? teamAName
                : teamBName;
}


/* =========================================
   RESET SET
   ========================================= */

function resetSet() {

    teamAScore = 0;

    teamBScore = 0;


    document
        .getElementById(
            "setMessage"
        )
        .textContent = "";


    updateScoreDisplay();
}


/* =========================================
   RESET MATCH
   ========================================= */

function resetMatch() {

    teamAScore = 0;

    teamBScore = 0;

    setsWonA = 0;

    setsWonB = 0;

    currentSet = 1;

    servingTeam = "A";


    document
        .getElementById(
            "setMessage"
        )
        .textContent = "";


    updateScoreDisplay();
}


/* =========================================
   TEAM NAME UPDATES
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSavedPlayers();


        document
            .getElementById(
                "teamAName"
            )
            .addEventListener(
                "input",
                updateScoreDisplay
            );


        document
            .getElementById(
                "teamBName"
            )
            .addEventListener(
                "input",
                updateScoreDisplay
            );

    }
);
