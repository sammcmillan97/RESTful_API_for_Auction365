import {Express} from "express";
import {rootUrl} from "./base.routes";

import * as bids from '../controllers/bids.server.controller';
import {loginRequired} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions/:id/bids')
        .get(bids.getBids)
        .post(loginRequired, bids.placeBid);
};