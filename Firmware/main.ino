#include "Particle.h"

const unsigned long UPDATE_INTERVAL_MS = 600000;
unsigned long lastUpdate = 0;

// Private battery and power service UUID
const BleUuid serviceUuid("00000135-0880-0000-0000-00805f9b34f0");

BleCharacteristic locationCharacteristic("deviceLocation", BleCharacteristicProperty::NOTIFY, BleUuid("00000135-0880-0000-0000-00805f9b3401"), serviceUuid);

void setup() {
	BLE.addCharacteristic(locationCharacteristic);

	BleAdvertisingData advData;

	// Advertise our private service only
	advData.appendServiceUUID(serviceUuid);

  // Set device name
  BLE.setDeviceName("Giving Breadstick");

	// Continuously advertise when not connected
	BLE.advertise(&advData);
}

void loop() {
	if (BLE.connected()) {
		/* TODO:
			Select data format for "secret" assigned for each location and send it to (core.js).
			Update code to parse data sent & format sent from here
		*/
		String locationValue = "ZipCode: 750520";
		locationCharacteristic.setValue(locationValue);
	}
}
