/* =========================================
   VOLLEYBALL ROTATION TOOL
   VERSION 2.0
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
                `Selected system: ${
                    system === 5
                        ? "5–1"
                        : "6–2"
                }`;

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
        .getElementById(
            "playerSetupScreen"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "playerSystemText"
        )
        .textContent =
            `Player setup for the ${
                system === 5
                    ? "5–1"
                    : "6–2"
            } system.`;


    const container =
        document.getElementById(
            "playerInputs"
        );


    container.innerHTML = "";


    for (let i = 0; i < 6; i++) {

        const row =
            document.createElement("div");


        row.className =
            "player-row";


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
            .getElementById(
                "libero-name"
            )
            .value
            .trim();


    libero.jersey =
        document
            .getElementById(
                "libero-jersey"
            )
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
   START ROTATION
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


    courtPos = [];


    serveReceiveActive = false;

    movementActive = false;

    removeMovementGhosts();


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


    /*
        The rotation number is the setter's CURRENT
        court position, not a counter that increases
        every time the Rotate button is pressed.
    */
    rotationNumber =
        getCurrentRotationNumber();


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
            `${
                system === 5
                    ? "5–1"
                    : "6–2"
            } Rotation`;


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
        Back row:

        Position 1
        Position 5
        Position 6

        Array indexes:

        0, 4, 5
    */

    const backRow = [0, 4, 5];


    /*
        Check whether the middle currently
        being replaced has reached the
        front row.
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

            liberoState.active = false;

            liberoState.replacedMiddle = null;
        }
    }


    /*
        Look for a middle blocker in the
        back row.
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
   CURRENT ROTATION NUMBER
   ========================================= */

/*
    The number shown in the corner represents
    the setter's CURRENT court position.

    5–1:
        There is one setter, so the number is
        wherever that setter currently is.

    6–2:
        There are two setters. The rotation number
        follows whichever setter is currently in
        the back row (positions 5, 6, or 1).
*/
function getCurrentRotationNumber() {

    if (courtPos.length !== 6) {
        return 1;
    }


    const backRow =
        [0, 4, 5];


    if (system === 6) {

        /*
            In a 6–2, only the setter in the
            back row is the active setter.
        */
        for (const positionIndex of backRow) {

            const playerIndex =
                courtPos[positionIndex];


            const role =
                positions[playerIndex];


            if (
                role === "Setter 1" ||
                role === "Setter 2"
            ) {

                return positionIndex + 1;
            }
        }

    } else {

        /*
            In a 5–1 there is only one setter.
        */
        for (
            let positionIndex = 0;
            positionIndex < courtPos.length;
            positionIndex++
        ) {

            const playerIndex =
                courtPos[positionIndex];


            if (
                positions[playerIndex] ===
                "Setter"
            ) {

                return positionIndex + 1;
            }
        }
    }


    /*
        Fallback if the setup does not currently
        contain the expected setter.
    */
    return rotationNumber || 1;
}


/* =========================================
   ROTATION FORWARD
   ========================================= */

function nextRotation() {

    if (courtPos.length !== 6) {
        return;
    }


    const first =
        courtPos.shift();


    courtPos.push(first);


    /*
        Recalculate from the setter's actual
        position after the rotation.
    */
    rotationNumber =
        getCurrentRotationNumber();


    updateLibero();

    if (serveReceiveActive) {

        movementActive = false;

        document
            .querySelector(
                ".volleyball-court"
            )
            .classList.remove(
                "movement-active"
            );

        removeMovementGhosts();
    }

    displayCourt();
}


/* =========================================
   ROTATION BACKWARD
   ========================================= */

function previousRotation() {

    if (courtPos.length !== 6) {
        return;
    }


    const last =
        courtPos.pop();


    courtPos.unshift(last);


    /*
        Recalculate from the setter's actual
        position after the reverse rotation.
    */
    rotationNumber =
        getCurrentRotationNumber();


    updateLibero();

    if (serveReceiveActive) {

        movementActive = false;

        document
            .querySelector(
                ".volleyball-court"
            )
            .classList.remove(
                "movement-active"
            );

        removeMovementGhosts();
    }

    displayCourt();
}


/* =========================================
   DISPLAY COURT
   ========================================= */

function displayCourt() {

    rotationNumber =
        getCurrentRotationNumber();


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
            Display the libero in the
            middle's court position.
        */

        if (
            usingLibero &&
            liberoState.active &&
            playerIndex ===
                liberoState.replacedMiddle
        ) {

            displayName =
                libero.name ||
                "LIB";


            displayNumber =
                libero.jersey ||
                "";


            displayRole = "LIB";

            isLibero = true;
        }


        /*
            If no name or number has been
            entered, use the position
            abbreviation.
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
                        ? "#" +
                          escapeHtml(
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


        element.dataset.playerIndex =
            playerIndex;


        element.onmouseenter = () => {

            showMovementGhost(
                element
            );
        };


        element.onmouseleave = () => {

            hideMovementGhost(
                element
            );
        };
    }


    applyCurrentFormation();


    document
        .getElementById(
            "rotationCounter"
        )
        .textContent =
            `Rotation ${rotationNumber}`;
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
   SERVE RECEIVE FORMATIONS
   ========================================= */

/*
    The first reference image shows the six
    serve-receive formations in this order:

        1, 6, 5, 4, 3, 2

    Coordinates are the CENTER of each player
    circle as percentages of the court.
*/
const serveReceiveLayouts = {

    1: {
        "Right Side":   [12, 27],
        "Middle 2":     [50, 27],
        "Left Side 1":  [86, 27],
        "Left Side 2":  [20, 66],
        "Middle 1":     [50, 66],
        "Setter":       [84, 66]
    },

    6: {
        "Left Side 2":  [18, 65],
        "Middle 1":     [50, 67],
        "Left Side 1":  [80, 67],
        "Right Side":   [76, 23],
        "Setter":       [82, 34],
        "Middle 2":     [84, 49]
    },

    5: {
        "Middle 1":     [18, 28],
        "Setter":       [50, 28],
        "Right Side":   [82, 28],
        "Left Side 2":  [18, 67],
        "Left Side 1":  [50, 67],
        "Middle 2":     [82, 67]
    },

    4: {
        "Setter":       [18, 27],
        "Middle 1":     [24, 40],
        "Left Side 2":  [18, 67],
        "Left Side 1":  [50, 70],
        "Middle 2":     [78, 67],
        "Right Side":   [84, 82]
    },

    3: {
        "Middle 1":     [18, 28],
        "Setter":       [50, 28],
        "Right Side":   [82, 28],
        "Left Side 2":  [18, 67],
        "Left Side 1":  [50, 70],
        "Middle 2":     [82, 67]
    },

    2: {
        "Middle 2":     [18, 28],
        "Setter":       [78, 28],
        "Middle 1":     [78, 67],
        "Left Side 1":  [18, 67],
        "Left Side 2":  [50, 70],
        "Right Side":   [40, 84]
    }
};


/*
    Fixed ending/base positions from the second
    reference image.

    4 = left front
    3 = middle front
    2 = right front
    5 = left back
    6 = middle back
    1 = right back
*/
const baseCourtCoordinates = {
    1: [80, 65],
    2: [80, 20],
    3: [50, 20],
    4: [20, 20],
    5: [20, 65],
    6: [50, 75]
};


let serveReceiveActive = false;
let movementActive = false;


/* =========================================
   ACTIVE 6–2 SETTER
   ========================================= */

function getActiveSetterIndex() {

    if (system === 5) {

        for (let i = 0; i < courtPos.length; i++) {

            const playerIndex = courtPos[i];

            if (
                positions[playerIndex] ===
                "Setter"
            ) {
                return playerIndex;
            }
        }

        return -1;
    }


    /*
        In a 6–2 the active setter is whichever
        Setter 1 / Setter 2 is currently in the
        back row: positions 1, 5, or 6.
    */
    const backRow = [0, 4, 5];

    for (const positionIndex of backRow) {

        const playerIndex =
            courtPos[positionIndex];

        const role =
            positions[playerIndex];

        if (
            role === "Setter 1" ||
            role === "Setter 2"
        ) {
            return playerIndex;
        }
    }

    return -1;
}


/* =========================================
   SERVE RECEIVE ROLE
   ========================================= */

function getServeReceiveRole(playerIndex) {

    const role =
        positions[playerIndex];


    if (system === 5) {
        return role;
    }


    /*
        In a 6–2, the back-row setter uses
        the Setter serve-receive position.

        The other setter is the front-row
        setter and uses the Right Side position.
    */
    if (
        role === "Setter 1" ||
        role === "Setter 2"
    ) {

        const activeSetter =
            getActiveSetterIndex();

        if (
            playerIndex === activeSetter
        ) {
            return "Setter";
        }

        return "Right Side";
    }

    return role;
}


/* =========================================
   POSITION HELPERS
   ========================================= */

function setPlayerCenterPercent(
    element,
    xPercent,
    yPercent
) {

    const half =
        element.offsetWidth / 2;

    element.style.right = "auto";

    element.style.left =
        `calc(${xPercent}% - ${half}px)`;

    element.style.top =
        `calc(${yPercent}% - ${half}px)`;
}


function setPlayerToBase(
    element,
    courtPosition
) {

    const coordinates =
        baseCourtCoordinates[courtPosition];

    if (!coordinates) {
        return;
    }

    setPlayerCenterPercent(
        element,
        coordinates[0],
        coordinates[1]
    );
}


function getServeReceiveCoordinates(
    playerIndex
) {

    const rotation =
        getCurrentRotationNumber();

    const layout =
        serveReceiveLayouts[rotation];

    if (!layout) {
        return null;
    }

    const role =
        getServeReceiveRole(playerIndex);

    return layout[role] || null;
}


function setPlayerToServeReceive(
    element,
    playerIndex
) {

    const coordinates =
        getServeReceiveCoordinates(playerIndex);

    if (!coordinates) {
        return;
    }

    setPlayerCenterPercent(
        element,
        coordinates[0],
        coordinates[1]
    );
}


/* =========================================
   GHOST CLEANUP
   ========================================= */

function removeMovementGhosts() {

    document
        .querySelectorAll(".movement-ghost")
        .forEach(ghost => {
            ghost.remove();
        });
}


function hideMovementGhost(element) {

    if (element._movementAnimation) {

        element._movementAnimation.cancel();

        element._movementAnimation = null;
    }

    if (element._movementGhost) {

        element._movementGhost.remove();

        element._movementGhost = null;
    }
}


/* =========================================
   HOVER MOVEMENT GHOST
   ========================================= */

function showMovementGhost(element) {

    if (
        !serveReceiveActive ||
        movementActive
    ) {
        return;
    }


    removeMovementGhosts();


    const playerIndex =
        parseInt(
            element.dataset.playerIndex
        );


    if (Number.isNaN(playerIndex)) {
        return;
    }


    const court =
        document.querySelector(
            ".volleyball-court"
        );


    const startCoordinates =
        getServeReceiveCoordinates(
            playerIndex
        );


    const position =
        courtPos.indexOf(playerIndex) + 1;


    const endCoordinates =
        baseCourtCoordinates[position];


    if (
        !startCoordinates ||
        !endCoordinates
    ) {
        return;
    }


    const ghost =
        element.cloneNode(true);


    ghost.classList.add(
        "movement-ghost"
    );


    ghost.removeAttribute("id");


    ghost.style.width =
        `${element.offsetWidth}px`;

    ghost.style.height =
        `${element.offsetHeight}px`;


    /*
        Use the actual player's current pixel
        position as the beginning of the ghost.
    */
    const startX =
        element.offsetLeft +
        element.offsetWidth / 2;

    const startY =
        element.offsetTop +
        element.offsetHeight / 2;


    const endX =
        court.clientWidth *
        endCoordinates[0] /
        100;

    const endY =
        court.clientHeight *
        endCoordinates[1] /
        100;


    const dx =
        endX - startX;

    const dy =
        endY - startY;

    const distance =
        Math.max(
            1,
            Math.hypot(dx, dy)
        );


    /*
        A small bend makes the ghost visibly
        follow a movement path rather than simply
        jumping/sliding directly to the endpoint.
    */
    const bend =
        Math.min(
            55,
            Math.max(
                20,
                distance * 0.18
            )
        );


    const direction =
        playerIndex % 2 === 0
            ? 1
            : -1;


    const midpointX =
        (startX + endX) / 2 +
        (-dy / distance) *
        bend *
        direction;

    const midpointY =
        (startY + endY) / 2 +
        (dx / distance) *
        bend *
        direction;


    const half =
        ghost.offsetWidth / 2;


    ghost.style.left =
        `${startX - half}px`;

    ghost.style.top =
        `${startY - half}px`;


    court.appendChild(ghost);


    const animation =
        ghost.animate(
            [
                {
                    left:
                        `${startX - half}px`,
                    top:
                        `${startY - half}px`,
                    opacity: 0.18
                },
                {
                    left:
                        `${midpointX - half}px`,
                    top:
                        `${midpointY - half}px`,
                    opacity: 0.34
                },
                {
                    left:
                        `${endX - half}px`,
                    top:
                        `${endY - half}px`,
                    opacity: 0.32
                }
            ],
            {
                duration: 1200,
                easing: "ease-in-out",
                fill: "forwards"
            }
        );


    element._movementGhost = ghost;
    element._movementAnimation = animation;
}


/* =========================================
   APPLY CURRENT FORMATION
   ========================================= */

function applyCurrentFormation() {

    for (
        let position = 1;
        position <= 6;
        position++
    ) {

        const element =
            document.getElementById(
                `courtPos${position}`
            );

        if (!element) {
            continue;
        }

        const playerIndex =
            courtPos[position - 1];

        if (
            serveReceiveActive &&
            !movementActive
        ) {

            setPlayerToServeReceive(
                element,
                playerIndex
            );

        } else {

            setPlayerToBase(
                element,
                position
            );
        }
    }
}


/* =========================================
   SERVE RECEIVE
   ========================================= */

function toggleServeReceive() {

    const court =
        document.querySelector(
            ".volleyball-court"
        );


    removeMovementGhosts();

    movementActive = false;

    court.classList.remove(
        "movement-active"
    );


    serveReceiveActive =
        !serveReceiveActive;


    if (serveReceiveActive) {

        applyCurrentFormation();


        document
            .getElementById(
                "animationText"
            )
            .textContent =
                "Serve receive starting positions shown. Hover over a player to preview their movement.";

        document
            .getElementById(
                "animationInfo"
            )
            .classList.remove(
                "hidden"
            );

    } else {

        applyCurrentFormation();


        document
            .getElementById(
                "animationInfo"
            )
            .classList.add(
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


    removeMovementGhosts();


    /*
        If Show Movement is pressed before
        Serve Receive, use the correct starting
        formation first.
    */
    if (
        !serveReceiveActive &&
        !movementActive
    ) {

        serveReceiveActive = true;

        applyCurrentFormation();
    }


    movementActive =
        !movementActive;


    court.classList.toggle(
        "movement-active",
        movementActive
    );


    if (movementActive) {

        /*
            All six players are sent to their
            ending positions in the same frame,
            so they begin together.
        */
        requestAnimationFrame(
            () => {
                applyCurrentFormation();
            }
        );


        document
            .getElementById(
                "animationText"
            )
            .textContent =
                "All players are moving to their base positions.";

        document
            .getElementById(
                "animationInfo"
            )
            .classList.remove(
                "hidden"
            );

    } else {

        applyCurrentFormation();


        document
            .getElementById(
                "animationText"
            )
            .textContent =
                "Serve receive starting positions shown. Hover over a player to preview their movement.";

        document
            .getElementById(
                "animationInfo"
            )
            .classList.remove(
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


    /*
        =====================================
        IMPORTANT VERSION 1.8 CHANGE
        =====================================

        The large red/blue buttons now show
        the CURRENT SCORE.

        So if Team A has 14 points:

                    [ 14 ]

        Clicking it makes it:

                    [ 15 ]
    */

    document
        .getElementById(
            "teamAScoreButton"
        )
        .textContent =
            teamAScore;


    document
        .getElementById(
            "teamBScoreButton"
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
