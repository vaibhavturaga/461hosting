// Define types for different package representations
type FolderPackage = { type: 'folder'; path: string };
type GzippedTarballPackage = { type: 'gzippedTarball'; tarballPath: string; folderPath: string };
type URLPackage = { type: 'url'; url: string };
type PublishedOnRegistryPackage = { type: 'publishedOnRegistry'; packageName: string; packageVersion: string };
type TaggedVersionPackage = { type: 'taggedVersion'; tagName: string };
type LatestTagPackage = { type: 'latestTag'; packageName: string };
type GitURLPackage = { type: 'gitURL'; gitURL: string };

// Union type to represent different package types
export type PackageData =
  | FolderPackage
  | GzippedTarballPackage
  | URLPackage
  | PublishedOnRegistryPackage
  | TaggedVersionPackage
  | LatestTagPackage
  | GitURLPackage;

export class PackageRegistry {
  private packages: Map<string, Map<string, PackageData>>;

  constructor() {
    this.packages = new Map();
  }

  registerPackage(packageName: string, packageVersion: string, data: PackageData) {
    if (!this.packages.has(packageName)) {
      this.packages.set(packageName, new Map());
    }

    this.packages.get(packageName)?.set(packageVersion, data);
  }

  getPackage(packageName: string, packageVersion: string): PackageData | undefined {
    if (this.packages.has(packageName)) {
      return this.packages.get(packageName)?.get(packageVersion);
    }
    return undefined;
  }
}
