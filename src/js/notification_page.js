/* VARIABLES DECLARATION */

var catalogInstance;

/* RENDER FUNCTION */

function render() {
    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
    });
}

/* BUTTONS EVENTS */

$(".butt_save").click(function () {
    catalogInstance.GetNotifPreferences(App.account).then(function (list_p) {
        var turn_off = ($('#checkbox').is(':checked')) ? 1 : 0;

        if (list_p == []) {
            list_p = [turn_off];
        } else {
            list_p[0] = turn_off;
        }

        var a = document.getElementById("author_form").value;
        var g = document.getElementById("genre_form").value;
        if (a != 0) {
            list_p.push(web3.fromAscii(a));
        }
        if (g != 0) {
            list_p.push(web3.fromAscii(g));
        }
        catalogInstance.SetNotifPreferences(App.account, list_p);

        var loc = "personal_page.html";
        window.location = loc;
    });
});