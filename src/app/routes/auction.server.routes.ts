import {Express} from "express";
import {rootUrl} from "./base.routes";

import * as auctions from '../controllers/auction.server.controller';
import {loginRequired} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions')
        .get(auctions.viewAuctions)
        .post(loginRequired, auctions.addAuction);
    app.route(rootUrl + '/auctions/categories')
        .get(auctions.getCategories);
    app.route(rootUrl + '/auctions/:id')
        .get(auctions.getAuction)
        .patch(loginRequired, auctions.changeAuction)
        .delete(loginRequired, auctions.deleteAuction);
};