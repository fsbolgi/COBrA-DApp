pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract SongContent is BaseContent {
    
    uint32 public track_length; 
    bytes32 public g = 0x536f6e6700000000000000000000000000000000000000000000000000000000;


    constructor (address _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        track_length = 0;
    }
    
    function SetTrackLength (uint32 _l) external byOwner {
        track_length = _l;
    }
    
    function ContentType() public view returns (bytes32) {
        return g;
    }
}