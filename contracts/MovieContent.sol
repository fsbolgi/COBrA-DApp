pragma solidity ^0.4.19;

import "./BaseContent.sol";

contract MovieContent is BaseContent {
    
    /* VARIABLES DECLARATION */

    uint32 public movie_length; // duration of the movie in minutes
    bytes32 public g = 0x4d6f766965000000000000000000000000000000000000000000000000000000; // string "Movie"

    /* CONSTRUCTOR */

    /* inheritates the contractor from Base Content */
    constructor(Catalog _catalog, bytes32 _title, bytes32 _author, uint _price) BaseContent (_catalog, _title, _author, g, _price) public {
        movie_length = 0;
    }

    /* FUNCTIONS */

    /* utility function to understant contract class  */
    function ContentType() public view returns (bytes32) {
        return g;
    }
    
    /* allows the owner to insert an additional information */
    function SetMovieLength(uint32 _l) external byOwner {
        movie_length = _l;
    }   
}