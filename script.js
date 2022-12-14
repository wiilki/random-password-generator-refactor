// Assignment Code
var generateBtn = document.querySelector("#generate");

// Write password to the #password input
function writePassword() {

  // Variables
  var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var specialChar = ["!", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "\:", "\;", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"];
  var lowerLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  var upperLetters = lowerLetters.map(element => {
    return element.toUpperCase();
  });
  var passArray = [];
  var possibleChar = [];
  var wrongNumMsg = "Invalid choice. Choose a number between 8-128";
  var noCharMsg = "You must choose at least 1 character type. Try again!";

  // Existing code
  var password = generatePassword();
  var passwordText = document.querySelector("#password");

  // Prompts for password length. '+' is prompting for a number
  var passLength = +window.prompt("Enter length of password between 8 and 128");

  // While userinput is invalid, user will see wrongMsg
  while (isNaN(passLength) || passLength < 8 || passLength > 128) {
    passLength = +window.prompt(wrongNumMsg);
  }

  // Asks for character type choices. Returns true or false value
  var isUpper = window.confirm("Include uppercase?");
  var isLower = window.confirm("Include lowercase?");
  var isNumber = window.confirm("Include numbers?");
  var isSpecial = window.confirm("Include special characters?");

  // Confirmation of users choices
  var isConfirmed = window.confirm("Confirm your choices \nLength: " + passLength + " \nUppercase: " + isUpper + "\nLowercase:  " + isLower + "\nNumbers: " + isNumber + "\nSpecial characters: " + isSpecial)

  // Message if character type is not chosen or user cancels
  if (!isConfirmed) {
    window.alert("Try again!");
  } else if (!isUpper && !isLower && !isSpecial && !isNumber) {
    window.alert(noCharMsg);
  }

  // Pushes selected character types into one array possibleChar
  if (isUpper) {
    for (var i = 0; i < upperLetters.length; i++) {
      possibleChar.push(upperLetters[i]);
    }
  }

  if (isLower) {
    for (var j = 0; j < lowerLetters.length; j++) {
      possibleChar.push(lowerLetters[j]);
    }
  }

  if (isNumber) {
    for (var k = 0; k < numbers.length; k++) {
      possibleChar.push(numbers[k]);
    }
  }

  if (isSpecial) {
    for (var x = 0; x < specialChar.length; x++) {
      possibleChar.push(specialChar[x]);
    }
  }

  // Pushes random character to passArray for the length of passLength
  for (var y = 0; y < passLength; y++) {
    var randomChar = possibleChar[Math.floor(Math.random() * possibleChar.length)];
    if (randomChar) {
      passArray.push(randomChar);
    } else {
      continue;
    }
  }

  // Assigns passArray to password string
  password = passArray.join("");

  // Prints password to text box
  function generatePassword(passArray) {
    document.getElementById("password").textContent = passArray;

  }

  // Existing code
  passwordText.value = password;

}

// Add event listener to generate button
generateBtn.addEventListener("click", writePassword);