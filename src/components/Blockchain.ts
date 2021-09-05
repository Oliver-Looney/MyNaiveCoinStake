import {Block} from "./Block";
import * as CryptoJS from "crypto-js";
import {broadcastLatest} from "./peer2peer";
import BigNumber from "bignumber.js";

const getBlockchain = (): Block[] => blockchain;


const calculateHash = (index: number, previousHash: string, timestamp: number, data: string,
                       difficulty: number, minterBalance: number, minterAddress: string): string =>
    CryptoJS.HmacSHA256(index + previousHash + timestamp + data + difficulty + minterBalance + minterAddress)
        .toString();

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'genesisBlock', 0, 0, "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a");

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

const mintingWithoutCoinIndex = 5;


const isBlockStakingValid = (prevHash: string, address: string, timestamp: number,
                             balance: number, difficulty: number, index: number): boolean => {
    difficulty++;
    //Allow minting without coins for a few blocks
    if (index <= mintingWithoutCoinIndex) {
        balance++;
    }
    const balanceOverDifficulty = new BigNumber(2)
        .exponentiatedBy(256)
        .times(balance)
        .dividedBy(difficulty);
    const stakingHash: string = CryptoJS.SHA256(prevHash + address + timestamp);
    const decimalStakingHash = new BigNumber(stakingHash, 16);
    const difference = balanceOverDifficulty.minus(decimalStakingHash).toNumber();
    return difference >= 0;
};

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
}

let blockchain: Block[] = [genesisBlock];

function calculateHashForBlock(blockToGetHashOf: Block) {
    return calculateHash(blockToGetHashOf.index, blockToGetHashOf.previousHash, blockToGetHashOf.timestamp, blockToGetHashOf.data);
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


export {getBlockchain, getLatestBlock, isBlockStructureValid, replaceChain, addBlockToChain, generateNextBlock};
