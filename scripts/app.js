// configure data
var config = {
    'awsIam': {
        'url': '/json/aws/iam/timeline.json',
        'graphId': 'iamStatusChart',
        'parseRulesMap': {
            'statusName': 'IamStatus',
            'dataNames': ['countUsers', 'countGroups', 'countRoles']
        }
    }
};

(function() {
    // application data
    var app = {
        services: [],
        dataStore: {}
    };

    // initialize
    function run() {
        google.charts.load('current', {packages: ['corechart', 'line']});
        initializeAppData();
        fetchTimelineAll();
        window.addEventListener("resize", function(){
            drawTimelineGraphAll();
        }, false);
    }
    function initializeAppData() {
        app.services = [];
        for(var sName in config) {
            app.services.push(sName);
            app.dataStore[sName] = {};
        }
    }

    // fetch
    function fetchTimelineAll() {
        for (var i = 0; i < app.services.length; i++) {
            var sName = app.services[i];
            fetchTimelineByServiceName(sName);
        }
    }
    function fetchTimelineByServiceName(sName) {
        var url = config[sName]['url'];
        fetch(url)
        .then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('[INFO] Parsed json for service timeline', sName, json);
            var rows = parseJsonToRows(json, sName);
            app.dataStore[sName]['rowsMap'] = rows;
            google.charts.setOnLoadCallback(drawTimelineGraphByServiceName.bind(null, sName));
        }).catch(function(ex) {
            console.log('[INFO] Parsing failed for service timeline', sName, ex);
        });
    }

    // parse
    function parseJsonToRows(json, sName) {
        var rows = [];
        if (json && json.list) {
            var list = json.list;
            var size = list.length;
            for (var i=0;i<size;i++) {
                var data = list[i];
                var statusName = config[sName]['parseRulesMap']['statusName'];
                var dataNames = config[sName]['parseRulesMap']['dataNames'];
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

    // draw graph
    function drawTimelineGraphAll() {
        for (var i = 0; i < app.services.length; i++) {
            var sName = app.services[i];
            drawTimelineGraphByServiceName(sName);
        }
    }
    function drawTimelineGraphByServiceName(sName) {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Time');
        var dataNames = config[sName]['parseRulesMap']['dataNames'];
        for (var i = 0; i < dataNames.length; i++) {
            var dataName = dataNames[i];
            dataTable.addColumn('number', dataName);
        }
        dataTable.addRows(app.dataStore[sName]['rowsMap']);
        var chartElm = document.getElementById(config[sName]['graphId']);
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
        chart.draw(dataTable, options);
    }

    // run
    run();
})();
