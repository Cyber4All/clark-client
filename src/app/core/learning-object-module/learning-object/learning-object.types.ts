export interface AgenticOutcomeSuggestion {
    verb: string;
    bloom: string;
    text: string;
}

export interface AgenticBuilderSuggestions {
    name?: string;
    description?: string;
    learningOutcomes?: AgenticOutcomeSuggestion[];
}
