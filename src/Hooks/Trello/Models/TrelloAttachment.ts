export type TrelloAttachment = {
    id: string;
    date: Date;
    mimeType: string;
    name: string;
    url: string;
    previews: TrelloAttachmentPreview[];
}

export type TrelloAttachmentPreview = {
    id: string;
    url: string;
    width: number;
    height: number;
    byte: number;
}