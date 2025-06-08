import { TrelloAttachment } from "./TrelloAttachment";

export type TrelloCard = {
    id: string;
    name: string;
    desc: string;
    dueComplete: boolean;
    idList: string;
    start: Date;
    pos: number;
    url: string;
    attachments: TrelloAttachment[];
}