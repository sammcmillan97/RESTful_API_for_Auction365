import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

const getAll = async(id: string) : Promise<Bid[]> => {
    Logger.info("Getting all bids on auction(" + id + ") from the database");
    const conn = await getPool().getConnection();
    const query = "select user.id as bidderID, amount, user.first_name as firstName, user.last_name as lastName, timestamp " +
        "from auction_bid left join user on (auction_bid.user_id = user.id) where auction_id = ? order by amount desc";
    const [result] = await conn.query(query, id);
    conn.release();
    return result;
}

const insert = async(auctionId: number, userId: number, amount: number)  => {
    Logger.info("Placing bid on auction(" + auctionId + ") from the database)");
    const conn = await getPool().getConnection();
    Logger.info(auctionId);
    Logger.info(userId);
    Logger.info(amount);
    const query = "insert into auction_bid (auction_id, user_id, amount) values (?, ?, ?)";
    await conn.query(query, [auctionId, userId, amount]);
    conn.release();
}

export{getAll, insert}