import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

const getAuctions = async (query: string) : Promise<Auction[]> => {
    Logger.info("Getting auctions from the database");
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    return result;
}
export {getAuctions}