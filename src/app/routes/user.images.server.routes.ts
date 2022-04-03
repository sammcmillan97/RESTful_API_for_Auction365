import {Express} from "express";
import {rootUrl} from "./base.routes";

import * as images from '../controllers/user.images.server.controller';
import {loginRequired} from "../middleware/auth.middleware";


module.exports = (app: Express) => {
    app.route(rootUrl + '/users/:id/image')
        .get(images.getImage)
        .put(images.postImage)
        .delete(loginRequired, images.removeImage);
};