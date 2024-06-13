//
//  BLEPeripheralManager.swift
//  ariesbifold
//
//  Created by amishfaldu on 6/7/24.
//

import Foundation
import CoreBluetooth
import UIKit

@objc(BleAdvertise)
class BleAdvertise: RCTEventEmitter, CBPeripheralManagerDelegate {
    
  var peripheralManager: CBPeripheralManager!
  var customService: CBMutableService!
    
  // Define your Service and Characteristic UUIDs
  var serviceUUID: CBUUID!
  var characteristicUUID: CBUUID!
  var deviceName: String!
  
  var startAdvertisePromise: RCTPromiseResolveBlock?
  var startAdvertiseReject: RCTPromiseRejectBlock?
  
//  @objc
//  static var sharedInstance: BleAdvertise?
    
  override init() {
          deviceName = UIDevice.current.name // Fetch the device name
          super.init()
          peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
//          BleAdvertise.sharedInstance = self
      }
    
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            print("Bluetooth is powered on and ready to use")
//            startAdvertising()
        } else {
            print("Bluetooth is not available")
        }
    }
  
  @objc func setCompanyId(_ companyId: Int64) {
    
  }

  @objc(broadcast:characteristicUUID:config:resolver:rejecter:)
  func broadcast(serviceUUIDString: String, characteristicUUIDString: String, config: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        serviceUUID = CBUUID(string: serviceUUIDString)
        characteristicUUID = CBUUID(string: characteristicUUIDString)
        let characteristic = CBMutableCharacteristic(
            type: characteristicUUID,
            properties: [.read, .write, .notify],
            value: nil,
            permissions: [.readable, .writeable]
        )
        
        customService = CBMutableService(type: serviceUUID, primary: true)
        customService.characteristics = [characteristic]
        
        peripheralManager.add(customService)
        
        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: [serviceUUID],
            CBAdvertisementDataLocalNameKey: deviceName
        ]
        peripheralManager.startAdvertising(advertisementData)
        
    print("Started advertising service with UUID: \(String(describing: serviceUUID))")
    }
  
  @objc(stopBroadcast)
  func stopBroadcast() {
        peripheralManager.stopAdvertising()
        print("Stopped advertising")
    }
    
    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            print("Error adding service: \(error.localizedDescription)")
        } else {
            print("Service added successfully")
        }
    }
    
    func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
        if let error = error {
            print("Error starting advertising: \(error.localizedDescription)")
        } else {
            print("Started advertising successfully")
        }
    }
  
    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
        // Handle read request
        if request.characteristic.uuid == characteristicUUID {
            // request.value = characteristic.value
            peripheralManager.respond(to: request, withResult: .success)
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        // Handle write requests
        for request in requests {
            if request.characteristic.uuid == characteristicUUID {
                if let value = request.value {
//                    characteristic.value = value
                    // Notify React Native about the received data
                  sendEvent(withName: "onRead", body: ["data": String(decoding:value, as: UTF8.self)])
                    peripheralManager.respond(to: request, withResult: .success)
                }
            }
        }
    }
    
  override func supportedEvents() -> [String]! {
          return ["onRead"]
      }
      
      override class func requiresMainQueueSetup() -> Bool {
          return true
      }

  }

  extension Data {
      var hexString: String {
          return map { String(format: "%02x", $0) }.joined()
      }
  }
