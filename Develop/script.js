// Assignment Code
var generateBtn = document.querySelector("#generate");

// Write password to the #password input
function writePassword() {
 // var password = generatePassword();
  var passwordText = document.querySelector("#password");

// Created variables for each user choice
var passLength;
var isUpper;
var isLower;
var isSpecial;

  // Asks user for choice
  var userChoice = window.prompt("Enter length of password between 8 and 128");





 
  passwordText.value = password;

}


// Add event listener to generate button
generateBtn.addEventListener("click", writePassword);
