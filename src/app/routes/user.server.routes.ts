import {Express} from "express";
import {rootUrl} from "./base.routes";

import * as users from '../controllers/user.server.controller';
import {loginRequired} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl + '/users/register' )
        .post(users.register );
    app.route(rootUrl + '/users/login' )
        .post(users.login);
    app.route(rootUrl + '/users/logout' )
        .post(loginRequired, users.logout );
    app.route(rootUrl + '/users/:id' )
        .get(loginRequired, users.retrieve )
        .patch(loginRequired, users.update );
};