import * as ios from './pushnotifications.ios';
import * as android from './pushnotifications.ios';

declare var _test: typeof ios;
declare var _test: typeof android;

/// export to get the shape of the module
export * from './pushnotifications.ios';
