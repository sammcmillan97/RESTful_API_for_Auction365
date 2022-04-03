import express from "express";
import bodyParser from "body-parser"
import allowCrossOriginRequestsMiddleware from '../app/middleware/cors.middleware';
import Logger from "./logger";



export default () => {
    const app = express();
    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    app.use(bodyParser.raw({type: 'text/plain' }));
    app.use(bodyParser.raw({ type: [ 'image/jpeg', 'image/gif', 'image/png'], limit: '20mb'}));

    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        Logger.http(`##### ${req.method} ${req.path} #####`);
        next();
    });

    app.get('/', (req, res) =>{
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/user.server.routes')(app);
    require('../app/routes/auction.server.routes')(app);
    require('../app/routes/bids.server.routes')(app);
    require('../app/routes/auction.images.server.routes')(app);
    require('../app/routes/user.images.server.routes')(app);
    return app;
};
