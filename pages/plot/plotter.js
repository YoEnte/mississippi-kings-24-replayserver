const directions = ['Right', 'DownRight', 'DownLeft', 'Left', 'UpLeft', 'UpRight'];

var traceVisbilities = [
    true,
    true,
    true,
    true,
    'legendonly',
    'legendonly',
    'legendonly',
];

function runPlot() {
    var plotdiv = document.querySelector('#plot');

    var fields = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Fields',
        marker: { color: [], opacity: [], size: 70, line: { color: [], width: 3 }, symbol: 'hexagon' },
        text: [],
        customdata: [],
        hovertemplate:
            '%{customdata[0]}, %{customdata[1]}, %{customdata[2]} <br>' + 
            '%{customdata[3]} %{customdata[4]} %{customdata[5]} <br>' + 
            '%{customdata[6]} %{customdata[7]} <br>' + 
            '%{customdata[8]}<br>' + 
            '<extra></extra>',
        visible: traceVisbilities[0],

        // TODO CALC -> nvm: on socha client
    };

    for (d of turnData.data) {
        var c = d[0].split(';');
        var q = parseInt(c[0], 10);
        var r = parseInt(c[1], 10);
        var s = parseInt(c[2], 10);

        fields.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        fields.y.push(r);
        fields.customdata.push([q,r,s]);

        var f = d[1];
        var color = '#c0ffee';
        var opacity = 1;
        if (f.segment % 2 == 0) {
            opacity = 0.9;
        } else {
            opacity = 0.7;
        }
        switch (f.fieldType) {
            case 'Water':
                if (f.hasStream) {color = `rgba(0, 147, 175, ${opacity})`; break}
                color = `rgba(25, 25, 112, ${opacity})`;
                break;
            case 'Island':
                color = `rgba(218, 145, 0, ${opacity})`;
                break;
            case 'Passenger':
                color = `rgba(164, 0, 0, ${opacity})`;
                break;
            case 'Goal':
                color = `rgba(0, 102, 34, ${opacity})`;
                break;
        }
        fields.marker.color.push(color);

        if (f.dock == false) {
            fields.marker.line.color.push('#000');
        } else {
            fields.marker.line.color.push('#ff0000');
        }
    }
    
    var diffX = Math.max(...fields.x) - Math.min(...fields.x);
    var diffY = Math.max(...fields.y) - Math.min(...fields.y);
    var fieldSize = (1 / Math.max(diffX, diffY)) * 1000;
    fields.marker.size = fieldSize;

    var ships = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Ships',
        marker: { color: ['#ff0000', '0000ff'], size: 20, line: { color: '#000', width: 3 } },
        text: [],
        hovertemplate: '%{text}<extra></extra>',
        visible: traceVisbilities[1],
    };
    
    var shipArrows = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Ship Directions',
        marker: { color: '#000', size: 10, symbol: 'triangle-up', angle: [] },
        text: [],
        hovertemplate: '<extra></extra>',
        visible: traceVisbilities[2],
    }; 

    if (turnData.player == 'One') {
        var c = turnData.currentShip.coords.split(';');
        var q = c[0];
        var r = c[1];
        var s = c[2];

        ships.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        ships.y.push(r);
        ships.text.push(`current: One, ${turnData.currentShip.passengers}`);

        shipArrows.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        shipArrows.y.push(r);
        shipArrows.marker.angle.push((directions.indexOf(turnData.currentShip.direction) + 1) * 60 + 30);

        var c = turnData.otherShip.coords.split(';');
        var q = c[0];
        var r = c[1];
        var s = c[2];

        ships.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        ships.y.push(r);
        ships.text.push(`other: Two, ${turnData.otherShip.passengers}`);

        shipArrows.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        shipArrows.y.push(r);
        shipArrows.marker.angle.push((directions.indexOf(turnData.otherShip.direction) + 1) * 60 + 30);
    } else {
        var c = turnData.otherShip.coords.split(';');
        var q = c[0];
        var r = c[1];
        var s = c[2];

        ships.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        ships.y.push(r);
        ships.text.push(`other: One, ${turnData.otherShip.passengers}`);

        shipArrows.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        shipArrows.y.push(r);
        shipArrows.marker.angle.push((directions.indexOf(turnData.otherShip.direction) + 1) * 60 + 30);

        var c = turnData.currentShip.coords.split(';');
        var q = c[0];
        var r = c[1];
        var s = c[2];

        ships.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        ships.y.push(r);
        ships.text.push(`current: Two, ${turnData.currentShip.passengers}`);

        shipArrows.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        shipArrows.y.push(r);
        shipArrows.marker.angle.push((directions.indexOf(turnData.currentShip.direction) + 1) * 60 + 30);
    }

    ships.marker.size = fieldSize * 0.4;
    shipArrows.marker.size = fieldSize * 0.2;

    var top10 = {
        x: [],
        y: [],
        mode: 'markers+text',
        type: 'scatter',
        name: 'Top10',
        marker: { color: [], size: 25, line: { color: '#000', width: 3 } },
        text: [],
        textfont: {
            color: '#000',
        },
        hovertemplate: '<extra></extra>',
        visible: traceVisbilities[3],
    };

    turnData.sortedGraphDock.forEach((s, i) => {
        var c = s[0].split(';');
        var q = c[0];
        var r = c[1];
        var s = c[2];

        top10.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
        top10.y.push(r);
        top10.text.push(i);
        var step = 0.8 / 10;
        var opacity = 1 - step * i;
        top10.marker.color.push('rgba(53, 100, 100, 0.5)');
    });

    top10.marker.size = fieldSize * 0.5;
    top10.textfont.size = fieldSize * 0.25;

    var arrows = [];
    var arrowTypes = ['next', 'start', 'me'];
    var arrowColors = ['#ff0000', '#00ff00', '#ff00ff'];
    var arrowData = [];

    for (var a = 0; a < arrowTypes.length; a++) {
        var arrow = {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: `${arrowTypes[a]}`,
            marker: { color: arrowColors[a], opacity: [], size: 10, symbol: 'triangle-up', angle: [], line: { color: '#000', width: 2 } },
            text: [],
            hovertemplate: '%{text}<extra></extra>',
            visible: traceVisbilities[4 + a],
        };
    
        turnData.data.forEach((d, i) => {
            var c = d[0].split(';');
            var q = parseInt(c[0], 10);
            var r = parseInt(c[1], 10);
            var s = parseInt(c[2], 10);
    
            arrow.x.push(2 * Math.sin(60 * (Math.PI / 180)) * (q - s) / 3);
            arrow.y.push(r);
            if (d[1].nextDirection != null) {
                arrow.marker.angle.push((directions.indexOf(d[1][`${arrowTypes[a]}Direction`]) + 1) * 60 + 30);
                arrow.marker.opacity.push(1)
                arrow.text.push(`${arrowTypes[a]} ${d[1][`${arrowTypes[a]}Distance`]}`);
                fields.customdata[i].push(d[1][`${arrowTypes[a]}Distance`]);
                if (a == arrowColors.length - 1) {
                    fields.customdata[i].push(Math.round(d[1]['distanceScore'] * 10000) / 10000);
                    fields.customdata[i].push(Math.round(d[1]['dockScore'] * 10000) / 10000);
                    fields.customdata[i].push(d[1]['speed']);
                }
            } else {
                arrow.marker.angle.push(0);
                arrow.marker.opacity.push(0)
                arrow.text.push('');
                fields.customdata[i].push('');
                if (a == arrowColors.length - 1) {
                    fields.customdata[i].push('');
                    fields.customdata[i].push('');
                    fields.customdata[i].push('');
                }
            }
        });
            
        arrow.marker.size = fieldSize * 0.2;
        arrows.push(arrow);
    }

    var data = [fields, ships, shipArrows, top10];
    data = data.concat(arrows);

    var layout = {
        margin: { t: 25 },
        xaxis: {
            scaleanchor: 'y',
            scaleratio: 1,
            showgrid: false,
            visible: false,
            fixedrange: true
        },
        yaxis: {
            scaleratio: 1,
            showgrid: false,
            visible: false,
            autorange: 'reversed'
        },
        legend: {
            x: 0,
            y: 1,
            traceorder: 'normal'
        },
        hoverlabel: {
            bgcolor: '#fff'
        }
    }

    var config = {
        displaylogo: false,
        modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'lasso2d', 'select2d', 'zoomIn2d', 'zoomOut2d'],
        doubleClick: 'reset',
        doubleClickDelay: 300
    }

    Plotly.newPlot(plotdiv, data, layout, config);

    plotdiv.on('plotly_legendclick', function(data){
        // toggle
        if (traceVisbilities[data.curveNumber] == true) {
            traceVisbilities[data.curveNumber] = 'legendonly';
        } else if (traceVisbilities[data.curveNumber] == 'legendonly') {
            traceVisbilities[data.curveNumber] = true;
        }

        var update = {visible: traceVisbilities[data.curveNumber]};
        Plotly.restyle(plotdiv, update, [data.curveNumber]);

        return false;
    });
}