"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestPackage = void 0;
const ingestPackage = (packageName, packageVersion, data, registry) => {
    registry.registerPackage(packageName, packageVersion, data);
    // Add your logic to store the package data in your storage system (e.g., database).
    // You will need to implement this part based on your specific storage solution.
};
exports.ingestPackage = ingestPackage;
//# sourceMappingURL=ingestion.js.map