export const errorRes = (message: string, type: 'error' | 'warning', data?: object) => ({
    message,
    type,
    data,
});
