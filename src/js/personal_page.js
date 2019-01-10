function render() {

    displayNotifications();

    var catalogInstance;

    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return catalogInstance.isPremium(App.account);
    }).then(function (is_p) {
        var t_a;
        var this_acc = "<h3>YOUR ADDRESS IS " + App.account + "</h3>";
        $("#address_container").append(this_acc);
        if (is_p) {
            catalogInstance.premium_customers(App.account).then(function (exp) {
                web3.eth.getBlockNumber(function (error, bb) {
                    t_a = "<h4>Your premium subscription will expire in " + (exp - bb) + " blocks.</h4>";
                    $("#address_container").append(t_a);
                });
            });
        } else {
            t_a = "<h4>You have a standard account, buy premium!</h4>";
            $("#address_container").append(t_a);
        }
    });

    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return catalogInstance.GetContentList();
    }).then(async function (ll) {
        const promises = ll.map(async function (t, ix) {
            var address_co = await catalogInstance.contents_list(ix) + "";
            App.contracts.BaseContent.at(address_co).then(async function (instance) {
                contentInstance = instance;

                contentInstance.IsAuthorized().then(async function (is_a) {
                    if (is_a) {
                        var a, g, p, v, r;
                        [a, g, p, v, r] = await Promise.all([catalogInstance.GetAuthor(t),
                        catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
                        catalogInstance.GetViews(t), catalogInstance.GetRate(t)]);
                        var genreIcon = await getIcon(g);
                        var rateStars = await drawStars(Math.floor(r / 10));
                        var loc = "content_page.html?title=" + (ix + 1);
                        var urlp = encodeURI(loc);
                        var row = "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\"\
            ><th scope=\"row\">" + (ix + 1) + "</th><td>" + web3.toAscii(t) + "</td><td>" + web3.toAscii(a) + "\
              </td><td><span class=\"glyphicon " + genreIcon + "\"></span> " + web3.toAscii(g) + "</td><td>\
                " + p + " wei</td><td>" + v + "</td><td>" + rateStars + "</td></tr>";
                        $("#to_consume_rows").append(row);
                    }
                }).then(function () {
                    $("#loader1").remove();
                });

                contentInstance.has_consumed(App.account).then(async function (has_c) {
                    if (has_c) {
                        var a, g, p, v, r;
                        [a, g, p, v, r] = await Promise.all([catalogInstance.GetAuthor(t),
                        catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
                        catalogInstance.GetViews(t), catalogInstance.GetRate(t)]);
                        var genreIcon = await getIcon(g);
                        var rateStars = await drawStars(Math.floor(r / 10));
                        var loc = "content_page.html?title=" + (ix + 1);
                        var urlp = encodeURI(loc);
                        var row = "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\"\
            ><th scope=\"row\">" + (ix + 1) + "</th><td>" + web3.toAscii(t) + "</td><td>" + web3.toAscii(a) + "\
              </td><td><span class=\"glyphicon " + genreIcon + "\"></span> " + web3.toAscii(g) + "</td><td>\
                " + p + " wei</td><td>" + v + "</td><td>" + rateStars + "</td></tr>";
                        $("#to_rate_rows").append(row);

                    }
                }).then(function () {
                    $("#loader2").remove();
                });
            });
        });
        await Promise.all(promises);
    });

}

function displayNotifications() {

    var catalogInstance;
    var seen_smth = false;
    var last_block_seen;
    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return instance.notifications_to_see(App.account);
    }).then(function (last_b) {
        last_block_seen = last_b;
        return catalogInstance.GetNotifPreferences(App.account);
    }).then(function (pref_list) {

        if (pref_list == 0 || pref_list[0] == 0) {

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            async function listenEvents() {
                var events = catalogInstance.allEvents({
                    fromBlock: last_block_seen,
                    toBlock: 'latest'
                });

                events.watch(function (error, result) {
                    switch (result.event) {
                        case "new_publication":
                            if (result.args._owner == App.account || pref_list.includes(result.args._author) || pref_list.includes(result.args._genre)) {
                                DisplayAlert("New Publication", "The content \"" + web3.toAscii(result.args._title) + "\" \
                  has been added to the catalog");
                            }
                            break;
                        case "content_acquired":
                            if (result.args._sender == App.account || result.args._receiver == App.account) {
                                if (result.args._gifted == 0) {
                                    DisplayAlert("Content Acquired", "The content \"" + web3.toAscii(result.args._title) + "\"\
                       has been purchased");
                                } else {
                                    if (result.args._sender == App.account) {
                                        DisplayAlert("Content Gifted", "The content \"" + web3.toAscii(result.args._title) + "\"\
                         has been gifted to account "+ result.args._receiver);
                                    } else {
                                        DisplayAlert("Content Received", "The content \"" + web3.toAscii(result.args._title) + "\"\
                         has been gifted by account "+ result.args._sender);
                                    }
                                }
                            }
                            break;
                        case "premium_acquired":
                            if (result.args._sender == App.account || result.args._receiver == App.account) {
                                if (result.args._gifted == 0) {
                                    DisplayAlert("Premium Acquired", "A premium subscription has been purchased");
                                } else {
                                    if (result.args._sender == App.account) {
                                        DisplayAlert("Premium Gifted", "A premium subscription has been gifted \
                        to account "+ result.args._receiver);
                                    } else {
                                        DisplayAlert("Premium Received", "A premium subscription has been gifted \
                        by account "+ result.args._sender);
                                    }
                                }
                            }
                            break;
                        case "author_payed":
                            if (result.args._owner == App.account) {
                                DisplayAlert("Author Paid", "You have been paid " + result.args._tot_money + "\
                    wei for \"" + web3.toAscii(result.args._title) + " \"");
                            }
                            break;
                        case "min_v_reached":
                            if (result.args._account == App.account) {
                                DisplayAlert("Views Reached", "You have reached \"" + result.args._v + "\
                    \" views on the content \"" + web3.toAscii(result.args._title) + "\
                    \" you can be paid");
                            }
                            break;
                        case "content_consumed":
                            if (result.args._customer == App.account) {
                                DisplayAlert("Content Consumed", "You have seen \"" + web3.toAscii(result.args._title) + "\
                    \". Now you can leave a rate");
                            }
                            break;
                        case "rate_left":
                            if (result.args._customer == App.account) {
                                DisplayAlert("Rate Left", "You have left a rate for \"" + web3.toAscii(result.args._title) + " \"");
                            }
                            break;
                    }

                    seen_smth = true;
                });

                await sleep(2000);

                web3.eth.getBlockNumber(function (error, bb) {
                    if (seen_smth) {
                        catalogInstance.SetNotification(App.account, (bb + 1));
                    }
                    $(".badge").remove();
                });
            }

            listenEvents();
        }

    });
}

function DisplayAlert(e1, e2) {
    var al = "<div class=\"alert alert-info alert-dismissible\" \
          role= \"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" \
          aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\
          <strong>"+ e1 + "! </strong>" + e2 + ".</div>";
    $("#address_container").append(al);
}


$("#butt_setting").click(function () {
    var loc = "notification_page.html";
    window.location = loc;
});
