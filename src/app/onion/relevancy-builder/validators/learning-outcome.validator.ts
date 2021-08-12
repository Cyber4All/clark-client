import { Injectable } from '@angular/core';

export class LearningOutcomeErrorGroup {
  private _saveErrors: Map<string, string> = new Map();
  private _submitErrors: Map<string, string> = new Map();

  get saveErrors() {
    return this._saveErrors;
  }

  get submitErrors() {
    return this._submitErrors;
  }

  setOutcomeError(type: 'save' | 'submit', id: string, error: string) {
    if (type === 'save') {
      this.saveErrors.set(id, error);
    } else {
      this.submitErrors.set(id, error);
    }
  }
}

@Injectable()
export class LearningOutcomeValidator {
  submissionMode: boolean;
  errors = new LearningOutcomeErrorGroup();

  outcomeSaveable(id: string) {
    return !this.errors.saveErrors.get(id);
  }

  outcomeSubmittable(id: string) {
    return !this.outcomeSaveable(id) || !this.errors.submitErrors.get(id);
  }

  get submittable(): boolean {
    return !this.errors.saveErrors.size && !this.errors.submitErrors.size;
  }
}
