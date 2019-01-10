/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];
  

  return YES;
}

@end
///**
// * Copyright (c) 2015-present, Facebook, Inc.
// * All rights reserved.
// *
// * This source code is licensed under the BSD-style license found in the
// * LICENSE file in the root directory of this source tree. An additional grant
// * of patent rights can be found in the PATENTS file in the same directory.
// */
//
//#import "AppDelegate.h"
//
//#import <React/RCTBundleURLProvider.h>
//#import <React/RCTRootView.h>
//#import <PushKit/PushKit.h>
//#import <UIKit/UIKit.h>
//#import "RNNotifications.h"
//#import "RNCallKit.h"
//
//
//@implementation AppDelegate
//
//- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
//{
//  NSURL *jsCodeLocation;
//
//  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
//
////  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
////                                                      moduleName:@"TelemedicineDemo"
////                                               initialProperties:nil
////                                                   launchOptions:launchOptions];
//
//  // Initialise RNCallKit
//  RNCallKit *rncallkit = [[RNCallKit alloc] init];
//
//  // Initialise React Bridge with RNCallKit
//  RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
//                                            moduleProvider:^{ return @[rncallkit]; }
//                                             launchOptions:launchOptions];
//
//  // Initialise React Root View with React Bridge you've just created
//  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
//                                                   moduleName:@"TelemedicineDemo"
//                                            initialProperties:nil];
//
//  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
//
//  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
//  UIViewController *rootViewController = [UIViewController new];
//  rootViewController.view = rootView;
//  self.window.rootViewController = rootViewController;
//  [self.window makeKeyAndVisible];
//
//  UIUserNotificationType types = UIUserNotificationTypeSound | UIUserNotificationTypeAlert;
//  UIUserNotificationSettings *mySettings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
//  [[UIApplication sharedApplication] registerUserNotificationSettings:mySettings];
//
//  return YES;
//}
//
//  // PushKit API Support
//- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type
//{
//  [RNNotifications didUpdatePushCredentials:credentials forType:type];
//}
//
//- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type
//{
//  [RNNotifications didReceiveRemoteNotification:payload.dictionaryPayload];
//}
//
//@end
