pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract PhotoContent is BaseContent {
    
    uint32 public n_pixel; 
    bytes32 public g = 0x50686f746f000000000000000000000000000000000000000000000000000000;

    
    constructor (address _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        n_pixel = 0;
    }
    
    function setNPixel (uint32 _n) external byOwner {
        n_pixel = _n;
    }
    
}