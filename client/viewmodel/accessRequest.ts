import {makeAutoObservable} from "mobx";

import {AccessRequestKind, AccessRequestShape} from "../models/accessRequest";
import {User} from "../models/user";

const emailValidationPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AccessRequest implements AccessRequestShape {
    public firstName: string = "";
    public lastName: string = "";
    public emailAddress: string = "";
    public affiliation: string = "";
    public purpose: string = "";
    public readonly requestKind: AccessRequestKind;

    public constructor(requestKind: AccessRequestKind = AccessRequestKind.Access) {
        this.requestKind = requestKind;

        makeAutoObservable(this);
    }

    public clear() {
        this.firstName = "";
        this.lastName = "";
        this.emailAddress = "";
        this.affiliation = "";
        this.purpose = "";
    }

    // Blanks only, so details typed before the user record arrives are kept.
    public fillBlanksFrom(user: Pick<User, "firstName" | "lastName" | "emailAddress" | "affiliation">) {
        this.firstName ||= user.firstName ?? "";
        this.lastName ||= user.lastName ?? "";
        this.emailAddress ||= user.emailAddress ?? "";
        this.affiliation ||= user.affiliation ?? "";
    }

    public get isValidEmailAddress(): boolean {
        return emailValidationPattern.test(this.emailAddress);
    }

    public get isValid(): boolean {
        return this.firstName.length > 0
            && this.lastName.length > 0
            && this.isValidEmailAddress
            && this.affiliation.length > 0
            && this.purpose.length > 0
    }
}
