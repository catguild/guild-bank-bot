import {Character} from "../models/character";
import {Account} from "../models/account";
import {createHttpClient} from "./http-client";
import {AxiosInstance} from "axios";
import {ItemWithQuantity} from "../models/item";

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
        const itemsDictionary: { [id: string]: ItemWithQuantity } = {};

        characters.forEach(c => {
            c.bags.forEach(b => {
                b.bagSlots.forEach(bs => {
                    if (!itemsDictionary[bs.item.id]) {
                        itemsDictionary[bs.item.id] = {...bs.item, quantity: bs.quantity, characters: c.name};
                    } else {
                        itemsDictionary[bs.item.id].quantity += bs.quantity;
                        if (!itemsDictionary[bs.item.id].characters.includes(c.name)) {
                            itemsDictionary[bs.item.id].characters.concat(`, ${c.name}`);
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
}
