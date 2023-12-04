"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageHistory = void 0;
const getPackageHistory = (packageName, packageVersion, registry) => {
    return registry.getPackage(packageName, packageVersion);
    // add logic to retrieve version-specific data from your storage system.
};
exports.getPackageHistory = getPackageHistory;
//# sourceMappingURL=packageHistory.js.map