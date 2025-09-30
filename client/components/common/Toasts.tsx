import * as React from "react";

export const toastCreateSuccess = () => {
    return (<div><h3>Create successful</h3></div>);
};

export const toastCreateError = (error: Error | string) => {
    if (typeof error === "string") {
        return (<div><h3>Create failed</h3>{error || "(no additional details available)"}</div>);
    } else {
        return (<div><h3>Create failed</h3>{error ? error.message : "(no additional details available)"}</div>);
    }
};

export const toastUpdateSuccess = () => {
    return (<div><h3>Update successful</h3></div>);
};

export const toastUpdateError = (error: Error) => {
    return (<div><h3>Update failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};

export const toastDeleteSuccess = () => {
    return (<div><h3>Delete successful</h3></div>);
};

export const toastDeleteError = (error: Error | string) => {
    if (typeof error == "string") {
        return (<div><h3>Delete failed</h3>{error ? error : "(no additional details available)"}</div>);
    } else {
        return (<div><h3>Delete failed</h3>{error ? error.message : "(no additional details available)"}</div>);
    }
};

