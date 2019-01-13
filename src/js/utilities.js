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

function InsertHeader(table_name, rows_name, container_name) {
    var tab_header = "<div class=\"container\"><table class=\"table table-hover " + table_name + "\">\
    <thead><tr><th scope=\"col\">#</th><th scope=\"col\">TITLE</th><th scope=\"col\">\
    AUTHOR</th><th scope=\"col\">GENRE</th><th scope=\"col\">PRICE</th><th scope=\"col\">\
    VIEWS</th><th scope=\"col\">RATING</th></tr></thead><tbody \
    id=\""+ rows_name + "\"></tbody></table></div>";
    $(container_name).append(tab_header);
}

async function InsertRow(t, rows_name) {
    var a, g, p, v, r, position;
    [a, g, p, v, r, position] = await Promise.all([catalogInstance.GetAuthor(t),
    catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
    catalogInstance.GetViews(t), catalogInstance.GetRate(t),
    catalogInstance.position_content(t)]);
    var genreIcon = getIcon(g);
    var rateStars = drawStars(Math.floor(r / 10));
    var loc = "content_page.html?title=" + (position);
    var urlp = encodeURI(loc);
    var row = TableRow(urlp, position, web3.toAscii(t), web3.toAscii(a), genreIcon, web3.toAscii(g), p, v, rateStars);
    $("#" + rows_name).append(row);
}

function TableRow(urlp, ix, t, a, icon, g, p, v, r) {
    return "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\"><th scope=\"row\">\
    " + ix + "</th><td>" + t + "</td><td>" + a + "</td><td><span class=\"glyphicon " + icon + "\"></span> \
    " + g + "</td><td>" + p + " wei</td><td>" + v + "</td><td>" + r + "</td></tr>";
}

function DangerAlert(message) {
    return "<div class=\"alert alert-danger alert-dismissible\">\
    <a class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
    <strong>Error! </strong>"+ message + "</div>";
}

function InfoAlert(e1, e2, container) {
    var al = "<div class=\"alert alert-info alert-dismissible\" \
          role= \"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" \
          aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\
          <strong>"+ e1 + "! </strong>" + e2 + ".</div>";
    $("#"+container).append(al);

}