pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract Catalog {

    /* VARIABLES DECLARATION */
    
    /* data about the contract itself */
    address public owner; // address of who uploads
    address private catalog_address; // address of the contract
    
    /* data about the catalog */
    BaseContent[] public contents_list; // list of all the contents in the catalog
    mapping (bytes32 => uint) public position_content; // map from title to position + 1
    uint private time_premium = 40000; // premium lasts approximately one week
    uint public cost_premium = 0.25 ether; // premium costs about 20 euro
    uint32 public min_v = 7; // number of views required before payment
    
    /* data about the accounts */
    mapping (address => uint) public premium_customers; // map from premium to expiration date
    mapping (address => uint) public notifications_to_see; // map from account to last block seen
    mapping (address => bytes32[]) public notifications_preferences; // map from account to notification setting
    
    /* events triggered */
    event new_publication (bytes32 _title, bytes32 _author, bytes32 _genre, address _owner);
    event content_acquired (bytes32 _title, address _sender, address _receiver, uint32 _gifted);
    event premium_acquired (address _sender, address _receiver, uint32 _gifted);
    event author_payed (bytes32 _t, address _owner, uint _tot_money);
    event min_v_reached (address _account, bytes32 _title, uint _v); 
    event content_consumed (address _customer, bytes32 _title); 
    event rate_left(address _customer, bytes32 _title);


    /* CONSTRUCTOR */

    constructor () public {
        owner = msg.sender;
        catalog_address = address(this);
    }
    

    /* VIEW FUNCTIONS */

    /* returns the number of contents in the catalog */ 
    function GetLengthCatalog() public view returns (uint) {
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
    function GetPrice(bytes32 _t) public view returns (uint){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].price();
        }
    }

    /* returns the number of views of a content */
    function GetViews(bytes32 _t) public view returns (uint32){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].view_count();
        }
    }

    /* returns the owner of a content */
    function GetOwner(bytes32 _t) public view returns (address){
        uint i = position_content[_t];
        if (i != 0) {
            return contents_list[i-1].owner();
        }
    }

    /* returns the average rating for a content from 0 to 50 */ 
    function GetRate(bytes32 _t) public view returns (uint32) {
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

    /* returns the list of notification preferences of an account */
    function GetNotifPreferences(address _u) public view returns (bytes32[] memory) {
        return notifications_preferences[_u];
    }
    
    /* returns the number of views for each content */
    function GetStatistics() public view returns (bytes32[] memory, uint32[] memory){
        uint l_length = GetLengthCatalog();
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
        uint l_length = GetLengthCatalog();
        bytes32[] memory titles_list = new bytes32[](l_length);
        for (uint i = 0; i < l_length; i++) {
            titles_list[i] = contents_list[i].title();
        }
        return titles_list;
    }
    
    /* returns the list of x newest contents */
    function GetNewContentsList(uint x) public view returns (bytes32[] memory) {
        uint l_length = GetLengthCatalog();
        require(x <= l_length);
        bytes32[] memory titles_list = new bytes32[](x);
        if (l_length > 0 && x > 0) {
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
        uint l_length = GetLengthCatalog();
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
        return 0x0;
    }
    
    /* returns the content with genre _g with max views */
    function GetMostPopularByGenre(bytes32 _g) public view returns (bytes32) {
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            if (contents_list[i].genre() == _g && contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }
    
    /* returns the most recent content of the author _a */
    function GetLatestByAuthor(bytes32 _a) public view returns (bytes32) {
        uint l_length = GetLengthCatalog();
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
        return 0x0;
    }
    
    /* returns the content with most views of the author _a */
    function GetMostPopularByAuthor(bytes32 _a) public view returns (bytes32){
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            if (contents_list[i].author() == _a && contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }

    /* returns the content with most views */
    function GetMostPopular() public view returns (bytes32){
        bytes32 most_popular = 0;
        uint32 most_views = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            if (contents_list[i].view_count() > most_views) {
                most_popular = contents_list[i].title();
                most_views = contents_list[i].view_count();
            }
        }
        return most_popular;
    }
    
    /* returns the content with highest rating for feedback category _y 
    (or highest average if y is greater than 4) */
    function GetMostRated(uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            BaseContent bc = contents_list[i];
            if (bc.nVotes() != 0) {
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
    (or highest average if y is greater than 4) with genre _g */
    function GetMostRatedByGenre(bytes32 _g, uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            BaseContent bc = contents_list[i];
            if (bc.genre() == _g && bc.nVotes() != 0) {
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
    (or highest average if y is greater than 4) with author _a */
    function GetMostRatedByAuthor(bytes32 _a, uint32 _y) public view returns (bytes32){
        bytes32 most_rated = 0;
        uint32 highest_rating = 0;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            BaseContent bc = contents_list[i];
            if (bc.author() == _a && bc.nVotes() != 0) {
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
    

    /* STATE MODIFYING FUNCTIONS */

    /* allows to set the last block seen by an account */
    function SetNotification (address _a, uint _x) external {
        notifications_to_see[_a] = _x;
    }

    /* set a list of preferences for an account */
    function SetNotifPreferences(address _u, bytes32[] memory _list) public {
        notifications_preferences[_u] = _list;
    }

    /* allows other contracts to emit events but listen only to the catalog */
    function EmitEvent(uint _eventID, address _account, bytes32 _t, uint _v) public {
        if (_eventID == 0) {
            emit min_v_reached(_account, _t, _v);
        } else if (_eventID == 1) {
            emit content_consumed(_account, _t);
        } else {
            emit rate_left(_account, _t);
        }
    }
    
    /* submits a new content _c to the catalog */
    function AddContent (BaseContent _c) external {
        BaseContent cm = _c;
        require (cm.owner() == msg.sender && cm.catalog() == catalog_address);
        contents_list.push(cm);
        position_content[cm.title()] = contents_list.length;
        emit new_publication (cm.title(), cm.author(), cm.genre(), cm.owner());
    }
    
    /* standard accounts pays to access content _t */
    function GetContent (bytes32 _t) external payable {
        require(msg.value == GetPrice(_t));
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].Authorize(msg.sender, 0);
            emit content_acquired (_t, msg.sender, msg.sender, 0);
        }
    }
    
    /* premium accounts can requests access to content _t without paying */
    function GetContentPremium (bytes32 _t) external {
        require(isPremium(msg.sender));
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].Authorize(msg.sender, premium_customers[msg.sender]);
            emit content_acquired (_t, msg.sender, msg.sender, 0);
        }
    }
    
    /* pays for granting access to a content _t to the user _u */
    function GiftContent  (bytes32 _t, address _u) external payable {
        require(msg.value == GetPrice(_t));
        uint i = position_content[_t];
        if (i != 0) {
            contents_list[i-1].Authorize(_u, 0);
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
    
    /* pay an author a multiple of v views*/
    function PayAuthor (bytes32 _t) external {
        uint i = position_content[_t];
        if (i != 0) {
            uint32 tot_views = contents_list[i-1].view_count();
            uint32 to_pay = tot_views - contents_list[i-1].views_already_payed();
            if (to_pay >= min_v) {
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
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            tot_views = tot_views + contents_list[i].view_count();
        }
        return tot_views;
    }
    
    /* the catalog can be destructed */
    function KillCatalog () external {
        require(msg.sender == owner);
        uint tot_views = GetTotalViews();
        uint money_per_view = catalog_address.balance / tot_views;
        for (uint i = 0; i < GetLengthCatalog(); i++) {
            uint proportional_money = contents_list[i].view_count() * money_per_view;
            contents_list[i].owner().transfer(proportional_money);
            emit author_payed (contents_list[i].title(), contents_list[i-1].owner(), proportional_money);
        }
        selfdestruct(catalog_address);
    }
}