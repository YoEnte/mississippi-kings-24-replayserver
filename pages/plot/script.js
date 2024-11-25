var socket = io();

var matchList = {};
var selectedMatch = undefined;

var turnData = {};

function domOnload() {
    console.log('loaded DOM');
}

function requestMatchList() {
    socket.emit('requestMatchList', ({}));
}

function requestTurnList(matchID) {
    socket.emit('requestTurnList', ({matchID:matchID}));
}

function requestAllTurnLists() {
    Object.keys(matchList).forEach((matchID) => {
        requestTurnList(matchID);
    });
}

function refreshMatch() {
    if (selectedMatch == undefined) {
        console.log("no selected (match)");
        return;
    }

    requestTurnList(selectedMatch);
}

function selectMatch() {
    if (selectedMatch != undefined) {
        var lastSelected = document.querySelector(`#${matchIDtoDivID(selectedMatch)}`);
        lastSelected.style.backgroundColor = '';
    }
    selectedMatch = this.getAttribute('matchID');
    this.style.backgroundColor = '#bbbbbb';

    var timelineInput = document.querySelector('#timeline input');
    timelineInput.max = matchList[selectedMatch].length - 1;
    timelineInput.value = 0;
    adjustSteplist();
    timelineChange(timelineInput);
}

function matchIDtoDivID(matchID) {
    return "ID" + matchID.replaceAll('-', '').replaceAll(':', '');
}

function timelineChange(element, load = true) {
    var timelineValueDiv = document.querySelector('#timelineValue');
    timelineValueDiv.innerHTML = element.value;
    if (load) loadTurn();
}

function loadTurn() {
    if (selectedMatch == undefined) {
        console.log("no selected (turn)");
        return;
    }

    var timelineInput = document.querySelector('#timeline input');
    var filenameField = document.querySelector('#filename');
    //console.log(selectedMatch)
    //console.log(timelineInput.value);

    filenameField.innerHTML = matchList[selectedMatch][timelineInput.value];
    socket.emit('loadTurn', ({matchID:selectedMatch, turn:matchList[selectedMatch][timelineInput.value]}));
}

function matchesBottom() {
    var matchCon = document.querySelector('#matchCon');
    matchCon.scrollTop = matchCon.scrollHeight;
}

function adjustSteplist() {
    if (selectedMatch == undefined) {
        return;
    }


    var stepList = document.querySelector('#steplist');

    stepList.innerHTML = "";
    for (var s = 0; s < matchList[selectedMatch].length; s++) {
        var newOption = document.createElement('option');
        newOption.innerHTML = s;
        stepList.appendChild(newOption);
    }
}

function clearRange() {
    var timelineInput = document.querySelector('#timeline input');
    timelineInput.max = 0;
    timelineInput.value = 0;
    adjustSteplist();
    timelineChange(timelineInput, false);
}

socket.on('connect', () => {
    console.log('connected');
    requestMatchList();
});

socket.on('testback', (data) => {
    console.log(data);
});

socket.on('sendMatchList', (data) => {
    //console.log(data.matchList)

    matchList = {};
    var matchCon = document.querySelector('#matchCon');
    matchCon.innerHTML = '';

    data.matchList.forEach(matchID => {
        matchList[matchID] = [];

        var match = document.createElement('div');
        match.classList.add('match');
        match.id = matchIDtoDivID(matchID);
        match.setAttribute('matchID', matchID);
        match.innerHTML = matchID;
        match.onclick = selectMatch;
        matchCon.appendChild(match);
    });
    
    if (data.matchList.includes(selectedMatch)) {
        var selectedMatchDiv = document.querySelector(`#${matchIDtoDivID(selectedMatch)}`);
        selectedMatchDiv.style.backgroundColor = '#bbbbbb';
    } else {
        selectedMatch = undefined;
        clearRange();
    }

    matchesBottom();
    requestAllTurnLists();
});

socket.on('sendTurnList', (data) => {
    //console.log(data);
    if (data.error == true) {
        if (data.code == -1) {
            console.log(`match ${data.matchID} not found`);
            requestMatchList();
        } else if (data.code == -2) {
            console.log('matchID was not String');
        }

        return;
    }

    matchList[data.matchID] = [...data.turnList];
    var matchDiv = document.querySelector(`#${matchIDtoDivID(data.matchID)}`);
    matchDiv.innerHTML = `${data.matchID} (${data.turnList.length})`;

    if (selectedMatch != undefined) {
        var timelineInput = document.querySelector('#timeline input');
        var timelineValueDiv = document.querySelector('#timelineValue');
        timelineInput.max = matchList[selectedMatch].length - 1;
        timelineInput.value = timelineValueDiv.innerHTML;
        adjustSteplist();
    }

    if (selectedMatch != undefined && data.matchID == Object.keys(matchList)[Object.keys(matchList).length - 1]) {    // if last in match list
        loadTurn();
    }
});

socket.on('sendTurn', (data) => {
    //console.log(JSON.parse(data.turn));
    turnData = JSON.parse(data.turn);
    runPlot();
});

socket.on('error', (data) => {
    console.log(data.msg);
});

socket.on('disconnect', () => {
    console.log('disconnected');
});