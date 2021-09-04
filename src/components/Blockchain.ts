import {Block} from "./Block";
import * as CryptoJS from "crypto-js";

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string): string =>
    CryptoJS.HmacSHA256(index + previousHash + timestamp + data)
        .toString();

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'genesisBlock');

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
}

const blockchain:Block[] = [genesisBlock];
