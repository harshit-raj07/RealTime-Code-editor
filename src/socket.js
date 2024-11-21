import { io } from 'socket.io-client';

export const initSocket = async () => {

    const options = {/*study about this socket documentation*/
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    console.log(options);
    console.log(process.env.REACT_APP_BACKEND_URL)
    return io("http://localhost:5000", options);

};
