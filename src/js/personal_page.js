/* VARIABLES DECLARATION */

var catalogInstance;
var seen_smth = false;
var last_block_seen;

/* RENDER FUNCTION */

function render() {

    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;

        displayNotifications();

        catalogInstance.isPremium(App.account).then(function (is_p) {
            DisplayAccountType(is_p);
        });

        catalogInstance.GetContentList().then(async function (ll) {
            const promises = ll.map(async function (t, ix) {
                var address_co = await catalogInstance.contents_list(ix) + "";
                App.contracts.BaseContent.at(address_co).then(async function (instance) {
                    contentInstance = instance;

                    contentInstance.IsAuthorized().then(async function (is_a) {
                        if (is_a) {
                            InsertRow(t, "to_consume_rows");
                        }
                    }).then(function () {
                        $("#loader1").remove();
                    });

                    contentInstance.has_consumed(App.account).then(async function (has_c) {
                        if (has_c) {
                            InsertRow(t, "to_rate_rows");
                        }
                    }).then(function () {
                        $("#loader2").remove();
                    });

                });
            });
            await Promise.all(promises);
        });
    });
}


/* BUTTONS EVENTS */

$("#butt_setting").click(function () {
    var loc = "notification_page.html";
    window.location = loc;
});

/* UTILITY FUNCTIONS */

function displayNotifications() {

    catalogInstance.notifications_to_see(App.account).then(function (last_b) {
        last_block_seen = last_b;
        return catalogInstance.GetNotifPreferences(App.account);
    }).then(function (pref_list) {

        if (pref_list == 0 || pref_list[0] == 0) {

            listenEvents(last_block_seen, pref_list);
        }

    });
}

function DisplayAccountType(is_p) {
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
}

async function listenEvents(last_block_seen, pref_list) {
    var events = catalogInstance.allEvents({
        fromBlock: last_block_seen,
        toBlock: 'latest'
    });

    events.watch(function (error, result) {
        FilterNotifications(result, pref_list);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function FilterNotifications(result, pref_list) {
    switch (result.event) {
        case "new_publication":
            if (result.args._owner == App.account || pref_list.includes(result.args._author) || pref_list.includes(result.args._genre)) {
                InfoAlert("New Publication", "The content \"" + web3.toAscii(result.args._title) + "\" \
                has been added to the catalog", "address_container");
            }
            break;
        case "content_acquired":
            if (result.args._sender == App.account || result.args._receiver == App.account) {
                if (result.args._gifted == 0) {
                    InfoAlert("Content Acquired", "The content \"" + web3.toAscii(result.args._title) + "\"\
                    has been purchased", "address_container");
                } else {
                    if (result.args._sender == App.account) {
                        InfoAlert("Content Gifted", "The content \"" + web3.toAscii(result.args._title) + "\"\
                        has been gifted to account "+ result.args._receiver, "address_container");
                    } else {
                        InfoAlert("Content Received", "The content \"" + web3.toAscii(result.args._title) + "\"\
                        has been gifted by account "+ result.args._sender, "address_container");
                    }
                }
            }
            break;
        case "premium_acquired":
            if (result.args._sender == App.account || result.args._receiver == App.account) {
                if (result.args._gifted == 0) {
                    InfoAlert("Premium Acquired", "A premium subscription has been purchased", "address_container");
                } else {
                    if (result.args._sender == App.account) {
                        InfoAlert("Premium Gifted", "A premium subscription has been gifted \
                        to account "+ result.args._receiver, "address_container");
                    } else {
                        InfoAlert("Premium Received", "A premium subscription has been gifted \
                    by account "+ result.args._sender, "address_container");
                    }
                }
            }
            break;
        case "author_payed":
            if (result.args._owner == App.account) {
                InfoAlert("Author Paid", "You have been paid " + result.args._tot_money + "\
                wei for \"" + web3.toAscii(result.args._title) + " \"", "address_container");
            }
            break;
        case "min_v_reached":
            if (result.args._account == App.account) {
                InfoAlert("Views Reached", "You have reached \"" + result.args._v + "\
                \" views on the content \"" + web3.toAscii(result.args._title) + "\
                \" you can be paid", "address_container");
            }
            break;
        case "content_consumed":
            if (result.args._customer == App.account) {
                InfoAlert("Content Consumed", "You have seen \"" + web3.toAscii(result.args._title) + "\
                \". Now you can leave a rate", "address_container");
            }
            break;
        case "rate_left":
            if (result.args._customer == App.account) {
                InfoAlert("Rate Left", "You have left a rate for \"" + web3.toAscii(result.args._title) + " \"", "address_container");
            }
            break;
    }
}
