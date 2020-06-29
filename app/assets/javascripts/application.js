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
//= require jquery_ujs
//= require turbolinks
//= require_tree .
//= require highstock

function getRecordIntervalHalfHour() {
    (function loop() {
        let now = new Date();
        if (now.getMinutes() === 30) {
            $.ajax({
                type: "get",
                url: "/temps/",
                dataType: "json",
                success: function (result) {
                    console.log(result)
                },
                error: function (x, e) {
                    console.log(e)
                }
            })
        }
        now = new Date();                  // allow for time passing
        let delay = 60000 - (now % 60000); // exact ms to next minute interval
        setTimeout(loop, delay);
    })();
}

// Update function for Chart One
function updateTempsDaily(jsonData) {
    let historicalTemps = jsonData;
    let temperatureDates = [];
    let temperatureData = [];
    let startDate = historicalTemps[0]["date"];

    startDate = startDate.split("-");
    startDate.map((element) => {
        startDate.push(parseInt(element));
    });

    startDate.splice(0, 3)

    for (let a = 0; a < historicalTemps.length; a++) {
        temperatureDates.push("Low " + historicalTemps[a]["date"]);
        temperatureDates.push("High " + historicalTemps[a]["date"]);
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
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: .5,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: temperatureData,
            pointInterval: 24 * 3600 * 1000 / 2 // one day
        }],
        annotations: [{
            labels: [{
                point: 'max',
                text: 'Max'
            }, {
                point: 'min',
                text: 'Min',
                backgroundColor: 'white'
            }]
        }]
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
        tempsArrayToIterate = JSON.parse(historicalTempsHr[a]["hours"]);

        for (let b = 0; b < tempsArrayToIterate.length; b++) {
            tempsArray.push(parseInt(tempsArrayToIterate[b]));
        }

        tempsArrayToIterate = [];
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
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        series: [{
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: tempsArray,
            pointInterval: 24 * 3600 * 1000 / 8 // one day
        }]
    });

}

// Update charts with both highs and lows chart and 3hr intervals daily
// This can be converted into half hour intervals
document.addEventListener('DOMContentLoaded',
    function loop() {
        let now = new Date();
        if (now.getHours() === 8 && now.getMinutes() === 0) {
            $.ajax({
                type: "POST",
                url: "/temps/updaterecords",
                dataType: "json",
                success: function (result) {
                    updateTempsDaily(result);
                    updateTempsInterval(result);
                },
                error: function (x, e) {
                    console.log(e);
                }
            })
        }
        now = new Date();                  // allow for time passing
        let delay = 60000 - (now % 60000); // exact ms to next minute interval
        setTimeout(loop, delay);
    }
);

// Below are the original data fillers for the initial render
// Highs and lows
document.addEventListener('DOMContentLoaded', function () {
    let historicalTemps = $('.temp_information').data('temps');
    let temperatureDates = [];
    let temperatureData = [];
    let startDate = $('.temp_information').data('temps')[0]["date"];

    startDate = startDate.split("-");
    startDate.map((element) => {
        startDate.push(parseInt(element));
    });

    startDate.splice(0, 3)


    for (let a = 0; a < historicalTemps.length; a++) {
        temperatureDates.push("Low " + historicalTemps[a]["date"]);
        temperatureDates.push("High " + historicalTemps[a]["date"]);

        temperatureData.push(parseInt(historicalTemps[a]["min"]));
        temperatureData.push(parseInt(historicalTemps[a]["max"]));
    }

    var firstChart = Highcharts.chart('chart-container-one', {
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
            // categories: temperatureDates
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: .5,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: temperatureData,
            pointInterval: 24 * 3600 * 1000 / 2 // one day
        }],
        annotations: [{
            labels: [{
                point: 'max',
                text: 'Max'
            }, {
                point: 'min',
                text: 'Min',
                backgroundColor: 'white'
            }]
        }]
    });
});

// Temperature intervals 
document.addEventListener('DOMContentLoaded', function () {
    let historicalTempsHr = $('.temp_information').data('temps');
    let startDate = $('.temp_information').data('temps')[0]["date"];
    let tempsArrayToIterate;
    let tempsArray = [];

    startDate = startDate.split("-");
    startDate.map((element) => {
        startDate.push(parseInt(element));
    });
    startDate.splice(0, 3)

    for (let a = 0; a < historicalTempsHr.length; a++) {
        tempsArrayToIterate = JSON.parse(historicalTempsHr[a]["hours"]);

        for (let b = 0; b < tempsArrayToIterate.length; b++) {
            tempsArray.push(parseInt(tempsArrayToIterate[b]));
        }
        tempsArrayToIterate = [];
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
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        series: [{
            type: 'area',
            pointStart: Date.UTC(startDate[0], startDate[1] - 1, startDate[2]),
            data: tempsArray,
            pointInterval: 24 * 3600 * 1000 / 8 // one day
        }]
    });

});

