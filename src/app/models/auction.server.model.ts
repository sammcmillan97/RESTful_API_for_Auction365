import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";


const getAuctions = async (query: string) : Promise<Auction[]> => {
    Logger.info("Getting auctions from the database");
    Logger.info(query);
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    conn.release();
    return result;
}

const getAuction = async (id: string) : Promise<Auction[]> => {
    Logger.info("Getting auction from the database");
    const conn = await getPool().getConnection();
    const query = "select auction.id as auctionId, title, reserve, user.id as sellerId, category_id as categoryId, user.first_name as sellerFirstName," +
        "user.last_name as sellerLastName, end_date as endDate, auction.description as description, count(auction_id) as numBids, " +
        "max(amount) as highestBid from auction left join auction_bid  on (auction.id = auction_bid.auction_id) join user on (auction.seller_id = user.id)"
        + " where auction.id = ? group by auction.id"
    const [result] = await conn.query(query, id);
    conn.release();
    return result;
}

const insert = async (title: string, description: string, categoryId: string, endDate: string, reserve: string, sellerId: number) : Promise<ResultSetHeader> => {
    Logger.info('Adding auction to the database');
    const conn = await getPool().getConnection();
    const query = 'insert into auction (title, description, category_id, end_date, reserve, seller_id) values (?, ?, ?, ?, ?, ?)'
    const [ result ] = await conn.query( query, [title, description, categoryId, endDate, reserve, sellerId] );
    conn.release();
    return result
};

const alter = async (query: string) : Promise<ResultSetHeader> => {
    Logger.info('Altering auction in the database');
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    conn.release();
    return result
};

const deleteAuction = async (id: string) : Promise<ResultSetHeader> => {
    Logger.info('Deleting auction from the database')
    const conn = await getPool().getConnection();
    const query = "delete from auction where id = ?";
    const [ result ] = await conn.query(query, id);
    return result;
}

export {getAuctions, getAuction, insert, alter, deleteAuction}