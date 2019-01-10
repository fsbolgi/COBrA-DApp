pragma solidity ^0.4.19;

import "./Catalog.sol";

contract BaseContent {

    /* VARIABLES DECLARATION */
    
    /* data about the contract itself */
    address public owner; // address of who uploads
    address public content_address; // address of the contract
    Catalog public catalog; // catalog where the content is published
    
    /* data about the content */
    bytes32 public title; // unique ID
    bytes32 public author; // name of the author
    bytes32 public genre; // indicates the type {song, video, photo, etc.}
    bytes32 public subgenre = 0x00; // optionlly can be set
    uint public price; // the price of the content
    uint32 public view_count = 0; // total number of views
    uint32 public views_already_payed = 0; // number of views already payed by the catalog
    
    /* data about feedback */
    uint32[4] public feed; // 0: overall, 1: price, 2: quality, 3: details
    uint32 public nVotes; // number of people who voted
    mapping (address => bool) public has_consumed; // list of addresses who can vote

    /* data about the customers authorized to access the content */
    mapping (address => bool) private authorized_std; // list of standard accounts who can see
    mapping (address => uint) private authorized_premium; // list of premium who can see
    
    /* modifiers that enforce that some functions can be called just by the Catalog */
    modifier byCatalog() {
        require(msg.sender == address(catalog));
        _;
    }

    modifier byOwner() {
        require(msg.sender == owner);
        _;
    }


    /* CONSTRUCTOR */
    
    constructor (Catalog _catalog, bytes32 _title, bytes32 _author, bytes32 _gen, uint _price) public {
        owner = msg.sender;
        content_address = this;
        catalog = _catalog;
        title = _title;
        author = _author;
        genre = _gen;
        price = _price;
    }


    /* VIEW FUNCTIONS */

    /* checks if an account is authorized to consume the content */
    function IsAuthorized() public view returns (bool){
        return authorized_std[msg.sender] || authorized_premium[msg.sender] > block.number;
    }

    /* checks if an account is authorized to leave a feedback */
    function CanVote() public view returns (bool){
        return has_consumed[msg.sender];
    }

    /* dummy function overwritten by subclasses to understant contract class */
    function ContentType() public view returns (bytes32) {
        return "";
    }


    /* STATE MODIFYING FUNCTIONS */

    /* insert the customer address as authorized to access this content */
    function Authorize(address _customer, uint _expiration_date) external byCatalog{
        if (_expiration_date == 0) {
            authorized_std[_customer] = true;
        } else {
            authorized_premium[_customer] = _expiration_date;
        }
    }
    
     /* called by the catalog to mark the views already payed */
    function Payed(uint32 _views_just_payed) external byCatalog {
        views_already_payed = views_already_payed + _views_just_payed; 
    }
    
    /* authorized customers can consume the content */
    function ConsumeContent() external {
        require(IsAuthorized());
        if (authorized_std[msg.sender]) {
            view_count ++;
            if (view_count % catalog.min_v() == 0) {
                catalog.EmitEvent(0, owner, title, (view_count - views_already_payed)); // min_v_reached
            }
            delete authorized_std[msg.sender];
        } else {
            delete authorized_premium[msg.sender];
        }
        has_consumed[msg.sender] = true;
        catalog.EmitEvent(1, msg.sender, title, 0); //content_consumed
    }

    /* customers who has consumed can leave a feedback */
    function LeaveRate(uint32[] f) external {
        require(CanVote());
        for (uint32 i = 0; i < 4; i++) {
            feed[i] = feed[i] + f[i];
        }
        nVotes ++;
        delete has_consumed[msg.sender];
        catalog.EmitEvent(2, msg.sender, title, 0); //rate_left
    }
    
    /* allows the owner to set a subgenre for the content */
    function SetSubgenre (bytes32 _s) external byOwner {
        subgenre = _s;
    }
}