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

    public async getItems(): Promise<ItemWithQuantity[]> {
        const characters = await this.getCharacters();
        const associations = this.getAltMainAssociations();
        console.log(associations);
        const itemsDictionary: { [id: string]: ItemWithQuantity } = {};

        characters.forEach(c => {
            c.bags.forEach(b => {
                b.bagSlots.forEach(bs => {
                    const name = (
                        associations.hasOwnProperty(c.name) ?
                        c.name + " (" + associations[c.name] + ")" : "jgjgjg"
                    );
                    if (!itemsDictionary[bs.item.id]) {
                        itemsDictionary[bs.item.id] = {...bs.item, quantity: bs.quantity, characters: name};
                    } else {
                        itemsDictionary[bs.item.id].quantity += bs.quantity;
                        if (!itemsDictionary[bs.item.id].characters.includes(name)) {
                            itemsDictionary[bs.item.id].characters += `, ${name}`;
                        }
                    }
                });
            });
        });

        return Object.keys(itemsDictionary)
            .map(r => itemsDictionary[r])
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
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
        /*
        const contents = fs.readFileSync("doc/alt_main_associations.txt").split('\n');
        const associations = {};
        contents.forEach(a => {
            const pair = a.split(":");
            associations[pair[0]] = pair[1];
        });
        return associations;
        */
       return "nightfur:Arala\nnightraid:Khendi"
    }
}
