App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 != 'undefined') {
      App.web3Provider = window.ethereum;
      web3 = new Web3(App.web3Provider);
      try {
        ethereum.enable();
      } catch (error) {
        console.log(error);
      }
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
      web3 = new Web3(App.web3Provider);
    }
    return App.initCatalog();
  },

  initCatalog: function () {
    $.getJSON("Catalog.json", function (catalog) {
      App.contracts.Catalog = TruffleContract(catalog);
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