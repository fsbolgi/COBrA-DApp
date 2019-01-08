pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract MovieContent is BaseContent {
    
    uint32 public movie_length;
    bytes32 public g = 0x4d6f766965000000000000000000000000000000000000000000000000000000;

    constructor (address _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        movie_length = 0;
    }
    
    function SetMovieLength (uint32 _l) external byOwner {
        movie_length = _l;
    }

    function ContentType() public view returns (bytes32) {
        return g;
    }
    
}