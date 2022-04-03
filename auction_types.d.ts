type Auction = {
    /**
     * Auction ID
     */
    auctionId: number;
    /**
     * Auction Title
     */
    title: string;
    /**
     * Auction category ID
     */
    categoryId: number;
    /**
     * Auction seller ID
     */
    sellerId: number;
    /**
     * Sellers first Name
     */
    sellerFirstName: string;
    /**
     * sellers last Name
     */
    sellerLastName: string;
    /**
     * Reserve of Auction
     */
    reverse: number;
    /**
     * Number of bids on auction
     */
    numBids: number;
    /**
     * Highest Auction Bid
     */
    highestBid: number;
    /**
     * Auction end date
     */
    end_date: Date;
    /**
     * Auction description
     */
    description: string;
}