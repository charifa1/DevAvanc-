import {readFile, writeFile} from 'node:fs/promises'
import {getDate, monSecret} from "./divers.js";
import {NotFoundError} from "./errors.js";
import {createHash} from 'node:crypto'
import { v4 as uuidv4 } from 'uuid';

/* Chemin de stockage des blocks */
const path = './data/blockchain.json'

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */
export async function findBlocks() {
    return readFile(path, 'utf-8')
        .then((data) => {
            return JSON.parse(data);
        })
        .catch((err) => {
            console.error(err);
            throw err;
        }
    );
}

/**
 * Trouve un block à partir de son id
 * @param partialBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(partialBlock) {
    const existingBlocks = await findBlocks();
    const block = existingBlocks.find((b) => b.id === partialBlock.id);
    if (block) {
        return block;
    } else {
        throw new NotFoundError();
    }
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    try {
        const existingBlocks = await findBlocks();
        if (!Array.isArray(existingBlocks) || existingBlocks.length === 0) {
            return null;
        }
        return existingBlocks[existingBlocks.length - 1];
    } catch (err) {
        console.error(err.message);
        throw err;
    }

}
    /**
     * Creation d'un block depuis le contenu json
     * @param contenu
     * @return {Promise<Block[]>}
     */
export async function createBlock(contenu) {
        try {
            const id = uuidv4();
            const date = getDate();
            const newBlock = {
                id,
                nom: contenu.nom,
                don: contenu.don,
                date,
                hash: " "
            };

            let existingBlocks = await findBlocks();
            if (!Array.isArray(existingBlocks)) {
                existingBlocks = [];
            }
            existingBlocks.push(newBlock);
            const lastBlock = await findLastBlock();
            if (lastBlock) {
                const hash = createHash('sha256').update(JSON.stringify(lastBlock)).digest('hex');
                newBlock.hash = hash;
            }

            await writeFile(path, JSON.stringify(existingBlocks, null, 2), 'utf8');

            return existingBlocks;
        } catch (err) {
            console.error(err.message);
            throw err;
        }

}


