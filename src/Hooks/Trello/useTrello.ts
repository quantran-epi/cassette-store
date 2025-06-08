import { TrelloCreateAttachmentParam, TrelloCreateCardParam, TrelloCreateCommentParam } from "./Models/ApiParam";
import { TrelloAction } from "./Models/TrelloAction";
import { TrelloAttachment } from "./Models/TrelloAttachment";
import { TrelloCard } from "./Models/TrelloCard";

type UseTrello = {
    getACard: (cardId: string) => TrelloCard;
    getCardsByList: (listId: string) => TrelloCard[];
    getAttachmentsOfCard: (cardId: string) => TrelloAttachment[];
    getAnAttachment: (attachmentId: string) => TrelloAttachment;
    createCard: (params: TrelloCreateCardParam) => TrelloCard;
    createAttachment: (params: TrelloCreateAttachmentParam) => TrelloAttachment[];
    createComment: (params: TrelloCreateCommentParam) => TrelloAction;
}

type UseTrelloProps = {
    
}

export const useTrello = (props: UseTrelloProps):UseTrello => {
    const TODO_LIST_ID = "683721cc07c7a969e00ab475";
    const DELIVERY_CREATED_LIST_ID = "683823d1aa759895d6d6d32c";
    const DONE_LIST_ID = "683823d67567eff9da5c91c2";
    const NOT_DELIVERED_LIST_ID = "683ad6fb6d164af9e8f0fd32";
    const ENDPOINTS = {
        GET_CARD: "",
        GET_CARDS_BY_LIST: "",
        GET_ATTACHMENTS_BY_CARD: "",
        GET_ATTACHMENT: "",
        CREATE_ATTACHMENT: "",
        CREATE_NEW_CARD: "",
        UPDATE_CARD: "",
        ADD_COMMENT_ON_CARD: ""
    }

    return {

    }
}