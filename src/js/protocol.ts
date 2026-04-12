/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RebuttalClientInternal, VideoPayload } from "./types";
import * as QRCode from 'qrcode';
import v1_stc_iface from '../../protocol/v1/server_to_client-ti';
import v1_shared_iface from "../../protocol/v1/shared-ti";
import { v1_stc_packet } from '../../protocol/v1/server_to_client';
import { v0_stc_packet } from '../../protocol/v0/server_to_client';
import { createCheckers } from 'ts-interface-checker';

type any_packet = v1_stc_packet | v0_stc_packet;
const checker = createCheckers(v1_stc_iface, v1_shared_iface);

export function handle_message(client: RebuttalClientInternal,
    unknown_packet: unknown) {
    if (!checker.v1_stc_packet.test(unknown_packet)) {
        console.log("Invalid Packet");
        console.log(unknown_packet);
        return;
    }
    const packet = unknown_packet as any_packet;
    switch (packet.type) {
        case "connect":
            {
                client.el.login_image.src = client.el.signup_image.src = packet.icon;
                client.el.login_desc.innerHTML = client.el.signup_desc.innerHTML = client.getApp().getParser().parse(packet.message).innerHTML;
                // TODO Re implement themelist, context menus and protocol check
                /*
                if (!client.getApp().isRunningInElectron()) {
                    client.getApp().updateThemes(packet.themelist);
                }
                client.setContextMenus(packet.contextmenus);
                */
                /*if (!("v1" in packet.protocols)) {
                    client.el.login_reply.innerHTML = "Unable to connect : No protocol v1";
                }*/
                if (client.username && client.username.length > 0 && client.password && client.password.length > 0 && client.autoconnect) {
                    // If the details are no longer correct, don't go into an infinite login loop
                    client.send.login(client.username, client.password, "v1");
                    client.password = "";
                }
            }
            return;
        case "error": {
            client.el.login_reply.innerHTML = client.el.signup_reply.innerHTML = client.getApp().getParser().parse(packet.message).innerHTML;
        }
            return;



        case "disconnect": {
            client.cleanupStream(packet.userid);
            client.setWatching(packet.userid, false);
        }
            return;
        case "login": {
            const { success, userid } = packet;
            if (success) {
                client.showApp();
                client.setLoginReply("");
                client.setUserUUID(userid);
                client.getApp().playSound('login');
            } else {
                client.showLogin();
                client.setLoginReply('Invalid email or password');
            }
        }
            return
        case "refreshNow": {
            window.location.href = '/';
        }
            return
        case "updateUsers": {
            client.setUserList(packet.userList);
        }
            return
        case "updateRooms": {
            client.setRoomList(packet.roomList);
        }
            return
        case "chatdev": {
            client.updateRemoteDeviceState(packet.userid, packet.video, packet.audio);
        }
            return
        case "joinRoom": {
            const { userid, roomid } = packet;
            if (client.isInVoiceRoom(roomid)) {
                // Someone joined our room
                client.getApp().playSound('voicejoin');
            }
            if (client.userIsMe(userid)) {
                client.setCurrentVoiceRoom(roomid);
            }
            // TODO Maybe also ensure Client UI

            // Ensure App UI
            client.getApp().updateDeviceState();
        }
            return
        case "updateText": {
            const { roomid, segment, messages } = packet;
            client.updateRoomMessageSegment(roomid, segment, messages);
        }
            return
        case "leaveRoom": {
            const { userid, roomid } = packet;
            if (client.isInVoiceRoom(roomid)) {
                // Someone left our room
                client.getApp().playSound('voiceleave');
            }
            if (client.userIsMe(userid)) {
                client.setCurrentVoiceRoom(null);
                client.getApp().playSound('voiceleave');
            } else {
                client.cleanupStream(userid);
                client.setWatching(userid, false);
                client.setWatchingMe(userid, false);
            }
        }
            return
        case "video": {
            const { payload, touserid, fromuserid } = packet;
            const payload_typed = payload as VideoPayload;
            console.log("Got a video packet");
            if (!client.userIsMe(touserid)) {
                console.log("It wasn't for me. Discarding");
                return;
            }

            if ('type' in payload_typed && typeof payload_typed.type == 'string') {
                if (payload_typed.type == "offer") {
                    const pc = client.getPeerConnection(fromuserid);
                    if (pc == undefined) {
                        console.log("Video offer but no PeerConnection");
                        return;
                    }
                    console.log("Got offer");

                    if (pc.signalingState != "stable") {
                        if (touserid < fromuserid) {
                            pc.setLocalDescription({ type: "rollback" })
                                .then(() => { console.log("SLD rollback complete") })
                                .catch((err) => { console.log("set Local Description failed to rollback " + err) });
                        } else {
                            pc.setRemoteDescription(payload_typed).catch((e) => console.log("Unable to set remote description " + e))
                        }


                    }
                    pc.setRemoteDescription(payload_typed)
                        .catch((e) => console.log("Unable to setRemoteDescription for offer " + e));
                    pc.createAnswer()
                        .then((answer) => {
                            const ld = pc.setLocalDescription(answer);
                            client.send.video(answer, fromuserid);
                            return ld;
                        })
                        .then(() => {
                            if (pc.localDescription != null) {

                                client.send.video(pc.localDescription, fromuserid);
                            }

                        })
                        .catch((e) => console.log("Unable to answer " + e));
                    return;
                } else if (payload_typed.type == "answer") {
                    const pc = client.getPeerConnection(fromuserid);

                    if (pc == undefined) {
                        console.log("Video answer but no PeerConnection");
                        return;
                    }
                    console.log("Got answer");

                    if (pc.signalingState == "stable") {
                        console.log("Ignoring answer while stable");
                        return
                    }

                    pc.setRemoteDescription(new RTCSessionDescription(payload_typed))
                        .then(() => {
                            console.log("SRD from answer complete")
                            if (pc.localDescription != null) {
                                client.send.video(pc.localDescription, fromuserid);
                            }
                        }
                        ).catch(err => {
                            console.log(err);
                        });
                    return;
                }
            } else if ('message' in payload_typed) {
                if (payload_typed.message == "fuckoff") {
                    console.log("Hanging up Peer");
                    client.cleanupStream(fromuserid);
                    return;
                } else if (payload_typed.message == "callme") {

                    console.log("Got a callme");
                    client.startCall(fromuserid);
                    return;
                }

            } else if ('candidate' in payload_typed) {
                const pc = client.getPeerConnection(fromuserid);

                if (pc == undefined) {
                    console.log("Video candidate but no PeerConnection");
                    return;
                }
                console.log("Got candidate");

                pc.addIceCandidate(payload_typed)
                    .then(() => {
                        console.log("IceCandidate from candidate complete")
                    })
                    .catch(e => {
                        console.log(e);
                    });

                break;
            }
        }
            return
        case "updatePerms": {
            client.setUserPermissions(packet.perms);
        }
            return
        case "updateGroups": {
            client.setServerGroups(Object.keys(packet.groups));
        }
            return
        case 'invite': {
            const url = client.getServerURL();
            const invite_url = 'https://' + url.hostname + (url.port ? ':' + url.port : '') + '/?invite=' + packet.invite_code
            client.el.invite_user_reply.textContent = invite_url;

            client.el.invite_user_reply.onclick = () => {
                navigator.clipboard.writeText(invite_url).then(() => { }, () => { });
            }
            QRCode.toCanvas(client.el.invite_qr_code, invite_url).catch((err) => { console.log("Unable to generate QR code " + err) });
        }
            return
        case 'sendMessage': {
            const { roomid, message } = packet;
            if (Notification.permission == 'granted') {
                if (client.userIsMe(message.userid)) {
                    return;
                }
                const user = client.getUserByUUID(message.userid);

                console.log(message);
                if (user) {
                    new Notification(user.name + " : " + message.text);
                }
            }
            if (client.getCurrentViewUUID() == roomid) {
                client.populateRoom();
            }
            client.getApp().playSound("newmessage");
        }
            return
        case 'servermute': {
            const { userid, message } = packet;
            const sideuser = document.getElementById('user-' + userid)
            const videouser = document.getElementById('videodiv-' + userid);
            if (sideuser != null) {
                if (message) {
                    sideuser.classList.add('usermuted');
                    if (videouser) { videouser.classList.add('videodivmuted'); }
                    if (client.getApp().isRunningInElectron()) { window.ipc.send('muted', userid); }
                } else {
                    sideuser.classList.remove('usermuted');
                    if (videouser) { videouser.classList.remove('videodivmuted'); }
                    if (client.getApp().isRunningInElectron()) { window.ipc.send('unmuted', userid); }
                }
            }
        }
            return
        case 'talking': {
            const { userid, talking } = packet;
            const sideuser = document.getElementById('user-' + userid)
            const videouser = document.getElementById('videodiv-' + userid);
            if (talking) {
                if (sideuser) { sideuser.classList.add('usertalking'); }
                if (videouser) { videouser.classList.add('videodivtalking'); }
                //if (client.getApp().isRunningInElectron()) { window.ipc.send('talkstart', userid); }
            } else {
                if (sideuser) { sideuser.classList.remove('usertalking'); }
                if (videouser) { videouser.classList.remove('videodivtalking'); }
                //if (client.getApp().isRunningInElectron()) { window.ipc.send('talkstop', userid); }
            }
        }
            return
        case 'golive': {
            const { livestate, livelabel, userid, roomid } = packet;
            const user = client.getUserByUUID(userid);
            if (user) {
                user.livestate = livestate;
                user.livelabel = livelabel;
            }
            if (!livestate) {
                client.setWatching(userid, false);
            }
            if (client.setCurrentVoiceRoom(roomid)) {
                client.getApp().playSound("streamstarted");
            }
            client.populateRoom();
        }
            return
        case 'letmesee': {
            const { touserid, fromuserid, message } = packet;
            if (client.userIsMe(touserid)) {
                client.setWatching(fromuserid, message);
            }
            client.replacePeerMedia(fromuserid);
            client.populateRoom();
        }
            return
        case 'presentcustomwindow': {
            client.showCustomWindow(packet.window);
        }
            return;
    }
}