var catalogInstance, contentInstance, uri_dec, t, r, a, g, subg, p, v, r1, r2, r3, r4, ca, co;

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

                    contentInstance.IsAuthorized().then(async function (is_a) {
                        if (is_a) {
                            var b = "<button type=\"button\" id=\"butt_consume\" class=\"btn btn-success pull-right\">\
                            CONSUME CONTENT</button>";
                            $("#title_content").append(b);
                        }
                    });

                    contentInstance.CanVote().then(async function (is_a) {
                        if (is_a) {
                            var b = "<button type=\"button\" id=\"butt_rate\" class=\"btn btn-success pull-right\">\
                            RATE CONTENT</button>";
                            $("#title_content").append(b);
                        }
                    });

                    var title_name = web3.toUtf8(t);
                    var title_string = "<h3>" + title_name.toUpperCase() + "</h3>";
                    $("#title_content").append(title_string);
                    catalogInstance.GetRate(t).then(function (r) {
                        var rateStars = drawStars(Math.floor(r / 10));
                        var rate_score = "<h4>" + rateStars + "" + r / 10 + "</h4>";
                        $("#title_content").append(rate_score);
                    });

                    var line = await contentInstance.ContentType().then(async function (gg) {
                        var genr = web3.toUtf8(gg);
                        switch (genr) {
                            case "Movie":
                                var instance = await App.contracts.MovieContent.at(address_co);
                                var ll = await instance.movie_length();
                                if (ll != 0) {
                                    return "<tr><td scope=\"row\">MOVIE LENGTH</td><td scope=\"row\">" + ll + "</td></tr>";
                                }
                                break;
                            case "Song":
                                var instance = await App.contracts.SongContent.at(address_co);
                                var ll = await instance.track_length();
                                if (ll != 0) {

                                    return "<tr><td scope=\"row\">TRACK LENGTH</td><td scope=\"row\">" + ll + "</td></tr>";
                                }
                                break;
                            case "Photo":
                                var instance = await App.contracts.PhotoContent.at(address_co);
                                var ll = await instance.n_pixel();
                                if (ll != 0) {

                                    return "<tr><td scope=\"row\">NUMBER OF PIXELS</td><td scope=\"row\">" + ll + "</td></tr>";
                                }
                                break;
                            default:
                                return "";
                        }
                    });

                    [a, g, subg, p, v, r1, r2, r3, r4, nv, ca, co] = await Promise.all(
                        [contentInstance.author(), contentInstance.genre(), contentInstance.subgenre(),
                        contentInstance.price(), contentInstance.view_count(),
                        contentInstance.feed(0), contentInstance.feed(1),
                        contentInstance.feed(2), contentInstance.feed(3),
                        contentInstance.nVotes(), contentInstance.content_address(),
                        contentInstance.owner()]);

                    var table = "<tr><td scope=\"row\">AUTHOR</td><td scope=\"row\">" + web3.toAscii(a) + "</td></tr>\
                <tr><td scope=\"row\">GENRE</td><td scope=\"row\">"+ web3.toAscii(g) + "</td></tr>\
                <tr><td scope=\"row\">SUBGENRE</td><td scope=\"row\">"+ web3.toAscii(subg) + "</td></tr>\
                <tr><td scope=\"row\">PRICE</td><td scope=\"row\">"+ p + "</td></tr>\
                <tr><td scope=\"row\">VIEWS</td><td scope=\"row\">"+ v + "</td></tr>" + line;
                    $("#table_content").append(table);

                    if (nv != 0) {
                        r1 = Math.round(r1 / nv * 10) / 10;
                        r2 = Math.round(r2 / nv * 10) / 10;
                        r3 = Math.round(r3 / nv * 10) / 10;
                        r4 = Math.round(r4 / nv * 10) / 10;
                    }
                    var table_rate = "<tr><td scope=\"row\">OVERALL</td><td scope=\"row\">\
                        "+ drawStars(Math.floor(r1)) + " " + r1 + "</td></tr>\
                <tr><td scope=\"row\">QUALITY</td><td scope=\"row\">\
                    "+ drawStars(Math.floor(r2)) + " " + r2 + "</td></tr>\
                <tr><td scope=\"row\">PRICE FAIRNESS</td><td scope=\"row\">\
                    "+ drawStars(Math.floor(r3)) + " " + r3 + "</td></tr>\
                <tr><td scope=\"row\">DETAILS PRESENCE</td><td scope=\"row\">\
                    "+ drawStars(Math.floor(r4)) + " " + r4 + "</td></tr>";
                    $("#table_rate").append(table_rate);

                    var table_contract = "<tr><td scope=\"row\">CONTENT ADDRESS</td><td scope=\"row\">" + ca + "</td></tr>\
                <tr><td scope=\"row\">OWNER ADDRESS</td><td scope=\"row\">"+ co + "</td></tr>";
                    $("#table_contract").append(table_contract);

                    contentInstance.owner().then(async function (ow) {
                        if (ow == App.account) {
                            var b = "<button type=\"button\" class=\"btn btn-warning btn-sm \
                            pull-left\" id=\"butt_be_paid\" disabled>GET VIEWS REWARD</button>";
                            $("#be_paid_container").append(b);

                            var tot_views = await contentInstance.view_count();
                            var already_paid = await contentInstance.views_already_payed();
                            var to_be_paid = tot_views - already_paid;
                            var limit_views = await catalogInstance.v();
                            if (to_be_paid >= limit_views) {
                                $(butt_be_paid).prop("disabled", false);
                            }
                        }
                    });
                });

            });

        }

        $(".butt_buy_content").click(function () {
            App.contracts.Catalog.deployed().then(async function (instance) {
                catalogInstance = instance;
                return catalogInstance.isPremium(App.account);
            }).then(function (is_p) {
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
        });

        $(".butt_gift_content").click(function () {
            var addr = document.getElementById("address_gift").value;
            App.contracts.Catalog.deployed().then(async function (instance) {
                catalogInstance = instance;
                return instance.GetPrice(t);
            }).then(function (cp) {
                catalogInstance.GiftContent(t, addr, { from: App.account, value: cp });
            });
        });

        $("#title_content").on("click", "#butt_consume", function () {
            contentInstance.ConsumeContent().then(function () {
                var loc = "personal_page.html";
                window.location = loc;
            });
        });

        $("#title_content").on("click", "#butt_rate", function () {
            var loc = "rate_page.html?title=" + (uri_dec);
            window.location = loc;
        });

        $("#be_paid_container").on("click", "#butt_be_paid", function (e) {
            catalogInstance.PayAuthor(t).then(function () {
                $(e.target).prop("disabled", true);
            });
        });