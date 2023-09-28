"use strict";

var secret = {
  load: function () {
    return new Promise(function (values) {
      var enc_notes = "decruptoin content should be there";
      return retrieveKey().then(function (key) {
        var alg = {name: "AES-GCM", iv: nonce};

        // Decrypt our notes using the stored |nonce|.
        return crypto.subtle.decrypt(alg, key, enc_notes)
          .then(decode, function (err) {
            throw "Integrity/Authenticity check failed! Invalid password?";
          });
      });
    });
  },

  save: function (notes) {
    var buffer = encode(notes);

    return retrieveKey().then(function (key) {
      // Set up parameters.
      // var nonce = crypto.getRandomValues(new Uint8Array(16));
      var nonce = new Uint8Array(1);
      var alg = {name: "AES-GCM", iv: nonce};

      // Encrypt |notes| under |key| using AES-GCM.
      return crypto.subtle.encrypt(alg, key, buffer)
        .then(function (notes_enc) {
          console.log("================== Encrypted Content ==================");
          console.log(notes_enc);

debugger;
          let u8 = new Uint8Array(notes_enc);
          const ctArray = Array.from(u8);                              // ciphertext as byte array
          const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
      
          console.log("enc => ", btoa(ctStr));    

          const ctArray1 = ctStr.split('').map(char => char.charCodeAt(0));
          const notes_enc11 = new Uint8Array(ctArray1);

          console.log(notes_enc11);
debugger;

          return crypto.subtle.decrypt(alg, key, notes_enc11)
          .then(decode, function (err) {
            throw "Integrity/Authenticity check failed! Invalid password?";
          });
        });
    });
  }
};

function retrieveKey() {
  var params = Promise.all([
    // Get base key and salt.
    retrievePWKey(), getSalt()
  ]);

  return params.then(function (values) {
    var pwKey = values[0];
    var salt = values[1];

    // Do the PBKDF2 dance.
    return deriveKey(pwKey, salt);
  });
}

function deriveKey(pwKey, salt) {
  var params = {
    name: "PBKDF2",

    // TODO NSS does unfortunately not support PBKDF2 with anything
    // other than SHA-1 for now. Update this to SHA-256 once we support it.
    hash: "SHA-256",
    salt: salt,

    // The more iterations the slower, but also more secure.
    iterations: 50000
  };

  // The derived key will be used to encrypt with AES.
  var alg = {name: "AES-GCM", length: 256};
  var usages = ["encrypt", "decrypt"];

  return crypto.subtle.deriveKey(
    params, pwKey, alg, false, usages);
}

function retrievePWKey() {
  // We will derive a new key from it.
  var usages = ["deriveKey"];
  var buffer = encode(prompt("Please enter your password"));
  return crypto.subtle.importKey("raw", buffer, "PBKDF2", false, usages);
}

function getSalt() {
    return new Promise((resolve) => {
      // We should generate at least 8 bytes
      // to allow for 2^64 possible variations.
      var salt = crypto.getRandomValues(new Uint8Array(8));
      resolve(salt)
    })
}

function encode(str) {
  return new TextEncoder("utf-8").encode(str);
}

function decode(buf) {
  return new TextDecoder("utf-8").decode(new Uint8Array(buf));
}

window.addEventListener('DOMContentLoaded', function() {
  secret.save("This is mysldkfjldsfjslkfsddsj sdlfjdsklfjdslkjfdsaf lksdfkldsklfdsjlf sdlflkdsfjkds fsdlkfjlkdsfj  name.").then((secretTest) => {
    console.log("secretTest ", secretTest);
  });
});
