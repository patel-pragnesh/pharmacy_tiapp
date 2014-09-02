windowFunctions['Query Geo Fences'] = function (evt) {
    var win = createWindow();
    var offset = addBackButton(win);

    var table = Ti.UI.createTableView({
        backgroundColor: '#fff',
        top: offset + u, bottom: 0,
        data: [
            { title: 'Loading, please wait...' }
        ]
    });
    win.add(table);

    table.addEventListener('click', function (evt) {
        if (evt.row.id) {
            handleOpenWindow({ 
                target: 'Update GeoFence', 
                id: evt.row.id, 
                loc: evt.row.loc,
                payload: evt.row.payload
            });
        }
    });

    win.addEventListener('focus', function () {
        table.setData([{ title: 'Loading, please wait...' }]);
        Cloud.GeoFences.query({}, function (e) {
            if (e.success) {
                if (e.geo_fences.length == 0) {
                    table.setData([
                        { title: 'No Results!' }
                    ]);
                } else {
                    var data = [];
                    for (var i = 0, l = e.geo_fences.length; i < l; i++) {
                        var payload = e.geo_fences[i].payload;
                        var loc = e.geo_fences[i].loc;
                        data.push(Ti.UI.createTableViewRow({
                            title: payload.name + " " + JSON.stringify(loc.coordinates),
                            loc: loc,
                            payload: payload,
                            id: e.geo_fences[i].id
                        }));
                    }
                    table.setData(data);
                }
            } else {
                error(e);
            }
        });
    });
    win.open();
};