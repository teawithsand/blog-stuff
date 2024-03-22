export const b64encode = (data: string) => {
    return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1 as any);
    }));
}F