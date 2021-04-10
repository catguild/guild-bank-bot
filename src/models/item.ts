export interface Item {
    id: number;
    name: string;
    quality: number;
    icon: string;
    url: string;
    class: number;
    subclass: number;
}

export interface ItemWithQuantity extends Item {
    quantity: number;
    characters: string;
}