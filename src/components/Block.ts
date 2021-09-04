class Block {
    public index: string;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;


    constructor(index: string, hash: string, previousHash: string, timestamp: number, data: string) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}
