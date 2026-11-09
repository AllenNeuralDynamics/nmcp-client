import {useEffect} from "react";
import {comparer, reaction} from "mobx";

// Writes MobX-held filter state into page settings on every change, and once after mount so the entry matches what the
// filter holds after restoring.  read must return plain data; write is captured at mount, so it may only call stable
// functions such as a page's update or the sectionOf wrappers around it.
export function useSettingsMirror<V>(read: () => V, write: (value: V) => void): void {
    useEffect(() => reaction(read, write, {equals: comparer.structural, fireImmediately: true}), []);
}
