function render() {
}

$(".butt_save").click(function () {

    var catalogInstance;

    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return catalogInstance.GetNotifPreferences(App.account);
    }).then(function (list_p) {
        var turn_off = 0;
        if ($('#checkbox').is(':checked')) {
            turn_off = 1;
        } else {
            turn_off = 0;
        }

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