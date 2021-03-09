export const errorRes = (message: string, type: 'error' | 'warning' | 'info', data?: object) => ({
    message,
    type,
    data,
});
