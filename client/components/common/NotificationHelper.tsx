import {notifications} from "@mantine/notifications";

export function toastCreateSuccess(message: string) {
    return successNotification("Create Successful", message);
}

export function toastCreateError(error: Error | string) {
    return errorNotification("Create Failed", error);
}

export function toastUpdateSuccess(message: string) {
    return successNotification("Update Successful", message);
}

export function toastUpdateError(error: Error | string) {
    return errorNotification("Update Failed", error);
}

export function toastDeleteSuccess(message: string) {
    return successNotification("Delete Successful", message);
}

export function toastDeleteError(error: Error | string) {
    return errorNotification("Delete Failed", error);
}

export function infoNotification(title: string, message: string) {
    notifications.show({title: title, message: message ? message : "(no additional details available)"});
}

export function successNotification(title: string, message: string) {
    notifications.show({title: title, message: message ? message : "(no additional details available)", color: "green"});
}

export function errorNotification(title: string, error: Error | string) {
    notifications.show({title: title, message: error ? ((typeof error === "string") ? error : error.message) : "(no additional details available)", color: "red", autoClose: false});
}


