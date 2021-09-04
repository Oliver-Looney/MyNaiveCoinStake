import * as WebSocket from 'ws';
import {Server} from 'ws';
import {Block, getBlockchain, getLatestBlock, isBlockStructureValid, replaceChain} from './blockchain';
import bodyParser = require("body-parser");
import {write} from "fs";

const sockets: WebSocket[] = [];

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

class Message {
    public type: MessageType;
    public data: any;
}

const getSockets = () => sockets;

const initConnection = (ws: WebSocket) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on ' + p2pPort);
};

const JSONToObject = <T>(data:string):T=>{
    try{
        return JSON.parse(data);
    } catch (e){
        console.log(e);
        return null;
    }
};

