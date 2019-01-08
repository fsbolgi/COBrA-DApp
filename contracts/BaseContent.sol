pragma solidity ^0.4.19;

import "./Catalog.sol";

contract BaseContent {
    
    /* data about the contract itself */
    address public owner; // address of who uploads
    address public content_address; // address of the contract
    address public catalog; // catalog where the content is published
    
    /* data about the content */
    bytes32 public title; // unique ID
    bytes32 public author; // name of the author
    bytes32 public genre; // indicates the type {song, video, photo}
    bytes32 public subgenre;
    uint public price; // the price to consume the content
    uint32 public view_count; // number of views
    uint32 public views_already_payed; // number of viewsalready payed by the catalog
    
    /* data about feedback */
    uint32[4] public feed; // 0: overall, 1: price, 2: quality, 3: details
    uint32 public nVotes; // number of people who voted
    mapping (address => bool) public has_consumed; // list of addresses who can vote


    /* data about the customers authorized to access the content */
    mapping (address => bool) private authorized_std;
    mapping (address => uint) private authorized_premium;
    
    uint32 private v = 100; // number of views required before payment


    /* events triggered */
    event v_reached (uint32 _views_to_be_payed); // reached the number of views to request a payment
    event content_consumed (address _customer); // customer just consumed this content
    event rate_left(address _customer); // customer just left a rating for this content

    /* modifiers that enforce that some functions are called just by specif agents */
    modifier byOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier byCatalog() {
        require(msg.sender == catalog);
        _;
    }
    modifier byAuthorized() {
        require(IsAuthorized());
        _;
    }

    modifier byConsumer() {
        require(CanVote());
        _;
    }
    
    /* constructor function of the content manager */
    constructor (address _catalog, bytes32 _title, bytes32 _author, bytes32 _gen, uint _price) public {
        owner = msg.sender;
        content_address = this;
        catalog = _catalog;
        title = _title;
        author = _author;
        genre = _gen;
        subgenre = 0x00;
        price = _price;
        view_count = 0;
        views_already_payed = 0;
    }


    /* insert the customer address as authorized to access this content */
    function Authorize (address _customer) external byCatalog{
        authorized_std[_customer] = true;
    }
    
    /* insert the customer address as authorized to access this content */
    function AuthorizePremium (address _customer, uint _expiration_date) external byCatalog{
        authorized_premium[_customer] = _expiration_date;
    }

    function IsAuthorized() public view returns (bool){
        return authorized_std[msg.sender] || authorized_premium[msg.sender] > block.number;
    }

    function CanVote() public view returns (bool){
        return has_consumed[msg.sender];
    }

    function ContentType() public view returns (bytes32) {
        return "";
    }
    
     /* called by the catalog to mark the views already payed */
    function Payed (uint32 _views_just_payed) external byCatalog {
        views_already_payed = views_already_payed + _views_just_payed; 
    }
    
    /* authorized customers can consume the content */
    function ConsumeContent () external byAuthorized {
        if (authorized_std[msg.sender]) {
            view_count ++;
            if (view_count % v == 0) {
                emit v_reached (view_count - views_already_payed);
            }
            delete authorized_std[msg.sender];
        } else {
            delete authorized_premium[msg.sender];
        }
        has_consumed[msg.sender] = true;
        emit content_consumed (msg.sender);
    }

    /* authorized customers can consume the content */
    function LeaveRate ( uint32[] f ) external byConsumer {
        for (uint32 i = 0; i < 4; i++) {
            feed[i] = feed[i] + f[i];
        }
        nVotes ++;
        delete has_consumed[msg.sender];
        emit rate_left (msg.sender);
    }
    
    function SetSubgenre (bytes32 _s) external byOwner {
        subgenre = _s;
    }
        
}