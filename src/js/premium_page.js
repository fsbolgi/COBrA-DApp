function render() {
}

var catalogInstance;
$(".butt_buy_premium").click(function () {
    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
        return instance.cost_premium();
    }).then(function (cp) {
        return catalogInstance.BuyPremium({ from: App.account, value: cp });
    }).then(function () {
        var loc = "personal_page.html";
        window.location = loc;
    });
});
$(".butt_gift_premium").click(function () {
    // read the to section
    var addr = document.getElementById("address_gift").value;
    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
        return instance.cost_premium();
    }).then(function (cp) {
        catalogInstance.GiftPremium(addr, { from: App.account, value: cp });
    });
});
