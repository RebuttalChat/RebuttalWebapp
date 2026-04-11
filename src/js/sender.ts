import { RoomUUID, UserUUID, UUID, v1_shared_context_type, v1_shared_message_ephemeral } from "../../protocol/v1/shared";
import { Sender, VideoReqType, type Message, } from "./types";

export function create_sender(): Sender {
    return {
        ws: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw: function (json: any): void {
            this.ws?.send(JSON.stringify(json));
        },
        login: function (email: string, password: string, protocol: string) {
            this.raw({ type: 'login', email, password, protocol });
        },
        video: function (payload: VideoReqType | RTCIceCandidateInit | RTCSessionDescriptionInit, touserid: UserUUID) {
            console.log({ type: 'video', touserid, payload })
            const payload_str = payload as string;
            this.raw({ type: 'video', touserid, payload: payload_str });
        },
        letmesee: function (touserid: UserUUID, message: boolean) {
            this.raw({ type: 'letmesee', touserid, message });
        },
        chatdev: function (audio: boolean, video: boolean) {
            this.raw({ type: 'chatdev', audio, video });
        },
        update_message: function (roomid: RoomUUID, messageid: number, message: Message) {
            this.raw({ type: 'updatemessage', roomid, messageid, message })
        },
        contextoption: function (context: v1_shared_context_type, option: string, value: string) {
            this.raw({ type: 'contextoption', context, option, value });
        },
        message: function (roomid: RoomUUID, message: v1_shared_message_ephemeral) {
            this.raw({ type: 'message', roomid, message, filename: null, rawfile: null });
        },
        message_with_upload: function (roomid: RoomUUID, message: v1_shared_message_ephemeral, filename: string, rawfile: string) {
            this.raw({ type: 'message', roomid, message, filename, rawfile });
        },
        get_messages: function (roomid: RoomUUID, segment?: number) {
            this.raw({ type: 'getmessages', roomid, segment });
        },
        join_room: function (roomid: RoomUUID) {
            this.raw({ type: 'joinroom', roomid });
        },
        leave_room: function () {
            this.raw({ type: 'leaveroom' });
        },
        invite(group_name: string) {
            this.raw({ type: 'invite', groupName: group_name });
        },
        signup(sign_up: UUID, user_name: string, email: string, password: string) {
            this.raw({ type: 'signup', signUp: sign_up, userName: user_name, email, password })
        },
        talking(talking: boolean) {
            this.raw({ type: "talking", talking });
        },
    }
}