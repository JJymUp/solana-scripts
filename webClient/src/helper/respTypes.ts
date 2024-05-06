export interface RESPONSE<T> {
    config: Record<string, any>;
    data: T;
    headers: Record<string, any>;
    request: any;
    status: number;
    statusText: string;
}
export type BASE_RESPONSE<T> = RESPONSE<{
    code: string;
    data: T;
    msg: string;
    req_id: string;
}>

export type BASE_PAGING_RESPONSE<T> = BASE_RESPONSE<{
    has_more: boolean;
    items: T[];
    total?: number
}>

export interface REQUEST_LIST_BASIC_PARAMS {
    limit: number,
    offset?: number
} 