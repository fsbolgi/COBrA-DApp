
/* VARIABLES DECLARATION */

var catalogInstance;

/* RENDER FUNCTION */

function render() {

  App.contracts.Catalog.deployed().then(function (instance) {
    catalogInstance = instance;
    return catalogInstance.GetContentList();
  }).then(async function (ll) {
    const promises = ll.map(async function (t, ix) {
      InsertRow(t, "catalog-rows");
    });
    await Promise.all(promises);

    catalogInstance.owner().then(async function (ow) {
      if (ow == App.account) {
        var b = "<button type=\"button\" class=\"btn btn-danger btn-sm \
        pull-right\" id=\"butt_del_cat\">DELETE CATALOG</button>";
        $("#del_cat_container").append(b);
      }
    });
  });
}

/* BUTTONS EVENTS */

$("#del_cat_container").on("click", "#butt_del_cat", function (t) {
  catalogInstance.KillCatalog().then(function () {
    $(".table").remove();
  });
});