import { Plugin } from "obsidian";
import { SomeApi } from "./someApi";

export default class SomeDemos extends Plugin {
    static instance: SomeDemos;

    get api(): ReturnType<typeof SomeApi.GetApi> {
        return SomeApi.GetApi(this.app, this);
    }

    async onload() {
        console.log("Loading SomeDemos");
        SomeDemos.instance = this;
    }

    onunload() {
        console.log("Unloading SomeDemos");
    }
}