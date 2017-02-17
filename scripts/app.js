(function() {
    var services = ['awsIam'];
    var urlsMap = {
        'awsIam': '/json/aws/iam/timeline.json'
    };
    var graphSelectorsMap = {
        'awsIam': 'iamStatusChart'
    };
    var parseRulesMap = {
        'awsIam': {
            'statusName': 'IamStatus',
            'dataNames': ['countUsers', 'countGroups', 'countRoles']
        }
    };
    var rowsMap = {};

    function run() {
        google.charts.load('current', {packages: ['corechart', 'line']});
        fetchTimelineAll(services);
        window.addEventListener("resize", function(){
            drawTimelineGraphAll(services);
        }, false);
    }

    function fetchTimelineAll(services) {
        for (var i=0; i<services.length; i++) {
            var service = services[i];
            fetchTimelineByServiceName(service);
        }
    }
    function fetchTimelineByServiceName(service) {
        var url = urlsMap[service];
        fetch(url)
        .then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('parsed json', json)
            var rows = parseJsonToRows(json, service);
            rowsMap[service] = rows;
            google.charts.setOnLoadCallback(drawTimelineGraphByServiceName.bind(null, service));
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

    function drawTimelineGraphAll(services) {
        for (var i=0; i<services.length; i++) {
            var service = services[i];
            drawTimelineGraphByServiceName(service);
        }
    }

    function drawTimelineGraphByServiceName(service) {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Time');
        var dataNames = parseRulesMap[service]['dataNames'];
        for (var i=0;i<dataNames.length;i++) {
            var dataName = dataNames[i];
            data.addColumn('number', dataName);
        }
        data.addRows(rowsMap[service]);
        var chartElm = document.getElementById(graphSelectorsMap[service]);
        var chart = new google.visualization.LineChart(chartElm);
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
