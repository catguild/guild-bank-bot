import {Character} from "../models/character";
import {Account} from "../models/account";
import {createHttpClient} from "./http-client";
import {AxiosInstance} from "axios";
import {ItemWithQuantity} from "../models/item";
//import * as fs from "fs";

export class ApiRequest {
    public forAccount(account: Account) {
        return new AccountRequest(account);
    }

    public withToken(token: string) {
        return new TokenRequest(token);
    }
}

export class TokenRequest {
    constructor(private token: string) {
    }

    public getGuildId(): Promise<string> {
        return createHttpClient(this.token).get("/guild/GetGuilds").then((result) => {
            return result.data[0].id;
        })
    }
}

export class AccountRequest {

    private httpClient: AxiosInstance;

    constructor(private account: Account) {
        this.httpClient = createHttpClient(account.apiToken);
    }

    public async getItems(): Promise<ItemWithQuantity[][]> {
        const characters = await this.getCharacters();
        const associations = this.getAltMainAssociations();
        const itemsDictionary: { [id: string]: [ItemWithQuantity] } = {};

        characters.forEach(c => {
            c.bags.forEach(b => {
                b.bagSlots.forEach(bs => {
                    const name = (
                        associations.has(c.name.toLowerCase()) ?
                        c.name + " (" + associations.get(c.name.toLowerCase()) + ")" : c.name
                    );
                    if (!itemsDictionary[bs.item.id]) {
                        itemsDictionary[bs.item.id] = [{...bs.item, quantity: bs.quantity, characters: name}]; //must start with an item
                    } else {
                        let characterFound = false;
                        itemsDictionary[bs.item.id].forEach(c => {
                            if(c.characters.toLowerCase() === name.toLowerCase()) {
                                c.quantity += bs.quantity;
                                characterFound = true;
                            }
                        });
                        if(!characterFound) itemsDictionary[bs.item.id].push({...bs.item, quantity: bs.quantity, characters: name});
                        
                    }
                });
            });
        });
        let i = 0;
        for (let key in itemsDictionary) {
            console.log(itemsDictionary[key]);
            if(i>6) break;
            i++;
        }

        return Object.keys(itemsDictionary)
            .map(r => itemsDictionary[r])
            .sort((a, b) => a[0].name.toLowerCase().localeCompare(b[0].name.toLowerCase()));
    }

    public getCharacters(): Promise<Character[]> {
        if (this.account.isPublic) {
            return this.getPublicCharacters();
        }
        return this.getPrivateCharacters();
    }

    private async getPrivateCharacters(): Promise<Character[]> {
        const content = await this.httpClient.get(`/guild/GetCharacters/${this.account.classicGuildBankId}`);
        return content.data;
    }

    private async getPublicCharacters(): Promise<Character[]> {
        let content = await this.httpClient.get(`/guild/GetFromReadonlyToken/${this.account.classicGuildBankId}`);
        return content.data.characters;
    }

    private getAltMainAssociations() {
        //const contents = fs.readFileSync("doc/alt_main_associations.txt").split('\n');
        const contents = "nightfur:Arala\nnightscale:Arala\nnightraid:Khendi\nslimecat:Palumyn/Erishne\nnightthyme:Dzeidzei\nspuffy:Arala\nsyen:Arala\nnightstone:Larm".split('\n');
        let associations = new Map();
        contents.forEach(a => {
            const pair = a.split(":");
            associations.set(pair[0].toLowerCase(), pair[1]);
        });
        return associations;
    }

    public async postImportString(importString: string): Promise<any> {
        const result = await this.httpClient.post(`/guild/UploadImportString/${this.account.classicGuildBankId}`, { EncodedImportString : importString});
        return result;
    }
}
