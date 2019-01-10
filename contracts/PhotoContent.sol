pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract PhotoContent is BaseContent {

    /* VARIABLES DECLARATION */

    uint32 public n_pixel; // number of pixels of the larger side
    bytes32 public g = 0x50686f746f000000000000000000000000000000000000000000000000000000; // string "Photo"

    /* CONSTRUCTOR */

    /* inheritates the contractor from Base Content */
    constructor(Catalog _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        n_pixel = 0;
    }

    /* FUNCTIONS */

    /* utility function to understant contract class  */
    function ContentType() public view returns (bytes32) {
        return g;
    }
    
    /* allows the owner to insert an additional information */
    function SetNPixel(uint32 _n) external byOwner {
        n_pixel = _n;
    }
}