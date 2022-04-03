import {Request, Response} from "express";
import * as auctions from '../models/auction.server.model';
import * as images from '../models/auction.images.server.model';
import Logger from "../../config/logger"
const photoDir = __dirname + "/../../../storage/images/";
import fs from "fs";
import {loginRequired} from "../middleware/auth.middleware";

const getImage = async(req: Request, res: Response): Promise<any> => {
    try {
        // Check Auction exists
        const auction = await auctions.getAuction(req.params.id);
        if (auction.length === 0) {
            res.status(404).send("Not Found - Auction does not exist");
            return;
        }
        // Check image path is not null
        if (auction[0].imagePath === null) {
            res.status(404).send("Not Found - No hero image exists");
            return
        }
        const imagePathObject = await images.getImage(parseInt(req.params.id, 10));
        const imagePathString  = photoDir + imagePathObject[0].imageFilename;
        Logger.info(imagePathString);
        fs.readFile(imagePathString, (err, data) => {
            Logger.http("reached");
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                let type = ""
                if(imagePathObject[0].imageFilename.split(".")[1] === "jpg") {
                    type = "jpeg"
                }
                if(imagePathObject[0].imageFilename.split(".")[1] === "png" || imagePathObject[0].imageFilename.split(".")[1] === "PNG") {
                    type = "png"
                }
                if (imagePathObject[0].imageFilename.split(".")[1] === "gif") {
                    type = "gif"
                }
                res.setHeader("Content-Type", "image/" + type);
                res.status(200).send(data);
            }
        });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

const postImage = async(req: Request, res: Response) : Promise<any> => {
    Logger.http("Adding image to auction");
    try {
        const photoData = req.file;
        const auction = await auctions.getAuction(req.params.id);
        // Check the auction exists
        if (auction.length === 0) {
            res.status(404).send("Not Found - Auction does not exist");
            return;
        }
        const fileName = photoDir + "test_auction_" + auction[0].auctionId + ".png";
        // Check if a fil exists
        Logger.info("REACHED");
        if (auction[0].imagePath !== null) {
            fs.writeFileSync(fileName, req.body.file);
            res.status(200).send();
        } else {
            fs.writeFileSync(fileName, req.body);
            res.status(201).send();
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

export {getImage, postImage}