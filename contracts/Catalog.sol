pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract Catalog{
    
    /* data about the contract itself */
    address public owner; // address of who uploads
    address private catalog_address; // address of the contract
    
    /* data about the catalog */
    BaseContent[] public contents_list; 
    mapping (bytes32 => uint) public position_content;
    mapping (address => uint) public premium_customers; // address of customer to expiration date as block height
    
    /* data about the accounts */
    mapping (address => uint) public notifications_to_see;
    mapping (address => bytes32[]) public notifications_preferences;

    /* utilities variables */
    uint private time_premium = 40000; // premium lasts approximately one week
    uint public cost_premium = 0.25 ether; // premium costs about 20 euro
    uint16 public v = 7; // number of views required before payment
    
    /* events triggered */
    event new_publication (bytes32 _title, bytes32 _author, bytes32 _genre, address _owner);
    event content_acquired (bytes32 _title, address _sender, address _receiver, uint32 _gifted);
    event premium_acquired (address _sender, address _receiver, uint32 _gifted);
    event author_payed (bytes32 _t, address _owner, uint _tot_money);
    event v_reached (address _account, bytes32 _title, uint _v); // reached the number of views to request a payment
    event content_consumed (address _customer, bytes32 _title); // customer just consumed this content
    event rate_left(address _customer, bytes32 _title); // customer just left a rating for this content


    /* modifiers that enforce that some functions are called just by specif agents */
    modifier byOwner() {
        require(msg.sender == owner);
        _;
    }

    /* constructor function of the catalog */
    constructor () public {
        owner = msg.sender;
        catalog_address = address(this);
    }
    
    
    
    /* Functions which do not change the state of the contract */
    function GetLengthCatalog () public view returns (uint) {
        return contents_list.length;
    }

    /* returns the author of a content */
    function GetAuthor(bytes32 _t) public view returns (bytes32) {
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].author();
        }
    }
    
    /* returns the author of a content */
    function GetGenre(bytes32 _t) public view returns (bytes32) {
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].genre();
        }
    }
    
    /* returns the price of a content */
    function GetPrice (bytes32 _t) public view returns (uint){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].price();
        }
    }

    /* returns the number of views of a content */
    function GetViews (bytes32 _t) public view returns (uint32){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].view_count();
        }
    }

    /* returns the number of views of a content */
    function GetOwner (bytes32 _t) public view returns (address){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].owner();
        }
    }

    function GetNotifPreferences(address _u) public view returns (bytes32[] memory) {
        return notifications_preferences[_u];
    }

    function SetNotifPreferences(address _u, bytes32[] memory _list) public {
        notifications_preferences[_u] = _list;
    }

    function EmitEvent(uint _eventID, address _account, bytes32 _t, uint _v) public {

        if (_eventID == 0) {
            emit v_reached(_account, _t, _v);
        } else if (_eventID == 1) {
            emit content_consumed(_account, _t);
        } else {
            emit rate_left(_account, _t);
        }
    }


    /* returns the average rating for a content */ 
    function GetRate (bytes32 _t) public view returns (uint32) {
        uint i = position_content[_t];
        uint32 s = 0;
        BaseContent bc = contents_list[i-1];
        for(uint32 j = 0; j < 4; j++){
            s += bc.feed(j);
        }
        if (bc.nVotes() != 0 ) {
            return ((s * 10) / (bc.nVotes() * 4));
        } else {
            return 0;
        }
    }
    
    
    /* returns the number of views for each content */
    function GetStatistics () public view returns (bytes32[] memory, uint32[] memory){
        uint l_length = contents_list.length;
        bytes32[] memory titles_list = new bytes32[](l_length);
        uint32[] memory views_list = new uint32[](l_length);
        for (uint i = 0; i < l_length; i++) {
            titles_list[i] = contents_list[i].title();
            views_list[i] = contents_list[i].view_count();
        }
        return (titles_list, views_list);
    }
    
    /* returns the list of contents without the number of views */
    function GetContentList() public view returns (bytes32[] memory) {
        uint l_length = contents_list.length;
        bytes32[] memory titles_list = new bytes32[](l_length);
        for (uint i = 0; i < l_length; i++) {
            titles_list[i] = contents_list[i].title();
        }
        return titles_list;
    }
    
    /* returns the list of x newest contents */
    function GetNewContentsList (uint x) public view returns (bytes32[] memory) {
        uint l_length = contents_list.length;
        bytes32[] memory titles_list = new bytes32[](x);
        if (l_length > 0 && x != 0) {
            require(x <= l_length);
            for (uint i = l_length - 1; i >= l_length-x; i--) {
                titles_list[l_length - 1 - i] = contents_list[i].title();
                if (i == 0) {
                    return titles_list;
                }
            }
        }
        return titles_list;
    }
    
    /* returns the most recent content with genre _g */
    function GetLatestByGenre(bytes32 _g) public view returns (bytes32) {
        uint l_length = contents_list.length;
        if (l_length > 0) {
            for (uint i = l_length - 1; i >= 0; i--) {
                if (contents_list[i].genre() == _g) {
                    return contents_list[i].title();
                }
                if (i == 0) {
                    return 0x0;
                }
            }
        }
    }
    
    /* returns the content with genre _g with max views */
    function GetMostPopularByGenre (bytes32 _g) public view returns (bytes32) {
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            if (contents_list[i].genre() == _g && contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }
    
    /* returns the most recent content of the author _a */
    function GetLatestByAuthor (bytes32 _a) public view returns (bytes32) {
        uint l_length = contents_list.length;
        if (l_length > 0) {
            for (uint i = l_length - 1; i >= 0; i--) {
                if (contents_list[i].author() == _a) {
                    return contents_list[i].title();
                }
                if (i == 0) {
                    return 0x0;
                }
            }
        }
    }
    
    /* returns the content with most views of the author _a */
    function GetMostPopularByAuthor (bytes32 _a) public view returns (bytes32){
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            if (contents_list[i].author() == _a && contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }

    /* returns the content with most views */
    function GetMostPopular () public view returns (bytes32){
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            if (contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }
    
    /* returns the content with highest rating for feedback category _y 
    (or highest average of all ratings if y is not specified) */
    function GetMostRated (uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            BaseContent bc = contents_list[i];
            if (bc.nVotes() != 0 ) {
                uint32 r = (_y < 4)? ((bc.feed(_y) * 10) / bc.nVotes()) : GetRate(bc.title());
                if (r > highest_rating) {
                    most_rated = bc.title();
                    highest_rating = r;
                }
            }
        }
        return most_rated;
    }
    
     /* returns the content with highest rating for feedback category _y 
    (or highest average of all ratings if y is not specified) with genre _g */
    function GetMostRatedByGenre (bytes32 _g, uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            BaseContent bc = contents_list[i];
            if (bc.genre() == _g && bc.nVotes() != 0 ) {
                uint32 r = (_y < 4)? ((bc.feed(_y) * 10) / bc.nVotes()) : GetRate(bc.title());
                if (r > highest_rating) {
                    most_rated = bc.title();
                    highest_rating = r;
                }
            }
        }
        return most_rated;
    }
    
    /* returns the content with highest rating for feedback category _y 
    (or highest average of all ratings if y is not specified) with author _a */
    function GetMostRatedByAuthor (bytes32 _a, uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            BaseContent bc = contents_list[i];
            if (bc.author() == _a && bc.nVotes() != 0 ) {
                uint32 r = (_y < 4)? ((bc.feed(_y) * 10) / bc.nVotes()) : GetRate(bc.title());
                if (r > highest_rating) {
                    most_rated = bc.title();
                    highest_rating = r;
                }
            }
        }
        return most_rated;
    }
    
    
    /* returns true if _c is a valid premium account */
    function isPremium (address _c) public view returns(bool) {
        return premium_customers[_c] > block.number;
    }
    
    
    
    /* Functions which modify the state of the contract */
    
    /* submits a new content _c to the catalog */
    function AddContent (BaseContent _c) external returns (uint){
        BaseContent cm = _c;
        require (cm.owner() == msg.sender && cm.catalog() == catalog_address);
        contents_list.push(cm);
        position_content[cm.title()] = contents_list.length;
        emit new_publication (cm.title(), cm.author(), cm.genre(), cm.owner());
        return contents_list.length;
    }
    
    /* pays to access content _t */
    function GetContent (bytes32 _t) external payable {
        require(msg.value == GetPrice(_t));
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].Authorize(msg.sender);
            emit content_acquired (_t, msg.sender, msg.sender, 0);
        }
    }
    
    /* premium accounts can requests access to content _t without paying */
    function GetContentPremium (bytes32 _t) external {
        require(isPremium(msg.sender));
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].AuthorizePremium(msg.sender, premium_customers[msg.sender]);
            emit content_acquired (_t, msg.sender, msg.sender, 0);
        }
    }
    
    /* pays for granting access to content _t to the user _u */
    function GiftContent  (bytes32 _t, address _u) external payable {
        require(msg.value == GetPrice(_t));        
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].Authorize(_u);
            emit content_acquired (_t, msg.sender, _u, 1);
        }
    }
       
    /* buys a new premium subscription */
    function BuyPremium () external payable {
        require(msg.value == cost_premium);
        premium_customers[msg.sender] = block.number + time_premium;
        emit premium_acquired (msg.sender, msg.sender, 0);
    }

     /* pays for granting a premium account to the user _u */
    function GiftPremium  (address _u) external payable {
        require(msg.value == cost_premium);
        premium_customers[_u] = block.number + time_premium;
        emit premium_acquired (msg.sender, _u, 1);
    }

    /* allows to set the last block seen by an account */
    function SetNotification (address _a, uint _x) external {
        notifications_to_see[_a] = _x;
    }
    
    /* pay an author a multiple of v views*/
    function PayAuthor (bytes32 _t) external {
        uint i = position_content[_t];
        if (i != 0) {
            uint32 tot_views = contents_list[i-1].view_count();
            uint32 to_pay = tot_views - contents_list[i-1].views_already_payed();
            if (to_pay >= v) {
                uint256 price_per_view = contents_list[i-1].price() * GetRate(_t)/50;
                contents_list[i-1].owner().transfer(to_pay * price_per_view);
                contents_list[i-1].Payed(to_pay);
                emit author_payed (_t, contents_list[i-1].owner(), to_pay * price_per_view);
            }
        }
    }
    
    /* returns the total number of views and the total number of views that has to payed */
    function GetTotalViews () private view returns (uint) {
        uint tot_views = 0;
        for (uint i = 0; i < contents_list.length; i++) {
            tot_views = tot_views + contents_list[i].view_count();
        }
        return tot_views;
    }
    
    /* the catalog can be destructed */
    function KillCatalog () external byOwner {
        uint tot_views = GetTotalViews();
        uint money_per_view = catalog_address.balance / tot_views;
        for (uint i = 0; i < contents_list.length; i++) {
            uint proportional_money = contents_list[i].view_count() * money_per_view;
            contents_list[i].owner().transfer(proportional_money);
            emit author_payed (contents_list[i].title(), contents_list[i-1].owner(), proportional_money);
        }
        selfdestruct(catalog_address);
    }
}