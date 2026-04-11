import { BodyPix } from '@tensorflow-models/body-pix';
import { parser } from './parser';
import { UUID, RoomUUID, UserUUID, v1_shared_room, v1_shared_user, v1_shared_context_type, v1_shared_message_ephemeral } from '../../protocol/v1/shared';
import { v1_cts_packet } from '../../protocol/v1/client_to_server';
import { v0_cts_packet } from '../../protocol/v0/client_to_server';

export type ConnectionUUID = UUID;

export enum ServerState {
    NO_CONNECTION,
    CONNECTED_NOT_AUTHED,
    CONNECTED,
    DISCONNECTED,
    ERROR,
}

export interface AudioList {
    [key: string]: HTMLAudioElement,
}

export interface Theme {
    id: string,
    name: string,
    description: string,
}

export type WatchList = Map<UserUUID, boolean>;


export interface Message {
    roomid: string;
    idx: number;
    text: string;
    img?: string;
    url?: string;
    height?: number;
    width?: number;
    userid?: string;
    tags: string[];
    type?: string;
    username: string;
}

export interface ContextMenu {
    label: string, // TODO i18n
    permissionRequired: string,
    option: string,
}


export enum FullscreenType {
    WEBCAM, IMAGE, LIVESTREAM,
}

export interface FullscreenMetadata {
    userid?: UserUUID,
    type: FullscreenType,
    closed_callback?: () => void,
}

export interface AppSettings {
    getDetectTalking(): boolean,
    getDetectTalkingLevel(): number,
    getTheme(): string,
    getSoundTheme(): string,
    getFont(): string | null,
    getSfxVolume(): number,
    getBlurUser(): boolean,
    getHideDuplicateName(): boolean,
    getWebcamFlip(): boolean,
    getCameraDevice(): string,
    getAudioDevice(): string,
    getAudioEchoCancel(): boolean,
    getAudioNoiseSuppress(): boolean,


    setDetectTalking(talking: boolean),
    setDetectTalkingLevel(level: number),
    setTheme(theme: string),
    setSoundTheme(theme: string),
    setFont(font: string),
    setSfxVolume(vol: number),
    setBlurUser(blur: boolean),
    setHideDuplicateName(hide: boolean),
    setWebcamFlip(flip: boolean),
    setCameraDevice(dev: string),
    setAudioDevice(dev: string),
    setAudioEchoCancel(cancel: boolean),
    setAudioNoiseSuppress(suppress: boolean),

}

export interface ContextMenuItem {
    text: string,
    class: string,
    slider?: number,
    callback: () => void,
}

export type exact_device = {
    exact: string
};

export interface ClientCredentials {
    invite?: UUID,
    username?: string,
    password?: string,
    autoconnect: boolean,
}

// The app is the instance of a whole application. This is One window, with any number of Clients in tabs
export interface RebuttalApp {
    getAllClients(): MapIterator<RebuttalClient>,
    getClient(id: ConnectionUUID): RebuttalClient | null,
    setActiveTab(id: ConnectionUUID | null): void,
    getActiveTab(): ConnectionUUID | null,
    addTab(element: HTMLImageElement): void,
    removeTab(id: ConnectionUUID): void,

    isShowingPopup(): boolean,
    isShowingServerSettings(): boolean,
    isShowingClientSettings(): boolean,

    updateDeviceState(): void,

    hangUp(),
    hasMic(): boolean,
    hasWebcam(): boolean,
    hasLiveStream(): boolean,
    hasLiveStreamAudio(): boolean,

    toggleAllowMic(),
    toggleAllowWebcam(),
    toggleAllowLivestream(),
    toggleAllowLivestreamAudio(),

    ensureDevicePermission(),
    ensureLivestreamPermission(),
    closeWebcamDevice(),
    closeLivestream(),
    createAudioConstraints(): MediaTrackConstraints,
    createVideoConstraints(): MediaTrackConstraints,
    createConstraints(): MediaStreamConstraints,

    setTheme(theme: string),
    setSoundTheme(theme: string),

    isRunningInElectron(): boolean,

    getSettings(): AppSettings,

    playSound(soundName: string),

    getLocalWebcamStream(): MediaStream | null,
    getLocalFilteredStream(): MediaStream | null,
    getLocalLiveStream(): MediaStream | null,

    updateThemes(new_themes: Theme[]),

    // Changes to client GUI
    setFullscreenElement(element: HTMLElement, metadata: FullscreenMetadata),
    getFullscreenMetadata(): FullscreenMetadata | null,
    closeFullscreen(),
    getParser(): typeof parser,
    getWhiteNoise(): MediaStream,

    show_context_menu(list: ContextMenuItem[], e: Event),
    close_context_menu(),
    showCustom(custom_popup: HTMLElement),
    hideCustom(),
    reconstitute(template: string, values: ReconstituteValues): HTMLElement,
    get_or_reconstitute(id: string, template: string, values: ReconstituteValues): HTMLElement,
}

export interface ReconstituteValues {
    [key: string]: string,
}

export interface ClientHTML {
    login_form: HTMLFormElement,
    login_view: HTMLDivElement,
    login_image: HTMLImageElement,
    login_name: HTMLInputElement,
    login_password: HTMLInputElement,
    login_desc: HTMLParagraphElement,
    login_reply: HTMLParagraphElement,

    signup_view: HTMLDivElement,
    signup_form: HTMLFormElement,
    signup_image: HTMLImageElement,
    signup_desc: HTMLParagraphElement,
    signup_name: HTMLInputElement,
    signup_friendly_name: HTMLInputElement,
    signup_pass1: HTMLInputElement,
    signup_pass2: HTMLInputElement,
    signup_reply: HTMLParagraphElement,

    room_list: HTMLDivElement,
    add_room_button: HTMLDivElement,

    user_list: HTMLDivElement,
    add_user_button: HTMLDivElement,

    core_view: HTMLDivElement,
    text_view: HTMLDivElement,

    voice_view: HTMLDivElement,

    text_chat_scroller: HTMLDivElement,
    text_input: HTMLInputElement,
    text_input_form: HTMLFormElement,
    text_auto_complete: HTMLDivElement,
    load_more_text: HTMLDivElement,

    dnd_outer: HTMLDivElement,
    dnd: HTMLDivElement,
    dnd_img: HTMLImageElement,
    dnd_cancel: HTMLDivElement,

    invite_popup: HTMLDivElement,
    invite: HTMLDivElement,
    invite_close: HTMLDivElement,
    invite_user_groups: HTMLSelectElement,
    invite_user_reply: HTMLDivElement,
    invite_qr_code: HTMLCanvasElement,
    invite_form: HTMLFormElement,

    popup_container: HTMLDivElement,
}

export interface AppHTML {
    hang_up_img: HTMLImageElement,
    server_img: HTMLImageElement,
    fullscreen_div: HTMLDivElement,
    popup_custom_outer: HTMLDivElement,
    context_menu: HTMLDivElement,
    context_menu_outer: HTMLDivElement,
    toggle_webcam_img: HTMLImageElement,
    toggle_mic_img: HTMLImageElement,
    toggle_livestream_img: HTMLImageElement,
    disconnect_img: HTMLImageElement,
    settings_img: HTMLImageElement,
    server_settings_img: HTMLImageElement,
    server_list: HTMLDivElement,
    server_add_input: HTMLInputElement,
    server_add_form: HTMLFormElement,
    server_add_remember_password: HTMLInputElement,
    server_add_auto_connect: HTMLInputElement,
    add_server_tab: HTMLImageElement,
    all_client_content: HTMLDivElement,
}

// A client is logical object connecting to a server.
// The connection may not yet be made, may be in error state or closed, the logical object must remain
export interface RebuttalClient {
    getState(): ServerState,
    getApp(): RebuttalApp,
    getServerImage(): string, // URL for the server img
    getServerName(): string,
    getServerURL(): URL
    getUserUUID(): UserUUID | null,
    setUserUUID(userid: UserUUID | null);
    getUsername(): string, // The friendly name of the user on this server
    getLogin(): string, // Get the email address used to log the user in
    getUserPermissions(): string[], // List of permissions the server has told us we have
    setUserPermissions(permissions: string[]),
    getServerGroups(): string[],
    setServerGroups(groups: string[]),

    getRoom(roomid: RoomUUID): v1_shared_room | null,
    getRoomList(): v1_shared_room[],
    setRoomList(roomlist: v1_shared_room[]),
    getUserList(): v1_shared_user[],
    setUserList(userlist: v1_shared_user[]),
    updateRoomMessageSegment(roomid: RoomUUID, idx: number, messages: Message[]),
    setContextMenus(menus: Map<string, ContextMenuItem[]>): void,
    getCurrentView(): v1_shared_room | null,
    setCurrentView(room: RoomUUID): void,
    getCurrentVoiceRoom(): v1_shared_room | null,
    setCurrentVoiceRoom(room: RoomUUID | null),
    get_connection_id(): ConnectionUUID,

    isShowingPopup(): boolean,

    el: ClientHTML,

    showApp(),
    showLogin(),
    showSignUp(),
    setLoginReply(message: string),

    getUserByUUID(uuid: UserUUID): v1_shared_user | null, // TODO UUID?
    getUsersByPartialName(bit: string): v1_shared_user[],
    loadMoreText(),

    send: Sender,
    connect(): void,

    hangUp(),
    closeConnections(),

    populateStreamsInVoiceRoom(): void,
    replaceAllPeerMedia(): void
    replacePeerMedia(userid: UserUUID): void, // TODO typing

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showCustomWindow(custom_window: any),

    getLiveStream(userid: UserUUID): MediaStream | null,
    getWebcamStream(userid: UserUUID): MediaStream | null,

    userIsMe(user: UserUUID): boolean,
    isInVoiceRoom(room: RoomUUID): boolean,

    updateDeviceState(): void,
    updateRemoteDeviceState(userid: UserUUID, has_video: boolean, has_audio: boolean),

    startCall(userid: UserUUID),
    createPeerConnection(userid: UserUUID): void,
    getPeerConnection(userid: UserUUID): RTCPeerConnection | undefined,

    // Methods to change the client UI
    cleanupStream(user: UUID),
    setWatching(user: UserUUID, watching: boolean),
    setWatchingMe(userid: UserUUID, watching: boolean),
    populateRoom(),
    populateRoomVideo(user: v1_shared_user),
    populateUserList(),
    populateRoomList(),
    updatePerms(),
}

export interface VideoReqType {
    type: string,
}

export interface Sender {
    ws: WebSocket | null,
    raw: (json: v1_cts_packet | v0_cts_packet) => void,
    login: (username: string, password: string, protocol_to: string) => void,
    video: (payload: RTCIceCandidateInit | RTCSessionDescriptionInit | VideoReqType, touserid: UserUUID) => void,
    letmesee: (touserid: UserUUID, message: boolean) => void,
    chatdev: (audio: boolean, video: boolean) => void,
    update_message: (roomid: RoomUUID, messageid: number, message: Message) => void,
    contextoption: (context: v1_shared_context_type, option: string, value: string) => void,
    message: (roomid: RoomUUID, message: v1_shared_message_ephemeral) => void,
    message_with_upload: (roomid: RoomUUID, message: v1_shared_message_ephemeral, filename: string, b64_contents: string) => void,
    get_messages: (roomid: RoomUUID, segment?: number) => void,
    join_room: (roomid: RoomUUID) => void,
    leave_room: () => void,
    invite: (groupName: string) => void,
    signup: (invite: UUID, friendly_name: string, username: string, password: string) => void,
    talking: (talking: boolean) => void,
}

// A Super-type with extra storage. Used similar to private members in other languages
export type RebuttalClientInternal = RebuttalClient & {
    app: RebuttalApp,
    ws: WebSocket | null,
    autoconnect: boolean,
    connection_id: ConnectionUUID;
    hostname: URL,
    username: string | undefined,
    password: string | undefined,
    invite: UUID | undefined,
    user_list: v1_shared_user[],
    room_list: v1_shared_room[],
    messages: Map<RoomUUID, Map<number, Message[]>>,
    current_view: RoomUUID | null,
    current_voice: RoomUUID | null,
    context_menus: Map<string, ContextMenu[]>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    popups: any, // TODO Popup GUI
    state: ServerState,
    server_image_url: string,
    server_name: string,
    user_uuid: UserUUID | null,
    user_friendly_name: string,
    user_email: string,
    user_permissions: string[],
    server_group_names: string[],
    i_am_watching: UserUUID[],
    watching_me: UserUUID[],
    peer_connection: Map<UserUUID, RTCPeerConnection>,
    last_chat_y_pos: number,
    cached_file_upload: Blob | null,
    cached_tags: UserUUID[],
    autocompleteing: boolean,
    autocompletestart: number | null,
    autocompleteselection: number,
    live_streams: Map<UserUUID, MediaStream>,
    webcam_streams: Map<UserUUID, MediaStream>,
    skip_scroll_calc: boolean,

    updateAutocomplete(userlist: v1_shared_user[] | null),
    autocomplete(userid: UserUUID | null),
    amIWatching(userid: UserUUID),
    isWatchingMe(userid: UserUUID),

    restartStream(userid: UserUUID),

    performBodyPix(net: BodyPix, canvas: HTMLCanvasElement, video: HTMLVideoElement): Promise<void>,
    getEarliestTextSegment(roomid: RoomUUID): number | undefined,

    popup_change_message(message: Message),
    has_perm(perm: string): boolean,
    populate_context_menu(type: v1_shared_context_type, id: string): ContextMenuItem[],
    reconstitute(template: string, values: ReconstituteValues): HTMLElement,
    get_or_reconstitute(id: string, template: string, values: ReconstituteValues): HTMLElement,
    init: () => void,

};