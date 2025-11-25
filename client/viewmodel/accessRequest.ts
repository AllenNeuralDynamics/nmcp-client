import {makeAutoObservable} from "mobx";

import {AccessRequestShape} from "../models/accessRequest";

const emailValidationPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AccessRequest implements AccessRequestShape {
    public firstName: string = "";
    public lastName: string = "";
    public emailAddress: string = "";
    public affiliation: string = "";
    public purpose: string = "";

    public constructor() {
        makeAutoObservable(this);
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
