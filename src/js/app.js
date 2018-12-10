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

  initContents: async function () {
    await Promise.all([$.getJSON("BaseContent.json", function (baseContent) {
      App.contracts.BaseContent = TruffleContract(baseContent);
      App.contracts.BaseContent.setProvider(App.web3Provider);
    }),
    $.getJSON("SongContent.json", function (songContent) {
      App.contracts.SongContent = TruffleContract(songContent);
      App.contracts.SongContent.setProvider(App.web3Provider);
    }),
    $.getJSON("MovieContent.json", function (movieContent) {
      App.contracts.MovieContent = TruffleContract(movieContent);
      App.contracts.MovieContent.setProvider(App.web3Provider);
    }),
    $.getJSON("PhotoContent.json", function (photoContent) {
      App.contracts.PhotoContent = TruffleContract(photoContent);
      App.contracts.PhotoContent.setProvider(App.web3Provider);
    })]);
    return App.render();
  },

  render: function () {
    var catalogInstance;

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Catalog.deployed().then(function (instance) {
      catalogInstance = instance;      
      return catalogInstance.GetContentList();
    }).then(async function (ll) {
      const promises = ll.map(async function (t, ix) {
        var a, g, p, v, r;
        [a, g, p, v, r] = await Promise.all([catalogInstance.GetAuthor(t), 
        catalogInstance.GetGenre(t), catalogInstance.GetPrice(t),
        catalogInstance.GetViews(t), catalogInstance.GetRate(t)]);
        var row = "<tr class=\"clickable-row\" data-href=\"content_page.html\"><th scope=\"row\">"+(ix+1)+"</th>\
        <td>"+web3.toAscii(t)+"</td><td>"+web3.toAscii(a)+"</td><td><span class=\"glyphicon glyphicon-film\"\
        ></span> "+web3.toAscii(g)+"</td><td>"+p+" wei</td><td>"+v+"</td><td><span class=\"glyphicon glyphicon-star\
        -empty\"></span><span class=\"glyphicon glyphicon-star-empty\"></span> <span class=\"glyphicon glyphicon\
        -star-empty\"></span><span class=\"glyphicon glyphicon-star-empty\"></span> <span class=\"glyphicon \
        glyphicon-star-empty\"></span></td></tr>";
        $("#catalog-rows").append(row);
      });
      await Promise.all(promises);
      });
  }

};

$(".clickable-row").click(function () {
  console.log("here");
  //window.location = $(this).data("href");
});

$(function () {
  $(window).on('load', function () {
    App.init();
  });
});
