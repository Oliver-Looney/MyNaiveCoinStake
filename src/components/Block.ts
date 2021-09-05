class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;
    public difficulty: number;
    public minterBalance: number;
    public minterAddress: string;


    constructor(index: number, hash: string, previousHash: string,
                timestamp: number, data: string, difficulty: number,
                 minterBalance: number, minterAddress: string) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.minterBalance = minterBalance;
        this.minterAddress = minterAddress;
    }
}

export {Block}
