(function() {
    var rowsMap = {};
    var urlsMap = {
        'awsIam': '/json/aws/iam/timeline.json'
    };

    function run() {
        google.charts.load('current', {packages: ['corechart', 'line']});
        fetchTimeline(urlsMap.awsIam);
        window.addEventListener("resize", function(){
            drawIamStatusGraph();
        }, false);
    }

    function fetchTimeline(url) {
        fetch(url)
        .then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('parsed json', json)
            rowsMap.iamStatusRows = getIamStatusRows(json);
            google.charts.setOnLoadCallback(drawIamStatusGraph);
        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    }

    function getIamStatusRows(json) {
        var rows = [];
        if (json && json.list) {
            var list = json.list;
            var size = list.length;
            for (var i=0;i<size;i++) {
                var status = list[i].IamStatus;
                var row = [
                    new Date(list[i].datetime),
                    status.countUsers,
                    status.countGroups,
                    status.countRoles,
                ];
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
