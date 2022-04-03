import {Request, Response} from "express";
import * as auctions from '../models/auction.server.model';
import * as category from '../models/category.server.model';
import Logger from "../../config/logger"

const viewAuctions = async (req: Request, res: Response): Promise<any> => {
    Logger.http("Getting Auction(s) from the database")
    // Check categories
    try {
        if(req.query.hasOwnProperty("categoryIds")) {
            if(!await checkCatIds(req.query)) {
                res.status(400).send("Category ID(s) in request query are not in database")
                return
            }
        }
        const query = buildGetAuctionsQuery(req.query);
        let result = await auctions.getAuctions(query);
        const lengthOfResult = result.length;
        // Skip to start index
        if(req.query.hasOwnProperty("startIndex")) {
            const startIndex = Number(req.query.startIndex);
            result = result.slice(startIndex);
        }
        // Display the count
        if(req.query.hasOwnProperty("count")) {
            Logger.info("Reached")
            const count = Number(req.query.count);
            result = result.slice(0, count);
        }
        res.status(200).send({"auctions":result, "count": lengthOfResult});
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const addAuction = async (req: Request, res: Response):Promise<void> => {
    Logger.http("Adding new auction to the database");
    try {
        // Check category ID
        if(req.query.hasOwnProperty("categoryIds")) {
            if(!await checkCatIds(req.query)) {
                res.status(400).send("Category ID(s) in request query are not in database")
                return
            }
        }
        // Check required params are there
        if(!req.body.hasOwnProperty("title") && !req.body.hasOwnProperty("description") && !req.body.hasOwnProperty("endDate")
        && !req.body.hasOwnProperty("categoryId")) {
            res.status(400).send("Bad Request - Missing params from request body");
        }
        // Check auction end date is in the future
        const today = new Date();
        const dateTime = today.getFullYear() +'-'+(today.getMonth()+1)+'-'+today.getDate()
            + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const auctionDateTime = new Date(req.body.endDate);
        const currentDateTime = new Date(dateTime);
        if(auctionDateTime < currentDateTime) {
            res.status(400).send("Bad Request - Auction end date must be in the future");
        }
        if(!req.body.hasOwnProperty("reserve")) {
            req.body.reserve = 1;
        }
        const result = await auctions.insert(req.body.title, req.body.description, req.body.categoryId, req.body.endDate, req.body.reserve, req.body.authenticatedUser.id);
        res.status(201).send({"auctionID": result.insertId});
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const getAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        const result = await auctions.getAuction(req.params.id);
        if(result.length === 0){
            res.status(404).send("Not Found - No auction matching that ID is in the database");
            return
        } else {
            res.status(200).send(result[0]);
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const changeAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        const auction = await auctions.getAuction(req.params.id);
        // Check if auction exists
        if(auction.length === 0){
            res.status(404).send("Not Found - Auction does not exist");
            return
        }
        // Check if the current user is the correct user
        const sellerId = auction[0].sellerId;
        if(req.body.authenticatedUser.id.toString() === sellerId.toString()) {
            // Check category
            if(req.body.hasOwnProperty("categoryId")) {
                const result = await category.checkCat("select * from category where (id = " + req.body.categoryId + ")");
                if(result.length === 0) {
                    res.status(400).send("Category ID in request body is not in database")
                    return
                }
            }
            Logger.info("After cat id")
            // Check if a bid has been made
            if(auction[0].numBids !== 0) {
                res.status(403).send("Forbidden - can't make change to an auction after a bid has been placed");
                return
            } else {
                const query = buildEditAuctionQuery(req.body, req.params.id);
                const result = auctions.alter(query);
                res.status(200).send();
            }
        } else {
            res.status(403).send("Forbidden - You can only edit your own auctions");
        }
            } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const deleteAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        const auction = await auctions.getAuction(req.params.id);
        // Check if auction exists
        if (auction.length === 0) {
            res.status(404).send("Not Found - Auction does not exist");
            return
        }
        // Check if the current user is the correct user
        const sellerId = auction[0].sellerId;
        if (req.body.authenticatedUser.id.toString() === sellerId.toString()) {
            // Check if a bid has been made
            if (auction[0].numBids !== 0) {
                res.status(403).send("Forbidden - can't delete an auction after a bid has been placed");
                return
            } else {
                const result = auctions.deleteAuction(req.params.id);
                res.status(200).send();
            }
        } else {
            res.status(403).send("Forbidden - You can only delete your own auctions");
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const getCategories = async (req: Request, res: Response):Promise<void> => {
    try {
        const result = await category.getAll();
        Logger.info("reached");
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

// Helper Function

// Check category IDs

const checkCatIds = async (requestQuery: any) : Promise<boolean> => {
    const arrayCatId = requestQuery.categoryIds.toString().split(",")
    for (const item of arrayCatId) {
        const query = "select * from category where (id = " + item + ")";
        const result = await category.checkCat(query);
        if(result.length !== 1) {
            return false;
        }
    }
    return true;
}

// Query Builder


const buildGetAuctionsQuery = (requestQuery: any) : string => {
    // Where conditions
    let whereConditions = "";
    // String matching with title and description
    if(requestQuery.hasOwnProperty("q")) {
        whereConditions += " where (" + "title " + "like " + "'" + "%" + requestQuery.q + "%" + "'" + " or "
            + "description " +  "like " + "'" + "%" + requestQuery.q + "%" + "')";
    }
    // Category Ids
    if(requestQuery.hasOwnProperty("categoryIds")) {
        if(whereConditions.length === 0) {
            whereConditions += " where (";
        } else {
            whereConditions += " and (";
        }
        const arrayCatId = requestQuery.categoryIds.toString().split(",")
        for (const item of arrayCatId) {
            whereConditions += "category_id = " + item + " or "
        }
        whereConditions = whereConditions.slice(0, -4);
        whereConditions += ")";
    }
    // seller ID
    if (requestQuery.hasOwnProperty("sellerId")) {
        if(whereConditions.length === 0) {
            whereConditions += " where (";
        } else {
            whereConditions += " and (";
        }
        whereConditions += "seller_id = " + requestQuery.sellerId + ")";
    }
    if (requestQuery.hasOwnProperty("bidderId")) {
        if(whereConditions.length === 0) {
            whereConditions += " where (";
        } else {
            whereConditions += " and (";
        }
        whereConditions += "auction_bid.user_id = " + requestQuery.bidderId + ")";
    }
    // Sorting conditions
    let sortCondition = " order by"
    if (requestQuery.hasOwnProperty("sortBy")) {
        if(requestQuery.sortBy === "ALPHABETICAL_ASC") {
            sortCondition += " title asc";
        }
        if(requestQuery.sortBy === "ALPHABETICAL_DESC") {
            sortCondition += " title desc";
        }
        if(requestQuery.sortBy === "CLOSING_SOON") {
            sortCondition += " end_date asc";
        }
        if(requestQuery.sortBy === "CLOSING_LAST") {
            sortCondition += " end_date desc";
        }
        if(requestQuery.sortBy === "RESERVE_ASC") {
            sortCondition += " reserve asc";
        }
        if(requestQuery.sortBy === "RESERVE_DESC") {
            sortCondition += " reserve desc"
        }
    } else {
        sortCondition += " end_date asc";
    }
    return "select auction.id as auctionId, title, reserve, user.id as sellerId, category_id as categoryId, user.first_name as sellerFirstName," +
        "user.last_name as sellerLastName, end_date as endDate, count(auction_id) as numBids, " +
        "max(amount) as highestBid from auction left join auction_bid  on (auction.id = auction_bid.auction_id) join user on (auction.seller_id = user.id)"
        + whereConditions + " group by auction.id " + sortCondition;
};

// BuildEditAuctionQuery

const buildEditAuctionQuery = (requestBody: any, id: string) : string => {
    let query = "update auction set";
    if(requestBody.hasOwnProperty("title")) {
        query += " title = " + "'" + requestBody.title + "'" +", ";
    }
    if(requestBody.hasOwnProperty("description")) {
        query += " description = " + "'" + requestBody.description + "'" + ", ";
    }
    if(requestBody.hasOwnProperty("categoryId")) {
        query += " category_id = " + requestBody.categoryId + ", ";
    }
    if(requestBody.hasOwnProperty("endDate")) {
        query += " end_date = " + "'" + requestBody.endDate + "'" + ", ";
    }
    if(requestBody.hasOwnProperty("reserve")) {
        query += "reserve = " + requestBody.reserve + ", ";
    }
    query = query.slice(0, -2);
    query += " where id = " + id;
    return query;
}


export {viewAuctions, addAuction, getAuction, changeAuction, deleteAuction, getCategories}