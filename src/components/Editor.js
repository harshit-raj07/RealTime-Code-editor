import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';/*mode ko enable krne ke liye ye import karo*/
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            //editorRef me text editor ko store kar liya ab listen krna hai usko
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'), /*codemirror ko textarea se connect*/
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',  /*theme wagera daalne ke liye codemirror se import  */
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );
            
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    // socketref is file me nahi hai wo laaya gya hai editorpage.js
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        // ye room id ar code bheja gya hai server pe
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    // yaha pe dusro ke system pe bhi code change kr diya gya
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
