import { type RoomUUID, type UserUUID, v1_shared_context_type, v1_shared_message_ephemeral, v1_shared_message_update } from "../../protocol/v1/shared";
import { type Sender, type VideoPayload } from "./types";
import { v1_cts_packet } from '../../protocol/v1/client_to_server';
import { v0_cts_packet } from '../../protocol/v0/client_to_server';

type any_packet = v1_cts_packet | v0_cts_packet;

export function create_sender(): Sender {
    return {
        ws: null,
        packet: function (json: any_packet): void {
            this.ws?.send(JSON.stringify(json));
        },
        login: function (email: string, password: string, protocol: string) {
            this.packet({ type: 'login', email, password, protocol });
        },
        video: function (payload: VideoPayload, touserid: UserUUID) {
            console.log({ type: 'video', touserid, payload })
            const payload_str = payload as string;
            this.packet({ type: 'video', touserid, payload: payload_str });
        },
        letmesee: function (touserid: UserUUID, message: boolean) {
            this.packet({ type: 'letmesee', touserid, message });
        },
        chatdev: function (audio: boolean, video: boolean) {
            this.packet({ type: 'chatdev', audio, video });
        },
        update_message: function (message: v1_shared_message_update) {
            this.packet({ type: 'updatemessage', message })
        },
        contextoption: function (context: v1_shared_context_type, option: string, value: string) {
            this.packet({ type: 'contextoption', context, option, value });
        },
        message: function (roomid: RoomUUID, message: v1_shared_message_ephemeral) {
            this.packet({ type: 'message', roomid, message, filename: null, rawfile: null });
        },
        message_with_upload: function (roomid: RoomUUID, message: v1_shared_message_ephemeral, filename: string, rawfile: string) {
            this.packet({ type: 'message', roomid, message, filename, rawfile });
        },
        get_messages: function (roomid: RoomUUID, segment?: number) {
            this.packet({ type: 'getmessages', roomid, segment });
        },
        create_room: function (room_name: string, room_type: "voice" | "text", position: number) {
            this.packet({ type: 'createroom', roomName: room_name, roomType: room_type, position })
        },
        join_room: function (roomid: RoomUUID) {
            this.packet({ type: 'joinroom', roomid });
        },
        leave_room: function () {
            this.packet({ type: 'leaveroom' });
        },
        invite(group_name: string) {
            this.packet({ type: 'invite', groupName: group_name });
        },
        signup(sign_up: string, user_name: string, email: string, password: string) {
            this.packet({ type: 'signup', signUp: sign_up, userName: user_name, email, password })
        },
        talking(talking: boolean) {
            this.packet({ type: "talking", talking });
        },
    }
}