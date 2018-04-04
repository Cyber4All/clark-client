export class LearningObjectErrorStoreService {
    private validTypes = ['name', 'outcometext'];
    private status: boolean = false;
    private type?: string;

    set(type: string): void {
        if (this.validTypes.includes(type.toLowerCase())) {
            this.type = type.toLowerCase();
            this.status = true;
        } else {
            console.error('Error! Type must be one of ' + this.validTypes.join(', '));
        }
    }

    clear(): void {
        this.status = false;
        this.type = undefined;
    }

    get error(): string {
        return this.status ? ( this.type ? this.type : undefined ) : undefined;
    }
}
