export const COPY = {
    LEARNINGOBJECTS: 'Learning Objects',
    EMAILVERIFY: 'Verify your email',
    NOOBJECTS: (self?: boolean) => {
        return `${self ? 'You don\'t' : 'This user doesn\'t'} have any released learning objects yet!`;
    },
    CREATE: 'Create a Learning Object!',
    PRINT: 'Print Clark Cards'
};
