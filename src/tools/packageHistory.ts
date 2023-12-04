import { PackageRegistry, PackageData } from './packageRegistry';

export const getPackageHistory = (
  packageName: string,
  packageVersion: string,
  registry: PackageRegistry
): PackageData | undefined => {
  return registry.getPackage(packageName, packageVersion);
  // add logic to retrieve version-specific data from your storage system.
};