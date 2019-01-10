function showNotifications() {

    var catalogInstance;

    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
        var last_block_seen = await catalogInstance.notifications_to_see(App.account);
        var pref_list = await catalogInstance.GetNotifPreferences(App.account);

        if (pref_list == 0 || pref_list[0] == 0) {

            catalogInstance.new_publication({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._owner == App.account || pref_list.includes(event.args._author) || pref_list.includes(event.args._genre)) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.content_acquired({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._sender == App.account || event.args._receiver == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.premium_acquired({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._sender == App.account || event.args._receiver == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.author_payed({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._owner == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.min_v_reached({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._account == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.content_consumed({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._customer == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

            catalogInstance.rate_left({}, {
                fromBlock: last_block_seen,
                toBlock: 'latest'
            }).watch(function (error, event) {
                if (event.args._customer == App.account) {
                    insertBadge(Number($(".badge").text()) + 1);
                }
            });

        }
    });
}

function insertBadge(n_notif) {
    $(".badge").remove();
    var notification = " <span class=\"badge\"> " + n_notif + " </span>";
    $(notification).insertAfter(("#notif"));
}

function getIcon(g) {
    var icon;
    switch (g) {
        case "0x536f6e6700000000000000000000000000000000000000000000000000000000": icon = "glyphicon-music"; break;
        case "0x50686f746f000000000000000000000000000000000000000000000000000000": icon = "glyphicon-picture"; break;
        case "0x4d6f766965000000000000000000000000000000000000000000000000000000": icon = "glyphicon-film"; break;
        default: icon = "glyphicon-file"; break;
    }
    return icon;
}

function drawStars(r) {
    var stars = "";
    for (var i = 0; i < r; i++) {
        stars += "<span class=\"glyphicon glyphicon-star\"></span> ";
    }
    for (var i = r; i < 5; i++) {
        stars += "<span class=\"glyphicon glyphicon-star-empty\"></span> ";
    }
    return stars;
}