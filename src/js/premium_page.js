/* VARIABLES DECLARATION */

var catalogInstance;

/* RENDER FUNCTION */

function render() {
    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
    });
}

/* BUTTONS EVENTS */

$(".butt_buy_premium").click(function () {

    catalogInstance.cost_premium().then(function (cp) {
        return catalogInstance.BuyPremium({ from: App.account, value: cp });
    }).then(function () {
        var loc = "personal_page.html";
        window.location = loc;
    });
});


$(".butt_gift_premium").click(function () {
    var addr = document.getElementById("address_gift").value;
    catalogInstance.cost_premium().then(function (cp) {
        catalogInstance.GiftPremium(addr, { from: App.account, value: cp });
    });
});
