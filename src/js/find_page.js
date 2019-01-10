function render() {
}

var catalogInstance;

function render_result(t) {
    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
        return instance.position_content(t);
    }).then(async function (is_p) {
        if (is_p == 0) {
            var not_f = "<h4 class=\"text-center answer_find\">CONTENT NOT FOUND</h4>";
            $(".search_title_container").append(not_f);
        } else {
            var tab_header = "<div class=\"container\"><table class=\"table table-hover answer_find\">\
          <thead><tr><th scope=\"col\">#</th><th scope=\"col\">TITLE</th><th scope=\"col\">\
          AUTHOR</th><th scope=\"col\">GENRE</th><th scope=\"col\">PRICE</th><th scope=\"col\">\
          VIEWS</th><th scope=\"col\">RATING</th></tr></thead><tbody \
          id=\"search-rows\"></tbody></table></div>";
            $(".search_title_container").append(tab_header);
            var a, g, p, v, r;
            [a, g, p, v, r] = await Promise.all([catalogInstance.GetAuthor(t),
            catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
            catalogInstance.GetViews(t), catalogInstance.GetRate(t)]);
            var genreIcon = getIcon(g);
            var rateStars = drawStars(Math.floor(r / 10));
            var loc = "content_page.html?title=" + (is_p);
            var urlp = encodeURI(loc);
            var row = "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\" ><th scope=\"row\">" + (is_p) + "</th>\
        <td>"+ t + "</td><td>" + web3.toAscii(a) + "</td><td><span class=\"glyphicon " + genreIcon + "\"\
        ></span> "+ web3.toAscii(g) + "</td><td>" + p + " wei</td><td>" + v + "</td><td>" + rateStars + "</td></tr>";
            $("#search-rows").append(row);
        }
    });
}

$(".butt_seach_title").click(function () {
    $(".answer_find").remove();
    var t = document.getElementById("search_title").value;
    render_result(t);
});

var feed_present = false
$("#radio_rated").click(function () {
    if (!feed_present) {
        var feed_quest = "<div class=\"container opt_quest\"><p>Do you want a particular category of feedback?</p>\
      <label class=\"radio-inline  col-xs-2\"><input type=\"radio\" name=\"optradio3\"\
      id=\"radio_overall\" value=\"overall\">OVERALL</label>\
      <label class=\"radio-inline  col-xs-2\"><input type=\"radio\" name=\"optradio3\"\
      id=\"radio_quality\" value=\"quality\">QUALITY</label>\
      <label class=\"radio-inline  col-xs-2\"><input type=\"radio\" name=\"optradio3\"\
      id=\"radio_price\" value=\"price\">PRICE FAIRNESS</label>\
      <label class=\"radio-inline  col-xs-2\"><input type=\"radio\" name=\"optradio3\"\
      id=\"radio_details\" value=\"details\">DETAILS PRESENCE</label>\
      <label class=\"radio-inline  col-xs-2\"><input type=\"radio\" name=\"optradio3\"\
      id=\"radio_avg\" value=\"avg\">NONE</label></div>";
        $(feed_quest).insertAfter(".search_the_most");
        feed_present = true;
    }
});

$("#radio_recent").click(function () {
    if (feed_present) {
        $(".opt_quest").remove();
        feed_present = false;
    }
});

$("#radio_popular").click(function () {
    if (feed_present) {
        $(".opt_quest").remove();
        feed_present = false;
    }
});

var author_present = false;
var genre_present = false;
$("#radio_author").click(function (g) {
    if (genre_present) {
        $(".genre_field").remove();
        genre_present = false;
    }
    if (!author_present) {
        var label = "Insert the name of the author you're looking for:";
        var string_field = "<div class=\"container author_field\"><div class=\"form-group\"><p>" + label + "\
        </p><input type=\"text\" class=\"form-control\" id=\"filter_input\"></div></div>";
        $(string_field).insertAfter(".search_filter");
        author_present = true;
    }
});
$("#radio_genre").click(function (g) {
    if (author_present) {
        $(".author_field").remove();
        author_present = false;
    }
    if (!genre_present) {
        var label = "Insert the name of the genre you're looking for:";
        var string_field = "<div class=\"container genre_field\"><div class=\"form-group\"><p>" + label + "\
        </p><input type=\"text\" class=\"form-control\" id=\"filter_input\"></div></div>";
        $(string_field).insertAfter(".search_filter");
        genre_present = true;
    }
});
$("#radio_no_filter").click(function (g) {
    if (author_present) {
        $(".author_field").remove();
        author_present = false;
    }
    if (genre_present) {
        $(".genre_field").remove();
        genre_present = false;
    }
});

var title, field_byte;
$(".butt_smart_seach").click(function () {
    $(".alert").remove();
    $(".smart_answer_find").remove();
    var the_most = $('.search_the_most input:radio:checked').val();
    var filter_by = $('.search_filter input:radio:checked').val();
    var rate_field = $('.opt_quest input:radio:checked').val();
    if (the_most == null || filter_by == null || (the_most == "rated" && rate_field == null)) {
        var al = "<div class=\"alert alert-danger alert-dismissible\">\
            <a class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
            <strong>Error!</strong> All required fields must be filled.</div>";
        $(al).insertAfter("#smart_title");
    } else {
        App.contracts.Catalog.deployed().then(async function (instance) {
            if (filter_by == "author" || filter_by == "genre") {
                var field = document.getElementById("filter_input").value;
                field_byte = web3.fromAscii(field);
            }

            if (the_most == "recent") {
                if (filter_by == "no_filter") {
                    title = await instance.GetNewContentsList(1);
                    title = title[0];
                } else if (filter_by == "author") {
                    title = await instance.GetLatestByAuthor(field_byte);
                } else {
                    title = await instance.GetLatestByGenre(field_byte);
                }

            } else if (the_most == "popular") {
                if (filter_by == "no_filter") {
                    title = await instance.GetMostPopular();
                } else if (filter_by == "author") {
                    title = await instance.GetMostPopularByAuthor(field_byte);
                } else {
                    title = await instance.GetMostPopularByGenre(field_byte);
                }

            } else {
                var feed_pos;
                switch (rate_field) {
                    case "overall": feed_pos = 0; break;
                    case "quality": feed_pos = 1; break;
                    case "price": feed_pos = 2; break;
                    case "details": feed_pos = 3; break;
                    case "avg": feed_pos = 5; break;
                }
                if (filter_by == "no_filter") {
                    title = await instance.GetMostRated(feed_pos);
                } else if (filter_by == "author") {
                    title = await instance.GetMostRatedByAuthor(field_byte, feed_pos);
                } else {
                    title = await instance.GetMostRatedByGenre(field_byte, feed_pos);
                }
            }
            if (title == "0x0000000000000000000000000000000000000000000000000000000000000000") {
                var not_f = "<h4 class=\"text-center smart_answer_find\">CONTENT NOT FOUND</h4>";
                $(".smart_search").append(not_f);
            } else {
                var tab_header = "<div class=\"container\"><table class=\"table table-hover smart_answer_find\">\
          <thead><tr><th scope=\"col\">#</th><th scope=\"col\">TITLE</th><th scope=\"col\">\
          AUTHOR</th><th scope=\"col\">GENRE</th><th scope=\"col\">PRICE</th><th scope=\"col\">\
          VIEWS</th><th scope=\"col\">RATING</th></tr></thead><tbody \
          id=\"smart-search-rows\"></tbody></table></div>";
                $(".smart_search").append(tab_header);
                var a, g, p, v, r, position;
                var t = title;
                [a, g, p, v, r, position] = await Promise.all([instance.GetAuthor(t),
                instance.GetGenre(t), instance.GetPrice(t),
                instance.GetViews(t), instance.GetRate(t),
                instance.position_content(t)]);
                var genreIcon = getIcon(g);
                var rateStars = drawStars(Math.floor(r / 10));
                var loc = "content_page.html?title=" + (position);
                var urlp = encodeURI(loc);
                var row = "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\" ><th scope=\"row\">" + (position) + "</th>\
        <td>"+ web3.toAscii(t) + "</td><td>" + web3.toAscii(a) + "</td><td><span class=\"glyphicon " + genreIcon + "\"\
        ></span> "+ web3.toAscii(g) + "</td><td>" + p + " wei</td><td>" + v + "</td><td>" + rateStars + "</td></tr>";
                $("#smart-search-rows").append(row);
            }
        });
    }
});