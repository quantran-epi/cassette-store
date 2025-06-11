import {
    TrelloCreateAttachmentParam,
    TrelloCreateCardParam,
    TrelloCreateCommentParam,
    TrelloUpdateCardParam
} from "./Models/ApiParam";
import {TrelloAction} from "./Models/TrelloAction";
import {TrelloAttachment} from "./Models/TrelloAttachment";
import {TrelloCard} from "./Models/TrelloCard";
import {useAPI} from "../useAPI";

type UseTrello = {
    TRELLO_LIST_IDS: {
        TODO_LIST: string;
        DELIVERY_CREATED_LIST: string;
        DONE_LIST: string;
        NOT_DELIVERED_LIST: string;
    },
    TRELLO_LIST_LABEL_IDS: {
        PRIORITY: string;
        CUSTOMER_RETURN_LESS_THAN_4: string;
        URGENT: string;
        BANK_TRANSFER_IN_ADVANCE: string;
        VIP: string;
    },
    getCard: (cardId: string) => Promise<TrelloCard>;
    getCardsByList: (listId: string) => Promise<TrelloCard[]>;
    getAttachmentsOfCard: (cardId: string) => Promise<TrelloAttachment[]>;
    getAttachment: (attachmentId: string, cardId: string) => Promise<TrelloAttachment>;
    createCard: (params: TrelloCreateCardParam) => Promise<TrelloCard>;
    updateCard: (params: TrelloUpdateCardParam) => Promise<TrelloCard>;
    createAttachment: (params: TrelloCreateAttachmentParam, idCard: string) => Promise<TrelloAttachment>;
    createComment: (params: TrelloCreateCommentParam, idCard: string) => Promise<TrelloAction>;
}

type UseTrelloProps = {}

export const useTrello = (props?: UseTrelloProps): UseTrello => {
    const TRELLO_LIST_IDS = {
        TODO_LIST: "683721cc07c7a969e00ab475",
        DELIVERY_CREATED_LIST: "683823d1aa759895d6d6d32c",
        DONE_LIST: "683823d67567eff9da5c91c2",
        NOT_DELIVERED_LIST: "683ad6fb6d164af9e8f0fd32"
    }
    const TRELLO_LIST_LABEL_IDS = {
        PRIORITY: "683930b63a44492a51430f73",
        CUSTOMER_RETURN_LESS_THAN_4: "6837217200ebb5d309ee5a29",
        URGENT: "683721700948a0e3f6d98e62",
        BANK_TRANSFER_IN_ADVANCE: "683dbce4f6a778c58949677d",
        VIP: "68372172cff4780e502ca91d"
    }
    const apiKey = "b36fcca616947504a51b502d550c0799";
    const token = "ATTA697bfbe9bd82a3b68f9fad66af4fcdf56492c460515041ea3675fa66010e5b851D18B695";
    const ENDPOINTS = {
        ROOT: "https://api.trello.com/1",
        GET_CARD: "/cards/{id}",
        GET_CARDS_BY_LIST: "/lists/{id}/cards",
        GET_ATTACHMENTS_BY_CARD: "/cards/{id}/attachments",
        GET_ATTACHMENT: "/cards/{id}/attachments/{idAttachment}",
        CREATE_ATTACHMENT: "/cards/{id}/attachments",
        CREATE_NEW_CARD: "/cards?idList={idList}",
        UPDATE_CARD: "/cards/{id}",
        ADD_COMMENT_ON_CARD: "/cards/{id}/actions/comments?text={text}"
    }
    const apiUtils = useAPI({
        root: ENDPOINTS.ROOT,
        defaultParams: new URLSearchParams({
            key: apiKey,
            token: token
        })
    })

    const getCard = async (cardId: string): Promise<TrelloCard> => {
        return apiUtils.get<TrelloCard>(ENDPOINTS.GET_CARD, {"{id}": cardId});
    }

    const getCardsByList = (listId: string): Promise<TrelloCard[]> => {
        return apiUtils.get(ENDPOINTS.GET_CARDS_BY_LIST, {"{id}": listId});
    }

    const getAttachmentsOfCard = (cardId: string): Promise<TrelloAttachment[]> => {
        return apiUtils.get(ENDPOINTS.GET_ATTACHMENTS_BY_CARD, {"{id}": cardId});
    }

    const getAttachment = (attachmentId: string, cardId: string): Promise<TrelloAttachment> => {
        return apiUtils.get(ENDPOINTS.GET_ATTACHMENT, {"{id}": cardId, "{idAttachment}": attachmentId});
    }

    const createCard = (params: TrelloCreateCardParam): Promise<TrelloCard> => {
        return apiUtils.post(ENDPOINTS.CREATE_NEW_CARD, {"{idList}": params.idList}, params);
    }

    const updateCard = (params: TrelloUpdateCardParam): Promise<TrelloCard> => {
        return apiUtils.put(ENDPOINTS.UPDATE_CARD, {"{id}": params.id}, params);
    }

    const createAttachment = (params: TrelloCreateAttachmentParam, idCard: string): Promise<TrelloAttachment> => {
        let formData = new FormData();
        formData.append("name", params.name);
        formData.append("mimeType", params.mimeType);
        formData.append("file", params.file);
        return apiUtils.postForFile(ENDPOINTS.CREATE_ATTACHMENT, {"{id}": idCard}, formData);
    }

    const createComment = (params: TrelloCreateCommentParam, idCard: string): Promise<TrelloAction> => {
        return apiUtils.post(ENDPOINTS.ADD_COMMENT_ON_CARD, {"{id}": idCard, "{text}": params.text}, null);
    }

    return {
        TRELLO_LIST_IDS,
        TRELLO_LIST_LABEL_IDS,
        getCard,
        getCardsByList,
        getAttachmentsOfCard,
        getAttachment,
        createComment,
        createCard,
        updateCard,
        createAttachment
    }
}