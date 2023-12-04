// ingestion.ts
import { PackageRegistry, PackageData } from './packageRegistry';

export const ingestPackage = (
  packageName: string,
  packageVersion: string,
  data: PackageData,
  registry: PackageRegistry
) => {
  registry.registerPackage(packageName, packageVersion, data);
  // Add your logic to store the package data in your storage system (e.g., database).
  // You will need to implement this part based on your specific storage solution.
};
