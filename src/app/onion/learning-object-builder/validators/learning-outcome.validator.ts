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

  deleteOutcomeError(id: string, type?: 'save' | 'submit') {
    if (type) {
      if (type === 'save') {
        this.saveErrors.delete(id);
      } else if (type === 'submit') {
        this.submitErrors.delete(id);
      }
    } else {
      // we didn't specify a type, so remove from the first one we find
      if (!this.saveErrors.delete(id)) {
        this.submitErrors.delete(id);
      }
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
