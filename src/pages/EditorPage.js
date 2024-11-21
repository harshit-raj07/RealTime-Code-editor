import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client'; /*ek folder bahar jaakr aise import krte*/
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation, /*iska use kiya gya tha home page se username ka data router ko bheja tha,ye home page me bheje the humlog */
    useNavigate,
    Navigate,
    useParams,/*url se roomID get krne ke liye*/
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();/*connection establish ar initsocket ko async fun banaya hua hai isliye await use kr paa rahe hai*/
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');/*homepage pe redirect kar dega*/
            }

            socketRef.current.emit(ACTIONS.JOIN, {/*server pe ye msg bhejna hai ki join ho gya hai*/
                roomId,
                username: location.state?.username,
            });

            // agar koi naya user join kiya hai to uske liye sabko notification jayega
            // uska hi taam jhaam hai
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    // agar username mera nahi hai tab unko ye notification bhejo
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    //wo case jab new user join kare ar usko pehle ka code naa dikhe
                    //socket ref-> no re-render
                    // main code-editor.js me hai
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    // jo jo connected hai usko hi return karega
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        // listeners ko clear krna very imp wrna memory leak ka problem
        // cleaning function  
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);/*empty array dena padega agar nahi diya to har ek render ke liye call ho jayega*/
    // room id copying
    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client                        /*Client.js wale page se import karega*/
                                key={client.socketId}    /*saare clients ka ek unique socket id hai*/
                                username={client.username}
                            />
                        ))} 
                    </div> 
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap"> {/*text editor bana raha hai isme , editor.js*/}
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    // har baar code ko update krta hai such that koi new user aaye to usko pehle ka code dikhe
                    
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;
