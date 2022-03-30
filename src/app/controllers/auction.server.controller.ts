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
    let whereConditions = "";
    if(requestQuery.hasOwnProperty("q")) {
        whereConditions += " where " + "title " + "like " + "'" + "%" + requestQuery.q + "%" + "'" + "or "
            + "description " +  "like " + "'" + "%" + requestQuery.q + "%" + "'";
    }
    if(requestQuery.hasOwnProperty("categoryIds")) {
        if(whereConditions.length === 0) {
            whereConditions += " where ";
        } else {
            whereConditions += " and ";
        }
        Logger.info("length of ids" + requestQuery.categoryIds);

        for (const item of requestQuery.categoryIds.length) {
            whereConditions += "category_id = " + item + " or "
        }
        whereConditions = whereConditions.slice(0, -4);
    }
    const mainQuery = "select * from auction" + whereConditions;
    Logger.info(mainQuery);
    return mainQuery;
};

export {viewAuctions, addAuction, getAuction, changeAuction, deleteAuction, getAuctionCategories}