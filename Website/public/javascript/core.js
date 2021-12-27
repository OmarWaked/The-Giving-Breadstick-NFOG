// Moralis init code
const serverUrl = "SERVER_URL"; //REPLACE WITH YOUR OWN SERVER URL
const appId = "APP_ID"; //REPLACE WITH YOUR OWN APP ID
var userEthAddres;
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

//Global variables
var deviceSecretData;
var characteristic;

// Authentication code
async function connectWallet() {
  if (!user) {
    user = await Moralis.authenticate({
			signingMessage: "Log into your wallet"
		})
	    .then(function (user) {
				document.getElementById("connectButton").innerHTML = "Disconnect Wallet";
				userEthAddres = user.get("ethAddress");
	    })
	    .catch(function (error) {
	      console.log(error);
	    });
  } else {
		await Moralis.User.logOut();
		console.log("logged out");
		document.getElementById("connectButton").innerHTML = "Connect Wallet";
	}
}

//Update DOM elements based on state of wallet connection
window.onload = function() {
	if (user) {
		document.getElementById("connectButton").innerHTML = "Disconnect Wallet";
	} else {
		document.getElementById("connectButton").innerHTML = "Connect Wallet";
	}
}

//Check if user is connected to wallet, then open up web BLE search
function verifyLocation() {
	if (user) {
		if (navigator.bluetooth) {
			findBLEDevice();
		} else {
			presentError("Error", "This website requires Website BLE. Please try again on a browser that provides BLE support.", "error", "Close");
		}
	} else {
		presentError("Error", "You must connect a wallet before scanning for The Giving Breadstick", "error", "Close");
	}
}

//Filter and locate BLE device of interest
async function findBLEDevice() {
	try {
		//Request BLE device with specific UUID (ensure this matches the UUID in the device code (main.ino))
		const bleUUID = "00000135-0880-0000-0000-00805f9b34f0";
		const device = await navigator.bluetooth.requestDevice({filters: [{services: [bleUUID]}]});

		//Connect to GATT server
		const server = await device.gatt.connect();

		//Get private services
		const service = await server.getPrimaryService(bleUUID);

		//Get data from BLE device (ensure the characteristic ID matches the id in the device code (main.ino))
		characteristic = await service.getCharacteristic("00000135-0880-0000-0000-00805f9b3401");
		await characteristic.startNotifications();
		characteristic.addEventListener('characteristicvaluechanged', handleDeviceNotifications);
		await characteristic.startNotifications();
	} catch(error) {
		presentError("Error", error, "error", "Close");
	}
}

//Handle
function handleDeviceNotifications(event) {
	/*TODO:
		Parse data sent from device (main.ino)
		Extract location from data
	*/

	deviceSecretData = event.target.value;

	characteristic.stopNotifications().then(_ => {
    characteristic.removeEventListener('characteristicvaluechanged', selectToken(deviceSecretData));
  });
}

//Search for smart contract with matching code sent from device
async function selectToken(){
	/*TODO:
		Query smart contract/database/etc with secret code sent from the device (oliveGardenLocationSecretData)
		Verify connected wallet did not already claim a erc721 token previously
		Transefer erc721 to user using the function transferToken(tokenType, receiverAddress, contractAddress, tokenID)
	*/
}

//Transfers a given token to the recieverAddress
async function transferToken(tokenType, receiverAddress, contractAddress, tokenID){
	//Send the erc721 token to user's wallet
	const options = {
		type: tokenType,
		receiver: receiverAddress,
		contractAddress: contractAddress,
		tokenId: tokenID
	}

	let result = await Moralis.transfer(options);

	result
	.on("confirmation", (confirmationNumber, receipt) => {
		console.log('NFT confirmation');
		//Inform user they got their erc721 token sent to their wallet
		presentAlert(location);
	})
	.on("error", (error) => {
		//Something went wrong, inform the user
		presentError("Error", error, "error", "Close");
	});
}


//Display alert informing the suer they found and got their erc721 token
function presentAlert(location){
	Swal.fire({
    title: "WYHYF!",
    html: "You found the inconspicuous breadstick at " + location + "! The NFT will be sent to your connected wallet.",
    icon: "success",
    showCancelButton: true,
    cancelButtonText: "Cancel",
		cancelButtonColor: '#d33',
    confirmButtonText: "Next",
		confirmButtonColor: '#3085d6'
  })
}

//Present an alert there was an error
function presentError(title, text, icon, button){
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: button
  })
}
