"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageRegistry = void 0;
class PackageRegistry {
    constructor() {
        this.packages = new Map();
    }
    registerPackage(packageName, packageVersion, data) {
        var _a;
        if (!this.packages.has(packageName)) {
            this.packages.set(packageName, new Map());
        }
        (_a = this.packages.get(packageName)) === null || _a === void 0 ? void 0 : _a.set(packageVersion, data);
    }
    getPackage(packageName, packageVersion) {
        var _a;
        if (this.packages.has(packageName)) {
            return (_a = this.packages.get(packageName)) === null || _a === void 0 ? void 0 : _a.get(packageVersion);
        }
        return undefined;
    }
}
exports.PackageRegistry = PackageRegistry;
//# sourceMappingURL=packageRegistry.js.map