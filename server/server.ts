import * as express from "express";
import * as bodyParser from "body-parser";
import './config/config.ts';   // include the '.ts' extension
import { appRoutes } from './routes/app.routes';

const PORT = 3001;

class ExpressApp {

    public app: express.Application;

    constructor() {
        this.app = express();
        this._init();        
    }

    private _init(): void{
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        if(process.env.NODE_ENV !== 'test') {
            this.enableCrossOrigin();
          }
        this.enableCrossOrigin();
    }

    private enableCrossOrigin() {
        this.app.use((req, res, next) => {
            const origin = req.headers.origin as string;
            if(origin && typeof origin === 'string'){
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            next();
        });
    }
}

const app = new ExpressApp().app;
const host = '0.0.0.0';
const server_port = process.env.PORT || 3000;

app.use(appRoutes); // connecting routes
app.listen(server_port, () => {
   console.log(`server running on port ${host}:${port}`);
})