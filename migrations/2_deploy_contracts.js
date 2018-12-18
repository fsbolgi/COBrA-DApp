var Catalog = artifacts.require("./Catalog.sol");
var BaseContent = artifacts.require("./BaseContent.sol");
var MovieContent = artifacts.require("./MovieContent.sol");
var PhotoContent = artifacts.require("./PhotoContent.sol");
var SongContent = artifacts.require("./SongContent.sol");


module.exports = function (deployer) {

  // variables declarations
  var catalogInstance, content1, content2, content3, content4, content5, content6;
  var accounts;
  var t1, t2, t3, t4, t5, t6;
  var a1, a2, a3, a4, a5;
  var g1, g2;
  var ps, pm, pp, po;

  deployer.then(async () => {

    accounts = web3.eth.accounts;
    console.log("############ SAVED ACCOUNTS " + accounts[1]);

    createParameters();
    console.log("############ CREATED PARAMS " + t6);

    catalogInstance = await deployer.deploy(Catalog, { from: accounts[1] });
    console.log("############ CATALOG " + catalogInstance.address);

    await deployContents();
    console.log("############ CONTENTS " + content6.address);

    var l = await addContentsToCat();
    console.log("############ ADD CONTENTS " + l);

    await doSomeViews();
    console.log("############ DO SOME VIEWS " + await catalogInstance.GetMostPopularByAuthor(a1));

    await leaveRating();
    console.log("############ LEAVE SOME VOTE " + await catalogInstance.GetMostRated(10));
  })

  function createParameters() {
    // create titles
    t1 = web3.fromAscii("Pretty Shining People");
    t2 = web3.fromAscii("Harry Potter");
    t3 = web3.fromAscii("Beautiful Landscape");
    t4 = web3.fromAscii("And Then There Where None");
    t5 = web3.fromAscii("Happy");
    t6 = web3.fromAscii("Bowl of Fruit");

    // create authors
    a1 = web3.fromAscii("George Ezra");
    a2 = web3.fromAscii("David Yates");
    a3 = web3.fromAscii("P.H. Othographer");
    a4 = web3.fromAscii("Agatha Christie");
    a5 = web3.fromAscii("Pharrell");

    // create genres
    g1 = web3.fromAscii("Book");
    g2 = web3.fromAscii("Photo");

    // create prices
    ps = 30000000000000000;
    pm = 9000000000000000;
    pp = 8500000000000000;
    po = 42000000000000000;
  }

  async function deployContents() {
    [content1, content2, content3, content4, content5, content6] = await Promise.all([
      deployer.deploy(SongContent, Catalog.address, t1, a1, ps, { from: accounts[2] }),
      deployer.deploy(MovieContent, Catalog.address, t2, a2, pm, { from: accounts[2] }),
      deployer.deploy(PhotoContent, Catalog.address, t3, a3, pp, { from: accounts[3] }),
      deployer.deploy(BaseContent, Catalog.address, t4, a4, g1, po, { from: accounts[2] }),
      deployer.deploy(SongContent, Catalog.address, t5, a5, ps, { from: accounts[2] }),
      deployer.deploy(BaseContent, Catalog.address, t6, a3, g2, pp, { from: accounts[3] }),
    ]);
  }

  async function addContentsToCat() {
    await Promise.all([catalogInstance.AddContent(content1.address, { from: accounts[2] }),
    catalogInstance.AddContent(content2.address, { from: accounts[2] }),
    catalogInstance.AddContent(content3.address, { from: accounts[3] }),
    catalogInstance.AddContent(content4.address, { from: accounts[2] }),
    catalogInstance.AddContent(content5.address, { from: accounts[2] }),
    catalogInstance.AddContent(content6.address, { from: accounts[3] })]);
    return catalogInstance.GetLengthCatalog();
  }

  function doSomeViews() {
    var titles = [t1, t1, t2, t2, t2, t2, t2, t3, t3, t4, t4, t4, t5, t5, t5, t5, t6];
    var acc = [accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5],
    accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4]];
    var prices = [ps, ps, pm, pm, pm, pm, pm, pp, pp, po, po, po, ps, ps, ps, ps, pp];
    var conts = [content1, content1, content2, content2, content2, content2, content2, content3, content3, content4, content4, content4, 
      content5, content5, content5, content5, content6];
    for (var j = 0; j < 17; j++) {
      catalogInstance.GetContent(titles[j], { from: acc[j], value: prices[j] });
      conts[j].ConsumeContent({ from: acc[j] });
    }
  }

  function leaveRating() {
    var acc = [accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5],
    accounts[4], accounts[5], accounts[4], accounts[5], accounts[4], accounts[5], accounts[4]];
    var conts = [content1, content1, content2, content2, content2, content2, content2, content3, content3, content4, content4, content4, 
      content5, content5, content5, content5, content6];
    for (var j = 0; j < 17; j++) {
      var rates;
      for (var i = 0; i < 4; i++) {
        if (j % 4 == 0) {
          rates = [Math.floor(Math.random() * 3 + 1), Math.floor(Math.random() * 3 + 1), Math.floor(Math.random() * 3 + 1), Math.floor(Math.random() * 3 + 1)];
        } else {
          rates = [Math.floor(Math.random() * 2 + 4), Math.floor(Math.random() * 2 + 4), Math.floor(Math.random() * 2 + 4), Math.floor(Math.random() * 2 + 4)];
        }
      }
      conts[j].LeaveRate(rates, { from: acc[j] });
    }
  }
}