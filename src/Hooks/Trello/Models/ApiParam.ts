export type TrelloCreateCardParam = {
    name: string;
    desc: string;
    pos: number;
    start: Date;
    idList: string;
    idLabels?: string[];
}

export type TrelloUpdateCardParam = Partial<TrelloCreateCardParam> & {
    id: string;
}

export type TrelloCreateAttachmentParam = {
    name: string;
    file: Blob;
    mimeType: string;
}

export type TrelloCreateCommentParam = {
    text: string;
}

export type TrelloDeleteAttachmentParam = {
    idAttachment: string;
}