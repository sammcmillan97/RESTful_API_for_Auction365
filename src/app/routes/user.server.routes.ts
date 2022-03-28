import {Express} from "express";
import * as users from '../controllers/user.server.controller';
import {rootUrl} from "./base.routes";

module.exports = (app: Express) => {
    app.route(rootUrl + '/users/register' )
        .post(users.register );
    app.route(rootUrl + '/users/login' )
        .post(users.login );
    app.route(rootUrl + '/users/logout' )
        .post(users.logout );
    app.route(rootUrl + '/users/:id' )
        .get(users.retrieve )
        .patch(users.update );
};