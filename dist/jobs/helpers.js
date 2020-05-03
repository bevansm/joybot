"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHex = (hex) => RegExp(`^#(?:[0-9a-fA-F]{3}){1,2}$`).test(hex);
exports.areEqual = (str1, str2) => str1.toUpperCase() === str2.toUpperCase();
//# sourceMappingURL=helpers.js.map