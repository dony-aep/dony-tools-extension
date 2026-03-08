/**
 * TypeScript declarations for Adobe CEP CSInterface.js
 * Based on CSInterface v6.1.0+ API
 */

declare class CSInterface {
  /** Returns the unique identifier of this extension */
  getExtensionID(): string;

  /** Retrieves a system path */
  getSystemPath(pathType: string): string;

  /**
   * Evaluates an ExtendScript expression and returns the result via callback
   */
  evalScript(script: string, callback?: (result: string) => void): void;

  /** Registers an event listener for a CEP event */
  addEventListener(type: string, listener: (event: CSEvent) => void): void;

  /** Removes a registered event listener */
  removeEventListener(type: string, listener: (event: CSEvent) => void): void;

  /** Dispatches an event */
  dispatchEvent(event: CSEvent): void;

  /** Sets the flyout menu XML */
  setPanelFlyoutMenu(menuXML: string): void;

  /** Opens a URL in the default browser */
  openURLInDefaultBrowser(url: string): void;

  /** Gets the host environment info */
  getHostEnvironment(): HostEnvironment;

  /** Gets the current API version */
  getCurrentApiVersion(): ApiVersion;

  /** Closes the extension */
  closeExtension(): void;

  /** Requests opening of an extension panel */
  requestOpenExtension(extensionId: string, params?: string): void;

  /** Gets extensions info */
  getExtensions(extensionIds?: string[]): Extension[];

  /** Gets the networking preferences */
  getNetworkPreferences(): NetworkPreferences;

  /** Gets the OS information */
  getOSInformation(): string;

  /** Registers a key events interest */
  registerKeyEventsInterest(keyEventsInterest: string): void;

  /** Sets a script environment variable */
  setScriptEnv(key: string, value: string): void;

  /** Gets a script environment variable */
  getScriptEnv(key: string): string;
}

declare interface CSEvent {
  type: string;
  scope: string;
  appId: string;
  extensionId: string;
  data: string;
}

declare interface HostEnvironment {
  appName: string;
  appVersion: string;
  appLocale: string;
  appUILocale: string;
  appId: string;
  isAppOnline: boolean;
  appSkinInfo: AppSkinInfo;
}

declare interface AppSkinInfo {
  baseFontFamily: string;
  baseFontSize: number;
  appBarBackgroundColor: ColorInfo;
  panelBackgroundColor: ColorInfo;
  appBarBackgroundColorSRGB: ColorInfo;
  panelBackgroundColorSRGB: ColorInfo;
  systemHighlightColor: ColorInfo;
}

declare interface ColorInfo {
  color: RGBColor;
  antialiasLevel: number;
}

declare interface RGBColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

declare interface ApiVersion {
  major: number;
  minor: number;
  micro: number;
}

declare interface Extension {
  id: string;
  name: string;
  mainPath: string;
  basePath: string;
  windowType: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  defaultExtensionDataXml: string;
  specialExtensionDataXml: string;
  requiredRuntimeList: RuntimeInfo[];
  isAutoVisible: boolean;
  isPluginExtension: boolean;
}

declare interface RuntimeInfo {
  name: string;
  version: VersionRange;
}

declare interface VersionRange {
  lowerBound: string;
  upperBound: string;
}

declare interface NetworkPreferences {
  URLScheme: string;
  proxyAddress: string;
  proxyPort: number;
  proxyEnabled: boolean;
}

/** SystemPath constants */
declare const SystemPath: {
  readonly EXTENSION: string;
  readonly USER_DATA: string;
  readonly COMMON_FILES: string;
  readonly MY_DOCUMENTS: string;
  readonly APPLICATION: string;
  readonly HOST_APPLICATION: string;
};

/** CSXSWindowType constants */
declare const CSXSWindowType: {
  readonly _PANEL: string;
  readonly _MODELESS: string;
  readonly _MODAL_DIALOG: string;
};

/** Event scope */
declare const EventScope: {
  readonly CYCLIC: string;
  readonly APPLICATION: string;
  readonly GLOBAL: string;
};

// Extend window with CSInterface availability
interface Window {
  CSInterface: typeof CSInterface;
  SystemPath: typeof SystemPath;
  cep: {
    fs: {
      readFile(path: string): { err: number; data: string };
      writeFile(path: string, data: string): { err: number };
      stat(path: string): { err: number; data: { isFile: () => boolean; isDirectory: () => boolean } };
      readdir(path: string): { err: number; data: string[] };
      makedir(path: string): { err: number };
      rename(oldPath: string, newPath: string): { err: number };
      deleteFile(path: string): { err: number };
    };
    encoding: {
      readonly UTF8: string;
      readonly Base64: string;
    };
    process: {
      stdout: string;
      stderr: string;
      isRunning: boolean;
      pid: number;
    };
    util: {
      openURLInDefaultBrowser(url: string): void;
      registerExtensionUnloadCallback(callback: () => void): void;
      storeProxyCredentials(username: string, password: string): void;
    };
  };
}
