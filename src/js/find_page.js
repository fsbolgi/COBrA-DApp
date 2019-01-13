/* VARIABLES DECLARATION */

var catalogInstance;
var feed_present = false;
var author_present = false;
var genre_present = false;
var title, field_byte;

/* RENDER FUNCTION */

function render() {
    App.contracts.Catalog.deployed().then(function (instance) {
        catalogInstance = instance;
    });
}

/* BUTTONS EVENTS */

$(".butt_seach_title").click(async function () {
    $(".answer_find").remove();
    var t = document.getElementById("search_title").value;
    var is_p = await catalogInstance.position_content(t);
    if (is_p == 0) {
        ContentNotFound(".search_title_container", "answer_find");
    } else {
        InsertHeader("answer_find", "search-rows", ".search_title_container");
        InsertRow(web3.fromAscii(t), "search-rows");
    }
});

$("#radio_rated").click(function () {
    if (!feed_present) {
        var feed_quest = "<div class=\"container opt_quest\"><p>Do you want a particular category of feedback?</p>\
        <label class=\"radio-inline col-xs-2\"><input type=\"radio\" name=\"optradio3\" value=\"overall\">OVERALL</label>\
        <label class=\"radio-inline col-xs-2\"><input type=\"radio\" name=\"optradio3\" value=\"quality\">QUALITY</label>\
        <label class=\"radio-inline col-xs-2\"><input type=\"radio\" name=\"optradio3\" value=\"price\">PRICE FAIRNESS</label>\
        <label class=\"radio-inline col-xs-2\"><input type=\"radio\" name=\"optradio3\" value=\"details\">DETAILS PRESENCE</label>\
        <label class=\"radio-inline col-xs-2\"><input type=\"radio\" name=\"optradio3\" value=\"avg\">NONE</label></div>";
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

$(".butt_smart_seach").click(async function () {
    $(".alert").remove();
    $(".smart_answer_find").remove();
    var the_most = $('.search_the_most input:radio:checked').val();
    var filter_by = $('.search_filter input:radio:checked').val();
    var rate_field = $('.opt_quest input:radio:checked').val();
    if (the_most == null || filter_by == null || (the_most == "rated" && rate_field == null)) {
        var al = DangerAlert("All required fields must be filled.");
        $(al).insertAfter("#smart_title");
    } else {
        if (filter_by == "author" || filter_by == "genre") {
            var field = document.getElementById("filter_input").value;
            field_byte = web3.fromAscii(field);
        }

        await CallCorrectSearchFunction(the_most, filter_by, rate_field);

        if (title == "0x0000000000000000000000000000000000000000000000000000000000000000") {
            console.log("Not Foutn");
            ContentNotFound(".smart_search", "smart_answer_find");
        } else {
            InsertHeader("smart_answer_find", "smart-search-rows", ".smart_search");
            InsertRow(title, "smart-search-rows");
        }
    }
});

/* UTILITY FUNCTIONS */

function ContentNotFound(container_name, class_name) {
    var not_f = "<h4 class=\"text-center " + class_name + "\">CONTENT NOT FOUND</h4>";
    $(container_name).append(not_f);
}

async function CallCorrectSearchFunction(the_most, filter_by, rate_field) {
    if (the_most == "recent") {
        switch (filter_by) {
            case "no_filter":
                title = await catalogInstance.GetNewContentsList(1);
                title = title[0]; break;
            case "author": title = await catalogInstance.GetLatestByAuthor(field_byte); break;
            case "genre": title = await catalogInstance.GetLatestByGenre(field_byte); break;
        }
    } else if (the_most == "popular") {
        switch (filter_by) {
            case "no_filter": title = await catalogInstance.GetMostPopular(); break;
            case "author": title = await catalogInstance.GetMostPopularByAuthor(field_byte); break;
            case "genre": title = await catalogInstance.GetMostPopularByGenre(field_byte); break;
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
        switch (filter_by) {
            case "no_filter": title = await catalogInstance.GetMostRated(feed_pos); break;
            case "author": title = await catalogInstance.GetMostRatedByAuthor(field_byte, feed_pos); break;
            case "genre": title = await catalogInstance.GetMostRatedByGenre(field_byte, feed_pos); break;
        }
    }
}