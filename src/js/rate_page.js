var contentInstance;

function render() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    uri_dec = url.searchParams.get("title");

    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return catalogInstance.GetContentList();
    }).then(async function (ll) {
        t = ll[uri_dec - 1];
        var address_co = await catalogInstance.contents_list(uri_dec - 1) + "";
        App.contracts.BaseContent.at(address_co).then(async function (instance) {
            contentInstance = instance;

            var title_name = web3.toUtf8(t);
            var title_string = "<h3>" + title_name.toUpperCase() + "</h3>";
            $("#title_content").append(title_string);

            contentInstance.CanVote().then(async function (is_a) {
                $(".butt_rate").prop("disabled", false);
            });
        });
    });

}

$(".butt_rate").click(function () {
    $(".alert").remove();
    var overall_val = $('.container_overall input:radio:checked').val();
    var quality_val = $('.container_quality input:radio:checked').val();
    var price_val = $('.container_price input:radio:checked').val();
    var details_val = $('.container_details input:radio:checked').val();
    if (overall_val == null || quality_val == null || price_val == null || details_val == null) {
        var al = "<div class=\"alert alert-danger alert-dismissible\">\
        <a class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
        <strong>Error!</strong> All fields must be filled.</div>";
        $("#title_content").append(al);
    } else {
        contentInstance.LeaveRate([overall_val, quality_val, price_val, details_val]).then(function () {
            var loc = "personal_page.html";
            window.location = loc;
        });
    }
});
