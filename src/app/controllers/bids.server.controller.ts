import {Request, Response} from "express";
import * as bids from '../models/bids.server.model';
import * as auctions from '../models/auction.server.model';
import Logger from "../../config/logger"

const getBids = async (req: Request, res: Response):Promise<void> => {
    Logger.http("Getting on bids")
    try {
        // Check auction exists
        const auction = await auctions.getAuction(req.params.id);
        if (auction.length === 0) {
            res.status(404).send("Bad Request - Auction " + req.params.id + " not found");
            return
        }
        const listOfBids = await bids.getAll(req.params.id);
        res.status(200).send(listOfBids);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const placeBid = async (req: Request, res: Response):Promise<void> => {
    Logger.http("Placing bid")
    try {
        // Check Auction exists
        Logger.info(req.params.id);
        const auction = await auctions.getAuction(req.params.id);
        if(auction.length === 0) {
            res.status(404).send("Not Found - Auction does not exist")
            return
        }
        // Check amount is higher than current bid
        if(auction[0].highestBid > parseInt(req.body.amount, 10)) {
            res.status(400).send("Bad Request - Amount must be higher than the current highest bid");
            return
        }
        // Check the current user isn't the seller
        if(auction[0].sellerId.toString() === req.body.authenticatedUser.id) {
            res.status(403).send("Forbidden - Can't bid on own auction");
            return
        }
        // Create Bid
        await bids.insert(parseInt(req.params.id, 10), parseInt(req.body.authenticatedUser.id,10), parseInt(req.body.amount,10));
        res.status(201).send("Created");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

export {getBids, placeBid}