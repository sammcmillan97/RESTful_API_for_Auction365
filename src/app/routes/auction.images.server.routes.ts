import {Express} from "express";
import {rootUrl} from "./base.routes";

import * as images from '../controllers/auction.images.server.controller'
import {loginRequired} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions/:id/image')
        .get(images.getImage)
        .put(images.postImage);
};