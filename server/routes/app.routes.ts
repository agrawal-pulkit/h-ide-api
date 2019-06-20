
import * as _ from 'lodash';
import * as request from 'request';

import { Router } from 'express';
import { userRoutes } from './user/user.routes';
import { itemsRoutes } from './items/items.routes';
import { LanguagesManager } from '../util/languages/languages-manager'
import { RequestHandler } from '../util/jdoodle-request-handler/request-handler'

type ClientRunRequestBody = {   // your client request scheme
    lang: string,
    version: string,
    program: string,
 }
 type JdoodleResponseBody = {   // Jdoodle response body scheme
    output: string,
    statusCode: number,
    memory: string,
    cpuTime: string
 }

class AppRoutes {
    public routes: Router;

    constructor() {
        this.routes = Router();
        this._init();
    }

    private _init() {
        // connecting all sub routes
        this.routes.use('/user', userRoutes);
        this.routes.use('/items', itemsRoutes);
        this.routes
            .get('/langs', (req, res) => {
                console.log('GET: \'/langs\'');
                let langs = LanguagesManager.getLanguagesTable();
                return res.status(200).send({ langs });
            })

            .post('/run', (req, res) => {
                console.log('POST: \'/run\'');
                console.log(req.body)
                // return res.status(200).send({
                //     "runResult": {
                //         "output": "hello\n",
                //         "statusCode": 200,
                //         "memory": "28376",
                //         "cpuTime": "0.08"
                //     }
                // })
                const body = _.pick(req.body, ['lang', 'version','program']) as ClientRunRequestBody;  
                if(!this.validatePostRun(body)) {
                    console.log('invalid body parameters');
                    return res.status(400).send('invalid body parameters');
                }
            
                try {
                    const index = LanguagesManager.getLanguageVersionIndex(body.lang, body.version)
                    RequestHandler.postRunRequest(body.lang, index, body.program)
                        // request error
                        .on('error', (error) => { 
                            console.log({msg: 'postRunRequest on error', params: error});
                            return res.status(400).send(error);  
                        })
                        .on('jdoodle-error', (error) => {
                            console.log({msg: 'postRunRequest on jdoodle-error', params: error});
                            return res.status(400).send(error);  
                        })
                        .on('jdoodle-success', (result: JdoodleResponseBody) => {
                            console.log({msg: 'postRunRequest on jdoodle-success', params: result});
                            return res.status(200).send({runResult: result});
                        })               
                } catch (error) {
                    console.log('request fail');
                    return res.status(400).send('request fail');
                }          
            })
    }

    private validatePostRun(reqBody: ClientRunRequestBody): boolean {
        return !_.some(reqBody, (value) => _.isNil(value)) // all reqBody properties != undifined & null 
            && _.isString(reqBody.lang) 
            && _.isString(reqBody.version) 
            && _.isString(reqBody.program) 
            && !_.isEqual(reqBody.program, '') // is program not empty string
            && LanguagesManager.isLangSupported(reqBody.lang, reqBody.version); // are lang & version supported            
    }
}

const appRoutes = new AppRoutes().routes;
export { appRoutes } 