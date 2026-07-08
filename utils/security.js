export const RegexCheck = {
    /**
     * Checks if string is 3-25 characterss, only alphanumeric and only has spaces
     * @param {string} value - Value to check
     * @returns {boolean} True if valid
     */
    name: (value) => {
        return /^[\p{L}\p{N} ]{3,25}$/u.test(value);
    }
};