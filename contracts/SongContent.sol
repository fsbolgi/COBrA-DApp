pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract SongContent is BaseContent {

    /* VARIABLES DECLARATION */
    
    uint32 public track_length; // duration of the song in seconds
    bytes32 public g = 0x536f6e6700000000000000000000000000000000000000000000000000000000; // string "Song"

    /* CONSTRUCTOR */

    /* inheritates the contractor from Base Content */
    constructor(Catalog _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        track_length = 0;
    }
    /* FUNCTIONS */

    /* utility function to understant contract class  */
    function ContentType() public view returns (bytes32) {
        return g;
    }

    /* allows the owner to insert an additional information */
    function SetTrackLength(uint32 _l) external byOwner {
        track_length = _l;
    }   
}