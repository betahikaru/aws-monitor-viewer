(function() {
    var rowsMap = {};
    var urlsMap = {
        'awsIam': '/json/aws/iam/timeline.json'
    };
    var parseRulesMap = {
        'awsIam': {
            'statusName': 'IamStatus',
            'dataNames': ['countUsers', 'countGroups', 'countRoles']
        }
    };

    function run() {
        google.charts.load('current', {packages: ['corechart', 'line']});
        fetchTimeline('awsIam');
        window.addEventListener("resize", function(){
            drawIamStatusGraph();
        }, false);
    }

    function fetchTimeline(service) {
        var url = urlsMap[service];
        fetch(url)
        .then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('parsed json', json)
            rowsMap.iamStatusRows = parseJsonToRows(json, service);
            google.charts.setOnLoadCallback(drawIamStatusGraph);
        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    }

    function parseJsonToRows(json, service) {
        var rows = [];
        if (json && json.list) {
            var list = json.list;
            var size = list.length;
            for (var i=0;i<size;i++) {
                var data = list[i];
                var statusName = parseRulesMap[service]['statusName'];
                var dataNames = parseRulesMap[service]['dataNames'];
                var status = data[statusName];
                var row = [new Date(data.datetime)];
                for (var j=0; j<dataNames.length; j++) {
                    var dataName = dataNames[j];
                    row.push(status[dataName]);
                }
                rows.push(row);
            }
        }
        return rows;
    }

    function drawIamStatusGraph() {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Time');
        data.addColumn('number', 'countUsers');
        data.addColumn('number', 'countGroups');
        data.addColumn('number', 'countRoles');
        data.addRows(rowsMap.iamStatusRows);
        var iamStatusChart = document.getElementById('iamStatusChart');
        var chart = new google.visualization.LineChart(iamStatusChart);
        var options = {
            hAxis: {
                title: 'Day'
            },
            vAxis: {
                title: 'IamStatus'
            },
            chartArea:{
                left: 100,
                top: 20,
                width:'60%',
                height:'80%'
            }
        };
        chart.draw(data, options);
    }

    // Run
    run();
})();
