pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract SongContent is BaseContent {
    
    uint32 public track_length; 
    bytes32 public g = 0x536f6e6700000000000000000000000000000000000000000000000000000000;


    constructor (address _catalog, bytes32 _title, bytes32 _author, uint32 _price) BaseContent (_catalog, _title, _author, g, _price) public {
        track_length = 0;
    }
    
    function setTrackLength (uint32 _l) external byOwner {
        track_length = _l;
    }
    
}