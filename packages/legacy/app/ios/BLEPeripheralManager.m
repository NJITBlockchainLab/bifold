//
//  BLEPeripheralManager.m
//  ariesbifold
//
//  Created by amishfaldu on 6/7/24.
//

#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BLEPeripheralManager, NSObject)

RCT_EXTERN_METHOD(startBLEAdvertising)
RCT_EXTERN_METHOD(startAdvertising)

@end

@interface RCT_EXTERN_MODULE(BLEPeripheralManagerBridge, RCTEventEmitter)
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
@end

//
//#import "BLEPeripheralManager.h"
//
//@implementation BLEPeripheralManager
//
//RCT_MODULE_EXPORT();
//
//@end
