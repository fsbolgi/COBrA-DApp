function render() {

  var catalogInstance;

  App.contracts.Catalog.deployed().then(function (instance) {
    catalogInstance = instance;
    return catalogInstance.GetContentList();
  }).then(async function (ll) {
    const promises = ll.map(async function (t, ix) {
      var a, g, p, v, r;
      [a, g, p, v, r] = await Promise.all([catalogInstance.GetAuthor(t),
      catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
      catalogInstance.GetViews(t), catalogInstance.GetRate(t)]);
      var genreIcon = getIcon(g);
      var rateStars = drawStars(Math.floor(r / 10));
      var loc = "content_page.html?title=" + (ix + 1);
      var urlp = encodeURI(loc);
      var row = "<tr class=\"clickable-row\"  onclick=\"window.location='" + urlp + "';\" ><th scope=\"row\">" + (ix + 1) + "</th>\
    <td>"+ web3.toAscii(t) + "</td><td>" + web3.toAscii(a) + "</td><td><span class=\"glyphicon " + genreIcon + "\"\
    ></span> "+ web3.toAscii(g) + "</td><td>" + p + " wei</td><td>" + v + "</td><td>" + rateStars + "</td></tr>";
      $("#catalog-rows").append(row);
    });
    await Promise.all(promises);
  });

  App.contracts.Catalog.deployed().then(function (instance) {
    return instance.owner();
  }).then(async function (ow) {
    if (ow == App.account) {
      var b = "<button type=\"button\" class=\"btn btn-danger btn-sm \
      pull-right\" id=\"butt_del_cat\">DELETE CATALOG</button>";
      $("#del_cat_container").append(b);
    }
  });
}

$("#del_cat_container").on("click", "#butt_del_cat", function (t) {
  App.contracts.Catalog.deployed().then(function (instance) {
    instance.KillCatalog().then(function () {
      $(".table").remove();
    });
  });
});