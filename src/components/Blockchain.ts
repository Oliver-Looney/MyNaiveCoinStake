import {Block} from "./Block";
import * as CryptoJS from "crypto-js";
import {broadcastLatest} from "./peer2peer";
import {hexToBinary} from "./util";

function getBlockchain() {
    return blockchain;
}

const findBlock = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash,difficulty)){
            return new Block(index,hash,previousHash,timestamp,data,difficulty,nonce);
        }
        nonce++;
    }
}

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string =>
    CryptoJS.HmacSHA256(index + previousHash + timestamp + data + difficulty + nonce)
        .toString();

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'genesisBlock', 0, 0);

function getLatestBlock() {
    return blockchain[blockchain.length - 1];
}


const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = hexToBinary(hash);
    const requiredPrefix: string = "0".repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
}

let blockchain: Block[] = [genesisBlock];

function calculateHashForBlock(blockToGetHashOf: Block) {
    return calculateHash(blockToGetHashOf.index, blockToGetHashOf.previousHash, blockToGetHashOf.timestamp, blockToGetHashOf.data, blockToGetHashOf.difficulty,blockToGetHashOf.nonce);
}

const isBlockValid = (newBlock: Block, previousBlock: Block) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log("invalid index");
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log("invalid previous hash");
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + " " + typeof calculateHashForBlock(newBlock));
        console.log("Invalid hash: " + calculateHashForBlock(newBlock) + " " + newBlock.hash);
        return false;
    }
    return isBlockStructureValid(newBlock);
}

const isBlockStructureValid = (block: Block): boolean => {
    return typeof block.index === "number"
        && typeof block.hash === "string"
        && typeof block.previousHash === "string"
        && typeof block.timestamp === "number"
        && typeof block.data === "string";
}

const isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }
    for (let i = 0; i < blockchainToValidate.length; i++) {
        if (!isBlockValid(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
}

const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");
        blockchain = newBlocks;
        broadcastLatest();
    } else {
        console.log("Received blockchain is invalid");
    }
};

const addBlockToChain = (newBlock: Block) => {
    if (isBlockValid(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        return true;
    }
    return false;
}


export {getBlockchain, getLatestBlock, isBlockStructureValid, replaceChain, addBlockToChain};
