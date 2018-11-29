App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initCatalog();
  },

  initCatalog: function () {
    $.getJSON("Catalog.json", function (catalog) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Catalog = TruffleContract(catalog);
      // Connect provider to interact with contract
      App.contracts.Catalog.setProvider(App.web3Provider);

      return App.initContents();
    });
  },

  initContents: function () {
    $.getJSON("BaseContent.json", function (baseContent) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.BaseContent = TruffleContract(baseContent);
      // Connect provider to interact with contract
      App.contracts.BaseContent.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function () {
    var catalogInstance;
    var contentInstance;

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    var title;
    var author;
    var genre;
    var price;

    // Load contract data
    App.contracts.Catalog.deployed().then(function (instance) {
      catalogInstance = instance;
      return catalogInstance.GetLengthCatalog();
    }).then(function (lengthCatalog) {
      var catalogList = $("#catalog-list");
      App.contracts.BaseContent.deployed().then(function (instance) {
        contentInstance = instance;
        return contentInstance.title();
      }).then(function (t) {
        title = t;
        return contentInstance.author();
      }).then(function (a) {
        author = a;
        return contentInstance.genre();
      }).then(function (g) {
        genre = g;
        return contentInstance.price();
      }).then(function (p) {
        price = p;
        var row = "<tr class=\"clickable-row\" data-href=\"content_page.html\"><th scope=\"row\">4</th>\
        <td>"+web3.toAscii(title)+"</td><td>"+web3.toAscii(author)+"</td><td><span class=\"glyphicon glyphicon-film\"></span> "+web3.toAscii(genre)+"</td>\
        <td>"+price+" wei</td><td>0</td><td><span class=\"glyphicon glyphicon-star-empty\"></span> \
          <span class=\"glyphicon glyphicon-star-empty\"></span> <span class=\"glyphicon glyphicon-star-empty\"></span> \
          <span class=\"glyphicon glyphicon-star-empty\"></span> <span class=\"glyphicon glyphicon-star-empty\"></span>\
        </td></tr>";
        $("#catalog-rows").append(row);
        return catalogInstance.GetContentList();
      }).then( function (list) {
        console.log(list);
      });
    }).catch(function (error) {
      console.warn(error);
    });
  }
};

$(".clickable-row").click(function() {
  console.log("here");
  //window.location = $(this).data("href");
});

$(function () {
  $(window).on('load', function () {
    App.init();
  });
});