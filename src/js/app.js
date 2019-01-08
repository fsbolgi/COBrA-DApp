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

    return App.initAccount();
  },

  initAccount: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;

        showNotifications();

        return render();
      }
    });
  }
};

$(function () {
  $(window).on('load', function () {
    App.init();
  });
});

function getIcon(g) {
  var icon;
  if (g == 0x536f6e6700000000000000000000000000000000000000000000000000000000) {
    icon = "glyphicon-music";
  } else if (g == 0x50686f746f000000000000000000000000000000000000000000000000000000) {
    icon = "glyphicon-picture";
  } else if (g == 0x4d6f766965000000000000000000000000000000000000000000000000000000) {
    icon = "glyphicon-film";
  } else {
    icon = "glyphicon-file";
  }
  return icon;
}

function drawStars(r) {
  var stars = "";
  for (var i = 0; i < r; i++) {
    stars += "<span class=\"glyphicon glyphicon-star\"></span> ";
  }
  for (var i = r; i < 5; i++) {
    stars += "<span class=\"glyphicon glyphicon-star-empty\"></span> ";
  }
  return stars;
}

function showNotifications() {

  var catalogInstance;
  var n_notif = 0;

  App.contracts.Catalog.deployed().then(function (instance) {
    catalogInstance = instance;
    return instance.notifications_to_see(App.account);
  }).then(function (n_not) {

    catalogInstance.new_publication({}, {
      fromBlock: n_not,
      toBlock: 'latest'
    }).watch(function () {
      n_notif++;
      insertBadge(n_notif);
    });

    catalogInstance.content_acquired({}, {
      fromBlock: n_not,
      toBlock: 'latest'
    }).watch(function () {
      n_notif++;
      insertBadge(n_notif);
    });

    catalogInstance.premium_acquired({}, {
      fromBlock: n_not,
      toBlock: 'latest'
    }).watch(function () {
      n_notif++;
      insertBadge(n_notif);
    });

    catalogInstance.author_payed({}, {
      fromBlock: n_not,
      toBlock: 'latest'
    }).watch(function () {
      n_notif++;
      insertBadge(n_notif);
    });

  });

  

}

function insertBadge(n_notif) {
  $(".badge").remove();
  var notification = " <span class=\"badge\"> " + n_notif + " </span>";
  $(notification).insertAfter(("#notif"));
}


