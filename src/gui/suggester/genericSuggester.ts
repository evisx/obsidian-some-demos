import { FuzzySuggestModal } from "obsidian";
import type { FuzzyMatch , App} from "obsidian";

type Nullable<T> = T | null;

export default class GenericSuggester<T> extends FuzzySuggestModal<Nullable<T>> {
	private resolvePromise: (value: [Nullable<T>, string]) => void;
	private rejectPromise: (reason?: unknown) => void;
	public promise: Promise<[Nullable<T>, string]>;
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

		this.promise = new Promise<[Nullable<T>, string]>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});

		this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
			// chooser is undocumented & not officially a part of the Obsidian API, hence the precautions in using it.
			if (event.code !== "Tab" || !("chooser" in this)) {
				return;
			}

			const { values, selectedItem } = this.chooser as {
				values: {
					item: string;
					match: { score: number; matches: unknown[]; };
				}[];
				selectedItem: number;
				[key: string]: unknown;
			};

			const { value } = this.inputEl;
			this.inputEl.value = values[selectedItem].item ?? value;
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
		value: FuzzyMatch<T>,
		evt: MouseEvent | KeyboardEvent
	) {
		this.resolved = true;
		super.selectSuggestion(value, evt);
	}

	onChooseItem(item: Nullable<T>, evt: MouseEvent | KeyboardEvent): void {
		this.resolved = true;
		this.resolvePromise([item, this.inputEl.value]);
	}

	onClose() {
		super.onClose();

		if (!this.resolved) this.rejectPromise("no input given.");
	}
}