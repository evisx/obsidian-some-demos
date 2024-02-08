import { FuzzySuggestModal } from "obsidian";
import type { FuzzyMatch, App } from "obsidian";

type Nullable<T> = T | null;
interface Result<T> { item: Nullable<T>, input: string }

export default class GenericSuggester<T> extends FuzzySuggestModal<Nullable<T>> {
	private resolvePromise: (value: Result<T>) => void;
	private rejectPromise: (reason?: unknown) => void;
	public promise: Promise<Result<T>>;
	private resolved: boolean;

	public static Suggest<T>(app: App, displayItems: string[], items: T[]) {
		const newSuggester = new GenericSuggester(app, displayItems, items, null);
		return newSuggester.promise;
	}

	public constructor(
		app: App,
		private displayItems: string[],
		private items: T[],
		private nullableItems: Nullable<T>[] | null
	) {
		super(app);

		this.promise = new Promise<Result<T>>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});

		const getText = (item: Nullable<T>) => this.getItemText(item)

		this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.code !== "Tab") {
				return;
			}

			// chooser is undocumented & not officially a part of the Obsidian API, hence the precautions in using it.
			if ('chooser' in this) {
				const { values, selectedItem } = Reflect.get(this, "chooser") as {
					values: {
						item: Nullable<T>;
						match: { score: number; matches: unknown[]; };
					}[];
					selectedItem: number;
					[key: string]: unknown;
				};

				const inputEl = Reflect.get(this, "inputEl") as HTMLInputElement;
				inputEl.value = getText(values[selectedItem].item);
			}
		});

		this.open();
	}

	getItemText(item: Nullable<T>): string {
		if (item === null) return this.inputEl.value

		return this.displayItems[this.items.indexOf(item)];
	}

	getItems(): Nullable<T>[] {
        if (this.inputEl.value === "") return this.items;

		this.nullableItems ||= [null, ...this.items]
		return this.nullableItems;
	}

	selectSuggestion(
		value: FuzzyMatch<Nullable<T>>,
		evt: MouseEvent | KeyboardEvent
	) {
		this.resolved = true;
		super.selectSuggestion(value, evt);
	}

	onChooseItem(item: Nullable<T>, _evt: MouseEvent | KeyboardEvent): void {
		this.resolved = true;
		this.resolvePromise({ item: item, input: this.inputEl.value });
	}

	onClose() {
		super.onClose();

		if (!this.resolved) this.rejectPromise("no input given.");
	}
}