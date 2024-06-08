//
//  BLEPeripheralManager.swift
//  ariesbifold
//
//  Created by amishfaldu on 6/7/24.
//

import Foundation
import CoreBluetooth

@objc(BLEPeripheralManager)
class BLEPeripheralManager: NSObject, CBPeripheralManagerDelegate {
    
    var peripheralManager: CBPeripheralManager!
    var customService: CBMutableService!
    
    // Define your Service and Characteristic UUIDs
    let serviceUUID = CBUUID(string: "1357d860-1eb6-11ef-9e35-0800200c9a66")
    let characteristicUUID = CBUUID(string: "d918d942-8516-4165-922f-dd6823d32b2f")
    
    @objc func startBLEAdvertising() {
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }
    
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            print("Bluetooth is powered on and ready to use")
            startAdvertising()
        } else {
            print("Bluetooth is not available")
        }
    }
    
  @objc func startAdvertising() {
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
            CBAdvertisementDataLocalNameKey: "MyBLEDevice"
        ]
        peripheralManager.startAdvertising(advertisementData)
        
        print("Started advertising service with UUID: \(serviceUUID)")
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
                  sendEvent(withName: "onDataReceived", body: ["value": String(decoding:value, as: UTF8.self)])
                    peripheralManager.respond(to: request, withResult: .success)
                }
            }
        }
    }
    
    func sendEvent(withName name: String, body: Any) {
        // Send event to React Native
      BLEPeripheralManagerBridge.sharedInstance?.sendEvent(withName: name, body: body)
    }
}

extension Data {
    var hexString: String {
        return map { String(format: "%02x", $0) }.joined()
    }
}

@objc(BLEPeripheralManagerBridge)
class BLEPeripheralManagerBridge: RCTEventEmitter {
    static var sharedInstance: BLEPeripheralManagerBridge?
    
    override init() {
        super.init()
        BLEPeripheralManagerBridge.sharedInstance = self
    }
    
    override func supportedEvents() -> [String]! {
        return ["onDataReceived"]
    }
  
}
