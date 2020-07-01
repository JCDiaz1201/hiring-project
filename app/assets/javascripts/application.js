// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require turbolinks
//= require_tree .
//= require highstock
//= require rails-ujs


let plotOptionsObject = {
    area: {
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: .1,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, Highcharts.getOptions().colors[3]],
                [1, Highcharts.color(Highcharts.getOptions().colors[3]).setOpacity(0).get('rgba')]
            ]
        },
        marker: {
            radius: 2.5
        },
        lineWidth: 1.5,
        states: {
            hover: {
                lineWidth: 1
            }
        },
        threshold: null
    }
}

let annotationsSettings = [{
    labels: [{
        point: 'max',
        text: 'Max'
    }, {
        point: 'min',
        text: 'Min',
        backgroundColor: 'white'
    }]
}]

let historicalTemps;

function updateTempsDaily(jsonData) {
    let historicalTemps = jsonData;
    let startDate = historicalTemps[0]["date"];
    let endDate = historicalTemps[23]["date"];

    let temperatureData = [];
    let forecastTemperatureData = [];

    startDate = startDate.split("-");
    startDate.map((element) => {
        startDate.push(parseInt(element));
    });
    startDate.splice(0, 3)

    endDate = endDate.split("-");
    endDate.map((element) => {
        endDate.push(parseInt(element));
    });
    endDate.splice(0, 3)

    if (historicalTemps[23]["forecast"] !== null) {
        let forecastArrayIterable = JSON.parse(historicalTemps[23]["forecast"])
        for (let a = 0; a < forecastArrayIterable.length; a++) {
            forecastTemperatureData.push(parseInt(forecastArrayIterable[a]));
        }
    }

    for (let a = 0; a < historicalTemps.length; a++) {
        temperatureData.push(parseInt(historicalTemps[a]["min"]));
        temperatureData.push(parseInt(historicalTemps[a]["max"]));
    }

    let updateChart = Highcharts.chart('chart-container-one', {
        title: {
            text: 'Big Commerce Campus Historical Highs and Lows'
        },
        chart: {
            type: 'line',
            zoomType: 'x'
        },
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Dates'
            }
        },
        plotOptions: plotOptionsObject,
        series: [{
            name: "Temperature",
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: temperatureData,
            pointInterval: 24 * 3600 * 1000 / 2 // one day
        },
        {
            name: "Temperature -  Forecast",
            type: 'area',
            pointStart: Date.UTC(endDate[0], endDate[1] - 1, endDate[2] + 1),
            data: forecastTemperatureData,
            pointInterval: 24 * 3600 * 1000 / 2 // one day
        }
        ],
        annotations: annotationsSettings
    });
}

// Update function for Chart Two 
function updateTempsInterval(jsonData) {
    let historicalTempsHr = jsonData;
    let startDate = historicalTempsHr[0]["date"]
    let tempsArrayToIterate;
    let tempsArray = [];

    startDate = startDate.split("-");
    startDate.map((element) => {
        startDate.push(parseInt(element));
    });
    startDate.splice(0, 3)

    for (let a = 0; a < historicalTempsHr.length; a++) {
        tempsArray.push(parseInt(historicalTempsHr[a]["hours"]));
    }


    let secondChart = Highcharts.chart('chart-container-two', {
        chart: {
            type: 'line',
            zoomType: 'x'
        },
        title: {
            text: 'Big Commerce Campus Historical 3 Hour Intervals'
        },
        xAxis: {
            type: 'datetime'
        },
        plotOptions: plotOptionsObject,
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        series: [{
            name: "Temperature",
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: tempsArray,
            pointInterval: 24 * 3600 * 1000 / 8 // one day
        }],
        annotations: annotationsSettings
    });

}


document.addEventListener('DOMContentLoaded', function dailyCycle() {
    let current = new Date();
    // Update every day at 8am sharp
    if (current.getHours() === 8 && current.getMinutes() === 0 && current.getSeconds() === 0) {
        $.ajax({
            type: "POST",
            url: "/temps/updaterecords",
            dataType: "json",
            success: function (result) {
                updateTempsDaily(result);
            },
            error: function (x, e) {
                console.log(e);
            }
        })
    }
    current = new Date();                  // allow for time passing
    let delay = 60000 - (current % 60000); // exact ms to next minute interval
    setTimeout(dailyCycle, delay);
});

// Below is timer function for for half hourly data call
document.addEventListener('DOMContentLoaded', function halfHourlyCycle() {
    let currentInterval = new Date();
    if ((currentInterval.getMinutes() === 0 && currentInterval.getSeconds() === 0) || (currentInterval.getMinutes() === 29 && currentInterval.getSeconds() === 0)) {
        $.ajax({
            type: "POST",
            url: "/temps/updaterecordsintervalnew",
            dataType: "json",
            success: function (result) {
                // updateTempsDaily(result);
                updateTempsInterval(result);
            },
            error: function (x, e) {
                console.log(e);
            }
        })
    }
    currentInterval = new Date();                  // allow for time passing
    let delay = 60000 - (currentInterval % 60000); // exact ms to next minute interval
    setTimeout(halfHourlyCycle, delay);
});

$(document).ready(function () {
    historicalTemps = $('.temp_information').data('temps');

    if (historicalTemps[0] !== undefined) {
        $("#populate_button").hide();
        $.ajax({
            type: "POST",
            url: "/temps/updaterecords",
            dataType: "json",
            success: function (result) {
                updateTempsDaily(result);
            },
            error: function (x, e) {
                console.log(e);
            }
        })
        $.ajax({
            type: "POST",
            url: "/temps/updaterecordsinterval",
            dataType: "json",
            success: function (result) {
                updateTempsInterval(result);
            },
            error: function (x, e) {
                console.log(e);
            }
        });
    } else {
        // This function updates database with records then renders data to both charts
        $("#populate_button").bind('click', function () {
            $("#populate_button").hide();
            event.preventDefault();
            event.stopPropagation();
            $.ajax({
                type: "POST",
                url: "/temps/populatedatabase",
                dataType: "json",
                success: function (result) {
                    updateTempsDaily(result);
                    $.ajax({
                        type: "POST",
                        url: "/temps/updaterecordsinterval",
                        dataType: "json",
                        success: function (result) {
                            updateTempsInterval(result);
                        },
                        error: function (x, e) {
                            console.log(e);
                        }
                    });
                },
                error: function (x, e) {
                    console.log(e);
                }
            });

        });
    }
});

