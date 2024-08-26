const hex2dec = (hex) => parseInt(hex, 16)
const dec2hex = (dec, cell_length) => {
	const parsed = parseInt(dec).mod(2 ** cell_length)
	const result = (+parsed).toString(16).toUpperCase()
	const zeroesCount = Math.log2(cell_length)
	const zeroes = "0".repeat(zeroesCount)

	let number = `${zeroes}${result}`
	number = number.substring(number.length - zeroesCount, number.length)
	return number || `0x${number}`
}
function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

function bin2dec(bin) {
	return parseInt(bin, 2)
}

function tc2dec(bin) {
	return parseInt(bin[0]) === 1 ? -1 * (parseInt(dec2bin(~parseInt(bin, 2)).slice(24, 32), 2) + 1) : bin2dec(bin)
}

Number.prototype.mod = function (n) {
	return ((this % n) + n) % n;
}

function fixN(n, str) {
	const zeroes = "0".repeat(n)
	const result = `${zeroes}${str}`
	return result.substring(result.length - n, result.length)
}

function is_positive(num) {
	//Convert the number to 16 bit binary and see the most significant bit
	return parseInt(fixN(16, dec2bin(hex2dec(num))).charAt(0)) === 0
}

function decimalHexTwosComplement(decimal) {
	//Convert a signed decimal to hex encoded with two's complement
	const size = 8
	var hexadecimal = Math.abs(decimal).toString(16);
	if (decimal >= 0) {
		while ((hexadecimal.length % size) !== 0) {
			hexadecimal = "" + 0 + hexadecimal
		}
		return hexadecimal
	} else {
		while ((hexadecimal.length % size) !== 0) {
			hexadecimal = "" + 0 + hexadecimal
		}
		var output = ''
		for (var i = 0; i < hexadecimal.length; i++) {
			output += (0x0F - parseInt(hexadecimal[i], 16)).toString(16)
		}
		return (0x01 + parseInt(output, 16)).toString(16)
	}
}

const is_negative = (num) => !is_positive(num)

module.exports = { hex2dec, dec2hex, dec2bin, bin2dec, fixN, is_positive, is_negative, tc2dec, decimalHexTwosComplement }
