import {Request, Response} from "express";
import * as auctions from '../models/auction.server.model';
import * as auth from '../middleware/auth.middleware';
import Logger from "../../config/logger"

const viewAuctions = async (req: Request, res: Response): Promise<any> => {
    Logger.http("Getting Auction(s) from the database")
    // Check categories
    try {
        const query = buildGetAuctionQuery(req.query);
        const result = await auctions.getAuctions(query);
        Logger.info(result[0]);
        Logger.info(result.length);
        res.status(200).send();
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }

};

const addAuction = async (req: Request, res: Response):Promise<void> => {
    return null;
};

const getAuction = async (req: Request, res: Response):Promise<void> => {
    return null;
};

const changeAuction = async (req: Request, res: Response):Promise<void> => {
    return null;
};

const deleteAuction = async (req: Request, res: Response):Promise<void> => {
    return null;
};

const getAuctionCategories = async (req: Request, res: Response):Promise<void> => {
    return null;
};

// Helper Function

// Query Builder

const buildGetAuctionQuery = (requestQuery: any) : string => {
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
        const arrayCatId = requestQuery.categoryIds.toString().split(",");
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
        whereConditions += "sellerId = " + requestQuery.sellerId + ")";
    }
    if (requestQuery.hasOwnProperty("bidderId")) {
        if(whereConditions.length === 0) {
            whereConditions += " where (";
        } else {
            whereConditions += " and (";
        }
        whereConditions += "sellerId = " + requestQuery.bidderId + ")";
    }
    // Sorting conditions
    let sortCondition = "order by"
    if (requestQuery.hasOwnProperty("sortBy")) {
        if(requestQuery.sortBy === "ALPHABETICAL_ASC") {
            sortCondition += " title asc";
        }
        if(requestQuery.sortBy === "ALPHABETICAL_DESC") {
            sortCondition += " title desc";
        }
        if(requestQuery.sortBy === "CLOSING_SOON") {
            sortCondition += " end_date desc";
        }
        if(requestQuery.sortBy === "CLOSING_LAST") {
            sortCondition += " end_date asc";
        }
        if(requestQuery.sortBy === "RESERVE_ASC") {
            sortCondition += " reserve asc";
        }
        if(requestQuery.sortBy === "RESERVE_DESC") {
            sortCondition += " reserve desc"
        }
    } else {
        sortCondition += " end_date desc";
    }
    const mainQuery = "select * from auction" + whereConditions;
    Logger.info(mainQuery);
    return mainQuery;
};

export {viewAuctions, addAuction, getAuction, changeAuction, deleteAuction, getAuctionCategories}