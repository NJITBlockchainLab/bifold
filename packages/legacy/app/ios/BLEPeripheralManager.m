//
//  BLEPeripheralManager.m
//  ariesbifold
//
//  Created by amishfaldu on 6/7/24.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BleAdvertise, NSObject)
RCT_EXTERN_METHOD(setCompanyId:(NSInteger *)companyId)
RCT_EXTERN_METHOD(broadcast:(NSString *)serviceUUID characteristicUUID:(NSString *)characteristicUUID config:(NSDictionary *)config resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopBroadcast)
@end
