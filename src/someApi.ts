import type { App } from "obsidian";
import type SomeDemos from "./main";
import GenericSuggester from "./gui/suggester/genericSuggester";

export class SomeApi {
    public static GetApi(
        app: App,
        _plugin: SomeDemos,
    ) {
        return {
            suggester: (
                displayItems:
                    | string[]
                    | ((
                        value: string,
                        index?: number,
                        arr?: string[]
                    ) => string[]),
                actualItems: string[]
            ) => {
                return this.suggester(app, displayItems, actualItems);
            },
        }
    }

    public static async suggester(
        app: App,
        displayItems:
            | string[]
            | ((value: string, index?: number, arr?: string[]) => string[]),
        actualItems: string[]
    ) {
        try {
            let displayedItems;

            if (typeof displayItems === "function") {
                displayedItems = actualItems.map(displayItems);
            } else {
                displayedItems = displayItems;
            }

            return await GenericSuggester.Suggest(
                app,
                displayedItems as string[],
                actualItems
            );
        } catch {
            return undefined;
        }
    }
}