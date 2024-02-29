function queryData24hGraph() {
    const jsonData = {
        "action": "query_data",
        "minus_days": 1
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        // Handle the response
        var json_response = JSON.parse(this.responseText);
        console.log(json_response);
        // Example
        /* 
        {
            'status': 'OK', 
            "series": [
                {
                    "name": "air_sensors", "columns": [
                        "time", "pm10", "pm2_5", "pm1_0", "temperature", "humidity", "iaq", "raw_pressure"
                    ], 
                    "values": [
                        ["2024-02-27T21:00:00.104691549Z", 133, 127, 70, 21.74959945678711, 52.37208557128906, 55.59168243408203, 101810.9609375], 
                        ["2024-02-27T21:15:00.454907648Z", 113, 103, 59, 21.769824981689453, 52.26197052001953, 54.18393325805664, 101813.734375], 
                        ["2024-02-27T21:30:00.767457674Z", 96, 90, 53, 21.789104461669922, 52.34687805175781, 62.712074279785156, 101821.421875], 
                        ... 
                        ["2024-02-28T20:45:00.765727572Z", 70, 59, 34, 21.07929801940918, 53.21207809448242, 43.231407165527344, 101108.0234375]
                    ]
                }
            ]
        }
        */

        if (json_response.status == "OK") {
            // Build arrays for the chart
            var chartLabels = [];
            var pm10_data = [];
            var pm2_5_data = [];
            var pm1_0_data = [];
            var temperature_data = [];
            var humidity_data = [];
            var iaq_data = [];
            var pressure_data = [];

            var sensorValues = json_response.series[0].values;
            for (var i in sensorValues) {
                chartLabels.push(sensorValues[i][0].substring(0, 16).replace("T", " "));
                pm10_data.push(sensorValues[i][1]);
                pm2_5_data.push(sensorValues[i][2]);
                pm1_0_data.push(sensorValues[i][3]);
                temperature_data.push(Math.round((sensorValues[i][4] + Number.EPSILON) * 100) / 100);
                humidity_data.push(Math.round(sensorValues[i][5] + Number.EPSILON));
                iaq_data.push(Math.round((sensorValues[i][6] + Number.EPSILON) * 100) / 100);
                pressure_data.push(Math.round(sensorValues[i][7] + Number.EPSILON) / 100); // Convert Pa to hPa / millibar
            }
            // Put last result in grid
            document.getElementById("latest_time").innerHTML = chartLabels[chartLabels.length - 1];
            document.getElementById("pm10").innerHTML = pm10_data[pm10_data.length - 1];
            document.getElementById("pm2_5").innerHTML = pm2_5_data[pm2_5_data.length - 1];
            document.getElementById("pm1_0").innerHTML = pm1_0_data[pm1_0_data.length - 1];
            document.getElementById("temperature").innerHTML = temperature_data[temperature_data.length - 1];
            document.getElementById("humidity").innerHTML = humidity_data[humidity_data.length - 1];
            document.getElementById("iaq").innerHTML = iaq_data[iaq_data.length - 1];
            document.getElementById("pressure").innerHTML = pressure_data[pressure_data.length - 1];
            
            // Chart the results - Air Quality
            let chartStatus = Chart.getChart("chartAirQ"); // <canvas> id
            if (chartStatus != undefined) {
                chartStatus.destroy();
            }
            const ctx = document.getElementById('chartAirQ');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'PM 10',
                        yAxisID: 'y',
                        data: pm10_data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        pointHitRadius: 25
                    },
                    {
                        label: 'PM 2.5',
                        yAxisID: 'y',
                        data: pm2_5_data,
                        fill: false,
                        borderColor: 'rgb(255, 205, 86)',
                        tension: 0.1,
                        pointHitRadius: 25
                    },
                    {
                        label: 'PM 1.0',
                        yAxisID: 'y',
                        data: pm1_0_data,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1,
                        pointHitRadius: 25
                    },
                    {
                        label: 'IAQ',
                        yAxisID: 'y1',
                        data: iaq_data,
                        fill: false,
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1,
                        pointHitRadius: 25
                    }]
                },
                options: {
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 90,
                                minRotation: 90
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'µg/m³'
                            },
                            type: 'linear',
                            display: true,
                            position: 'left',
                        },
                        y1: {
                            title: {
                                display: true,
                                text: '0-500'
                            },
                            type: 'linear',
                            display: true,
                            position: 'right',

                            // grid line settings
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });

            // Chart the results - Temperature and Humidity
            let chartStatus2 = Chart.getChart("chartTemperatureHumidity"); // <canvas> id
            if (chartStatus2 != undefined) {
                chartStatus2.destroy();
            }
            const ctx2 = document.getElementById('chartTemperatureHumidity');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Temperature',
                        yAxisID: 'y',
                        data: temperature_data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        pointHitRadius: 25
                    },
                    {
                        label: 'Humidity',
                        yAxisID: 'y1',
                        data: humidity_data,
                        fill: false,
                        borderColor: 'rgb(255, 205, 86)',
                        tension: 0.1,
                        pointHitRadius: 25
                    }]
                },
                options: {
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 90,
                                minRotation: 90
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '°C'
                            },
                            type: 'linear',
                            display: true,
                            position: 'left',
                        },
                        y1: {
                            title: {
                                display: true,
                                text: '% rH'
                            },
                            type: 'linear',
                            display: true,
                            position: 'right',

                            // grid line settings
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });
        } else {
            // Popup with error
            alert("Error returned" + json_response.message);
        }
    }
    // Make the request
    xhttp.open("POST", "/action", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(jsonData));
}

function queryDataDate(date_submit, domParent) {
    const jsonData = {
        "action": "query_data",
        "query_date": date_submit,
        "all_columns": "Y",
        "order_by_time": "desc"
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        // Handle the response
        var json_response = JSON.parse(this.responseText);
        console.log(json_response);
        // Example
        /* 
        {
            'status': 'OK', 
            "series": [
                {
                    "name": "air_sensors", "columns": [
                        "time", "pm10", "pm2_5", "pm1_0", "temperature", "humidity", "iaq", "raw_pressure"
                    ], 
                    "values": [
                        ["2024-02-27T21:00:00.104691549Z", 133, 127, 70, 21.74959945678711, 52.37208557128906, 55.59168243408203, 101810.9609375], 
                        ["2024-02-27T21:15:00.454907648Z", 113, 103, 59, 21.769824981689453, 52.26197052001953, 54.18393325805664, 101813.734375], 
                        ["2024-02-27T21:30:00.767457674Z", 96, 90, 53, 21.789104461669922, 52.34687805175781, 62.712074279785156, 101821.421875], 
                        ... 
                        ["2024-02-28T20:45:00.765727572Z", 70, 59, 34, 21.07929801940918, 53.21207809448242, 43.231407165527344, 101108.0234375]
                    ]
                }
            ]
        }
        */

        if (json_response.status == "OK") {
            if (json_response.hasOwnProperty("series")) {
                var domTable = document.createElement('table');
                
                // columns
                var columnCount = 0;
                var sensorColumns = json_response.series[0].columns;
                // Create <tr> for header row
                var domTrHeaderRow = document.createElement('tr');
                for (var j in sensorColumns) {
                    // Create <th> elements
                    var col_name = sensorColumns[j];
                    if (col_name.startsWith("pm"))
                        col_name = col_name.replaceAll("_", ".");
                    else
                        col_name = col_name.replaceAll("_", " ");
                    var domTh = document.createElement('th');
                    domTh.appendChild(document.createTextNode(col_name));
                    domTrHeaderRow.appendChild(domTh);
                    
                    columnCount++;
                }
                domTable.appendChild(domTrHeaderRow);

                var sensorValues = json_response.series[0].values;
                // data rows
                for (var i in sensorValues) {
                    // Create <tr> for data row
                    var domTrRow = document.createElement('tr');
                    for (var j = 0; j < columnCount; j++) {
                        var data_value = sensorValues[i][j];
                        if (data_value.toString().includes("T"))
                            data_value = data_value.toString().substring(0, 16).replace("T", "\u00A0"); // If data is a timestamp, format it a bit
                        else
                            data_value = Math.round((data_value + Number.EPSILON) * 100) / 100; // 2dp rounding for data values
                        
                        var domTd = document.createElement('td');
                        domTd.appendChild(document.createTextNode(data_value));
                        domTrRow.appendChild(domTd);
                    }
                    domTable.appendChild(domTrRow);
                }
                // Reload table
                domParent.innerHTML = '';
                domParent.appendChild(domTable);
            } else {
                var domSpan = document.createElement('span');
                domSpan.appendChild(document.createTextNode('No Results Found'));
                domParent.innerHTML = '';
                domParent.appendChild(domSpan);
            }
        } else {
            // Popup with error
            alert("Error returned" + json_response.message);
        }
    }
    // Make the request
    xhttp.open("POST", "/action", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(jsonData));
}

function doShutdown() {
    const jsonData = {
        "action": "shutdown"
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        // Handle the response
        var json_response = JSON.parse(this.responseText);
        console.log(json_response);

        if (json_response.status == "OK") {
        // Set the status span elements
        alert('Will shutdown in 1 minute')
        } else {
        // Popup with error
        alert("Error returned" + json_response.message);
        }
    }
    // Make the request
    xhttp.open("POST", "/action", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(jsonData));
}
