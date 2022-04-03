import {Request, Response} from "express";
import * as auctions from '../models/auction.server.model';
import * as images from '../models/auction.images.server.model';
import Logger from "../../config/logger"
const photoFolder = __dirname + "/../../../storage/images/";
import fs from "fs";
import * as auth from "../middleware/auth.middleware";

const getImage = async(req: Request, res: Response): Promise<any> => {
    try {
        // Check Auction exists
        const auction = await auctions.getAuction(req.params.id);
        if (auction.length === 0) {
            res.status(404).send("Not Found - Auction does not exist");
            return;
        }
        const imagePathObject = await images.getImage(parseInt(req.params.id, 10));
        // Check image path != null
        if(imagePathObject[0].imageFilename === null) {
            res.status(404).send("Not Found - Auction does not have image");
            return;
        }
        const imagePathString  = photoFolder + imagePathObject[0].imageFilename;
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
        const token =  req.header('X-Authorization');
        const type = req.header('Content-Type');
        const user = await auth.findUserIdByToken(token);
        const auction = await auctions.getAuction(req.params.id);
        const imagePathObject = await images.getImage(parseInt(req.params.id, 10));
        // Check the user is logged in
        if (user.length === 0) {
            res.status(401).send("Unauthorized");
            return;
        }
        // Check auction exists
        if (auction.length === 0) {
            res.status(404).send("Not Found - Auction not found");
            return;
        }
        // Check that the correct user is logged in
        if (user[0].id.toString() !== auction[0].sellerId.toString()) {
            res.status(403).send("Forbidden - Can only post images to your own auctions");
            return;
        }
        if (type === "image/png" || type === "image/jpeg" || type === "image/gif") {
            // Check image was attached
            if (Buffer.isBuffer(req.body)) {
                let filename = "test_auction_" + auction[0].auctionId;
                if (type ==="image/png") {
                    filename += ".png";
                }
                if (type === "image/jpeg") {
                    filename += ".jpg";
                }
                if (type === "image/gif") {
                    filename += ".gif";
                }
                await images.setImage(filename, auction[0].auctionId);
                const filepath = photoFolder + filename;
                Logger.info(filepath);
                fs.writeFile(filepath, req.body, err => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    } else {
                        if (imagePathObject[0].imageFilename === null) {
                            res.status(201).send();
                            return;
                        } else {
                            res.status(200).send();
                            return;
                        }
                    }
                });
            } else {
                res.status(400).send("Bad Request - image is not attached");
                return
            }
        } else {
            res.status(400).send("Bad Request - Must be of type png, jpeg or gif");
            return;
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

export {getImage, postImage}