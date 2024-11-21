import React from 'react';
import Avatar from 'react-avatar'; /* library add kiya hai avatar generate krne ke liye*/

const Client = ({ username }) => {
    return (
        <div className="client">
            <Avatar name={username} size={50} round="14px" /> {/* is avatar ki alag alag prop hai like name ke basis pe avatar generate krta hai ar etc etc*/}
            <span className="userName">{username}</span> 
        </div>
    );
};

export default Client;
