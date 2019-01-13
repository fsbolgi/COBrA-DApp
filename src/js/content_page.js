/* VARIABLES DECLARATION */

var catalogInstance, contentInstance;
var cont_position, t, r, a, g, subg, p, v, address_co, ow;
var r1, r2, r3, r4;

/* RENDER FUNCTION */

function render() {
    var url = new URL(window.location.href);
    cont_position = url.searchParams.get("title");

    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
        var ll = await catalogInstance.GetContentList();
        t = ll[cont_position - 1];
        address_co = await catalogInstance.contents_list(cont_position - 1) + "";
        App.contracts.BaseContent.at(address_co).then(async function (instance) {
            contentInstance = instance;

            AddConsumeButton();
            AddRateButton();
            AddTitle();

            [a, g, subg, p, v, r1, r2, r3, r4, nv, ow, line] = await Promise.all(
                [contentInstance.author(), contentInstance.genre(), contentInstance.subgenre(),
                contentInstance.price(), contentInstance.view_count(),
                contentInstance.feed(0), contentInstance.feed(1),
                contentInstance.feed(2), contentInstance.feed(3),
                contentInstance.nVotes(), contentInstance.owner(), AddMoreInfo()]);

            var table = AddRow("AUTHOR", web3.toAscii(a)) + AddRow("GENRE", web3.toAscii(g))
                + AddRow("SUBGENRE", web3.toAscii(subg)) + AddRow("PRICE", p) + AddRow("VIEWS", v) + line;
            $("#table_content").append(table);

            if (nv != 0) {
                r1 = Math.round(r1 / nv * 10) / 10;
                r2 = Math.round(r2 / nv * 10) / 10;
                r3 = Math.round(r3 / nv * 10) / 10;
                r4 = Math.round(r4 / nv * 10) / 10;
            }
            var table_rate = AddRow("OVERALL", drawStars(Math.floor(r1)) + " " + r1)
                + AddRow("QUALITY", drawStars(Math.floor(r2)) + " " + r2)
                + AddRow("PRICE FAIRNESS", drawStars(Math.floor(r3)) + " " + r3)
                + AddRow("DETAILS PRESENCE", drawStars(Math.floor(r4)) + " " + r4);
            $("#table_rate").append(table_rate);

            var table_contract = AddRow("CONTENT ADDRESS", address_co) + AddRow("OWNER ADDRESS", ow);
            $("#table_contract").append(table_contract);

            if (ow == App.account) {
                var b = "<button type=\"button\" class=\"btn btn-warning btn-sm \
                            pull-left\" id=\"butt_be_paid\" disabled>GET VIEWS REWARD</button>";
                $("#be_paid_container").append(b);

                var tot_views = await contentInstance.view_count();
                var already_paid = await contentInstance.views_already_payed();
                var to_be_paid = tot_views - already_paid;
                var limit_views = await catalogInstance.min_v();
                if (to_be_paid >= limit_views) {
                    $(butt_be_paid).prop("disabled", false);
                }
            }
        });
    });
}

/* BUTTONS EVENTS */

$(".butt_buy_content").click(async function () {
    var is_p = await catalogInstance.isPremium(App.account);
    if (is_p) {
        catalogInstance.GetContentPremium(t, { from: App.account }).then(function () {
            var loc = "personal_page.html";
            window.location = loc;
        });
    } else {
        catalogInstance.GetPrice(t).then(function (cp) {
            catalogInstance.GetContent(t, { from: App.account, value: cp }).then(function () {
                var loc = "personal_page.html";
                window.location = loc;
            });
        });
    }
});

$(".butt_gift_content").click(async function () {
    var addr = document.getElementById("address_gift").value;
    var price = await catalogInstance.GetPrice(t);
    catalogInstance.GiftContent(t, addr, { from: App.account, value: price });
});

$("#title_content").on("click", "#butt_consume", function () {
    contentInstance.ConsumeContent().then(function () {
        var loc = "personal_page.html";
        window.location = loc;
    });
});

$("#title_content").on("click", "#butt_rate", function () {
    var loc = "rate_page.html?title=" + (cont_position);
    window.location = loc;
});

$("#be_paid_container").on("click", "#butt_be_paid", function (e) {
    catalogInstance.PayAuthor(t).then(function () {
        $(e.target).prop("disabled", true);
    });
});

/* UTILITY FUNCTIONS */

function AddConsumeButton() {
    contentInstance.IsAuthorized().then(async function (is_a) {
        if (is_a) {
            var b = "<button type=\"button\" id=\"butt_consume\" class=\"btn btn-success pull-right\">\
                    CONSUME CONTENT</button>";
            $("#title_content").append(b);
        }
    });
}

function AddRateButton() {
    contentInstance.CanVote().then(async function (is_a) {
        if (is_a) {
            var b = "<button type=\"button\" id=\"butt_rate\" class=\"btn btn-success pull-right\">\
                    RATE CONTENT</button>";
            $("#title_content").append(b);
        }
    });
}

function AddTitle() {
    var title_name = web3.toUtf8(t);
    var title_string = "<h3>" + title_name.toUpperCase() + "</h3>";
    $("#title_content").append(title_string);
    catalogInstance.GetRate(t).then(function (r) {
        var rateStars = drawStars(Math.floor(r / 10));
        var rate_score = "<h4>" + rateStars + "" + r / 10 + "</h4>";
        $("#title_content").append(rate_score);
    });
}

function AddRow(field_name, field_value) {
    return "<tr><td scope=\"row\">" + field_name + "</td><td scope=\"row\">" + field_value + "</td></tr>";
}

function AddMoreInfo() {
    var ll, field_name;
    contentInstance.ContentType().then(async function (gg) {
        var genr = web3.toUtf8(gg);
        switch (genr) {
            case "Movie":
                var instance = await App.contracts.MovieContent.at(address_co);
                ll = await instance.movie_length();
                field_name = "MOVIE LENGTH";
                break;
            case "Song":
                var instance = await App.contracts.SongContent.at(address_co);
                ll = await instance.track_length();
                field_name = "TRACK LENGTH";
                break;
            case "Photo":
                var instance = await App.contracts.PhotoContent.at(address_co);
                ll = await instance.n_pixel();
                field_name = "NUMBER OF PIXELS";
                break;
        }
        if (ll != 0) {
            return AddRow(field_name, ll);
        }
    });
}