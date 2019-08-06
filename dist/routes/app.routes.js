"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const express_1 = require("express");
const user_routes_1 = require("./user/user.routes");
const items_routes_1 = require("./items/items.routes");
const languages_manager_1 = require("../util/languages/languages-manager");
const request_handler_1 = require("../util/jdoodle-request-handler/request-handler");
class AppRoutes {
    constructor() {
        this.routes = express_1.Router();
        this._init();
    }
    _init() {
        // connecting all sub routes
        this.routes.use('/user', user_routes_1.userRoutes);
        this.routes.use('/items', items_routes_1.itemsRoutes);
        this.routes
            .get('/langs', (req, res) => {
            console.log('GET: \'/langs\'');
            let langs = languages_manager_1.LanguagesManager.getLanguagesTable();
            return res.status(200).send({ langs });
        })
            .post('/run', (req, res) => {
            console.log('POST: \'/run\'');
            console.log(req.body);
            //              return res.status(200).send({
            //                  "runResult": {
            //                      "output": "hello\n",
            //                      "statusCode": 200,
            //                      "memory": "28376",
            //                      "cpuTime": "0.08"
            //                  }
            //              })
            const body = _.pick(req.body, ['lang', 'version', 'program']);
            if (!this.validatePostRun(body)) {
                console.log('invalid body parameters');
                return res.status(400).send('invalid body parameters');
            }
            try {
                const index = languages_manager_1.LanguagesManager.getLanguageVersionIndex(body.lang, body.version);
                request_handler_1.RequestHandler.postRunRequest(body.lang, index, body.program)
                    // request error
                    .on('error', (error) => {
                    console.log({ msg: 'postRunRequest on error', params: error });
                    return res.status(400).send(error);
                })
                    .on('jdoodle-error', (error) => {
                    console.log({ msg: 'postRunRequest on jdoodle-error', params: error });
                    return res.status(400).send(error);
                })
                    .on('jdoodle-success', (result) => {
                    console.log({ msg: 'postRunRequest on jdoodle-success', params: result });
                    return res.status(200).send({ runResult: result });
                });
            }
            catch (error) {
                console.log('request fail');
                return res.status(400).send('request fail');
            }
        });
    }
    validatePostRun(reqBody) {
        return !_.some(reqBody, (value) => _.isNil(value)) // all reqBody properties != undifined & null 
            && _.isString(reqBody.lang)
            && _.isString(reqBody.version)
            && _.isString(reqBody.program)
            && !_.isEqual(reqBody.program, '') // is program not empty string
            && languages_manager_1.LanguagesManager.isLangSupported(reqBody.lang, reqBody.version); // are lang & version supported            
    }
}
const appRoutes = new AppRoutes().routes;
exports.appRoutes = appRoutes;
//# sourceMappingURL=app.routes.js.map