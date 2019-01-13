/* VARIABLES DECLARATION */

var catalogInstance, new_content;
var genre_field_present = false;

/* RENDER FUNCTION */

function render() {
    App.contracts.Catalog.deployed().then(async function (instance) {
        catalogInstance = instance;
        var ll = await catalogInstance.GetContentList();
        const promises = ll.map(async function (t, ix) {
            var ow = await catalogInstance.GetOwner(t);
            if (ow == App.account) {
                InsertRow(t, "author-rows");
            }
        });
        await Promise.all(promises);
    });
}

/* BUTTONS EVENTS */ 

$(".genre_option").click(function (g) {
    if ($("#more_info") != null) {
        $("#more_info").remove();
    }
    var opt_selected = g.target.value;
    if (opt_selected == "Other") {
        if (!genre_field_present) {
            var string_field = "<input type=\"text\" class=\"form-control\" id=\"other_genre_form\"\
           placeholder=\"A different type of content\">";
            $("#genre_field").append(string_field);
            genre_field_present = true;
        }
    } else {
        if ($("#other_genre_form") != null) {
            $("#other_genre_form").remove();
            genre_field_present = false;
        }
        var string_field = "<div class=\"form-group\" id=\"more_info\"><label for=\"more_info_form\">";
        if (opt_selected == "Song") {
            string_field += "TRACK LENGHT"
        } else if (opt_selected == "Movie") {
            string_field += "MOVIE LENGHT";
        } else if (opt_selected == "Photo") {
            string_field += "NUMBER OF PIXELS";
        }
        string_field += "</label><input type=\"text\" class=\"form-control\" id=\"more_info_form\"></div>";
        $(".add_content_form").append(string_field);
    }
});

$(".butt_deploy_contract").click(async function () {
    $(".alert").remove();
    var t = document.getElementById("title_form").value;
    var t_byte = web3.fromAscii(t);
    var a = document.getElementById("author_form").value;
    var g = document.getElementById("genre_form").value;
    if (g == "Other") {
        g = document.getElementById("other_genre_form").value;
    }
    var p = document.getElementById("price_form").value;
    if (t == 0 || a == 0 || g == 0 || p == 0) {
        var al = DangerAlert("All required fields must be filled.");
        $(al).insertAfter("#info_new_cont");
    } else {
        var position = await catalogInstance.position_content(t_byte);
        if (position == 0) {
            $(".butt_deploy_contract").prop("disabled", true);
            $(".butt_add_to_catalog").prop("disabled", false);
            $(".butt_deploy_contract").toggleClass('btn-primary btn-secondary');
            $(".butt_add_to_catalog").toggleClass('btn-primary btn-secondary');
            switch (g) {
                case "Song":
                    new_content = await App.contracts.SongContent.new(catalogInstance.address, t_byte, web3.fromAscii(a), p, { from: App.account });
                    break;
                case "Movie":
                    new_content = await App.contracts.MovieContent.new(catalogInstance.address, t_byte, web3.fromAscii(a), p, { from: App.account });
                    break;
                case "Photo":
                    new_content = await App.contracts.PhotoContent.new(catalogInstance.address, t_byte, web3.fromAscii(a), p, { from: App.account });
                    break;
                default:
                    new_content = await App.contracts.BaseContent.new(catalogInstance.address, t_byte, web3.fromAscii(a), web3.fromAscii(g), p, { from: App.account });
                    break;
            }
            addMoreInformation(g);
        } else {
            var al = DangerAlert("The title inserted is already present in the \
                catalog, choose a unique name.");
            $(al).insertAfter("#info_new_cont");
        }
    }
});

$(".butt_add_to_catalog").click(function () {
    $(".butt_add_to_catalog").prop("disabled", true);
    App.contracts.Catalog.deployed().then(async function (instance) {
        await instance.AddContent(new_content.address, { from: App.account });
        instance.GetLengthCatalog().then(function (l) {
            var loc = "author_page.html?title=" + (l);
            window.location = loc;
        });
    });
});

/* UTILITY FUNCTIONS */

function addMoreInformation(g) {
    var subg = document.getElementById("subgenre_form").value;
    if (subg != 0) {
        new_content.SetSubgenre(web3.fromAscii(subg));
    }

    if (g == "Song" || g == "Movie" || g == "Photo") {
        var more = document.getElementById("more_info_form").value;
        if (more != 0) {
            switch (g) {
                case "Song": new_content.SetTrackLength(more); break;
                case "Movie": new_content.SetMovieLength(more); break;
                case "Photo": new_content.SetNPixel(more); break;
            }
        }
    }
}