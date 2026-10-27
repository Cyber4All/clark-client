import { Injectable } from "@angular/core";
import type { AgenticOutcomeSuggestion } from "app/core/learning-object-module/learning-object/learning-object.types";

export interface AgenticBuilderSessionState {
    selectedFields: {
        name: boolean;
        description: boolean;
        learningOutcomes: boolean;
    };
    reviewing: boolean;
    hasGeneratedSuggestions: boolean;
    hasGeneratedOutcomes: boolean;
    nameSuggestion: string | null;
    appliedName: boolean;
    descriptionOptions: string[];
    descriptionIndex: number;
    appliedDescriptionIndex: number | null;
    outcomeSuggestions: AgenticOutcomeSuggestion[];
}

@Injectable({ providedIn: "root" })
export class AgenticBuilderSessionStorageService {
    private readonly storagePrefix = "clark.agentic-builder.suggestions.";
    private activeCuid: string | null = null;

    activate(cuid: string): AgenticBuilderSessionState | null {
        if (this.activeCuid && this.activeCuid !== cuid) {
            this.clear(this.activeCuid);
        }
        this.activeCuid = cuid;
        return this.load(cuid);
    }

    save(cuid: string, state: AgenticBuilderSessionState): void {
        const storage = this.getSessionStorage();
        if (!storage) return;

        try {
            storage.setItem(
                this.getKey(cuid),
                JSON.stringify({ version: 1, ...state }),
            );
        } catch (_error) {
            // Session storage can be unavailable or full; suggestions remain usable in memory.
        }
    }

    clear(cuid: string): void {
        const storage = this.getSessionStorage();
        if (!storage) return;

        storage.removeItem(this.getKey(cuid));
    }

    clearActive(): void {
        if (!this.activeCuid) return;
        this.clear(this.activeCuid);
        this.activeCuid = null;
    }

    private load(cuid: string): AgenticBuilderSessionState | null {
        const storage = this.getSessionStorage();
        if (!storage) return null;

        try {
            const serialized = storage.getItem(this.getKey(cuid));
            if (!serialized) return null;

            return JSON.parse(serialized) as AgenticBuilderSessionState;
        } catch (_error) {
            this.clear(cuid);
            return null;
        }
    }

    private getKey(cuid: string): string {
        return `${this.storagePrefix}${encodeURIComponent(cuid)}`;
    }

    private getSessionStorage(): Storage | null {
        try {
            return typeof window === "undefined" ? null : window.sessionStorage;
        } catch (_error) {
            return null;
        }
    }
}
