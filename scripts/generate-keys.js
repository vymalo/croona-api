const forge = require('node-forge');
const fse = require('fs-extra');

const makeNumberPositive = (hexString) => {
  let mostSignificativeHexDigitAsInt = parseInt(hexString[0], 16);

  if (mostSignificativeHexDigitAsInt < 8) return hexString;

  mostSignificativeHexDigitAsInt -= 8;
  return mostSignificativeHexDigitAsInt.toString() + hexString.substring(1);
};

// Generate a random serial number for the Certificate
const randomSerialNumber = () => {
  return makeNumberPositive(
    forge.util.bytesToHex(forge.random.getBytesSync(20)),
  );
};

// Get the Not Before Date for a Certificate (will be valid from 2 days ago)
const getCertNotBefore = () => {
  let twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
  let year = twoDaysAgo.getFullYear();
  let month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0');
  let day = twoDaysAgo.getDate();
  return new Date(`${year}-${month}-${day} 00:00:00Z`);
};

// Get Certificate Expiration Date (Valid for 90 Days)
const getCertNotAfter = (notBefore) => {
  let ninetyDaysLater = new Date(
    notBefore.getTime() + 60 * 60 * 24 * 90 * 1000,
  );
  let year = ninetyDaysLater.getFullYear();
  let month = (ninetyDaysLater.getMonth() + 1).toString().padStart(2, '0');
  let day = ninetyDaysLater.getDate();
  return new Date(`${year}-${month}-${day} 23:59:59Z`);
};

// Get CA Expiration Date (Valid for 100 Years)
const getCANotAfter = (notBefore) => {
  let year = notBefore.getFullYear() + 100;
  let month = (notBefore.getMonth() + 1).toString().padStart(2, '0');
  let day = notBefore.getDate();
  return new Date(`${year}-${month}-${day} 23:59:59Z`);
};

const DEFAULT_C = 'Australia';
const DEFAULT_ST = 'Victoria';
const DEFAULT_L = 'Melbourne';

class CertificateGeneration {
  static CreateRootCA() {
    // Create a new Keypair for the Root CA
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

    // Define the attributes for the new Root CA
    const attributes = [
      {
        shortName: 'C',
        value: DEFAULT_C,
      },
      {
        shortName: 'ST',
        value: DEFAULT_ST,
      },
      {
        shortName: 'L',
        value: DEFAULT_L,
      },
      {
        shortName: 'CN',
        value: 'My Custom Testing RootCA',
      },
    ];

    const extensions = [
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        cRLSign: true,
      },
    ];

    // Create an empty Certificate
    const cert = forge.pki.createCertificate();

    // Set the Certificate attributes for the new Root CA
    cert.publicKey = publicKey;
    cert.privateKey = privateKey;
    cert.serialNumber = randomSerialNumber();
    cert.validity.notBefore = getCertNotBefore();
    cert.validity.notAfter = getCANotAfter(cert.validity.notBefore);
    cert.setSubject(attributes);
    cert.setIssuer(attributes);
    cert.setExtensions(extensions);

    // Self-sign the Certificate
    cert.sign(privateKey, forge.md.sha512.create());

    // Convert to PEM format
    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(privateKey);

    // Return the PEM encoded cert and private key
    return {
      certificate: pemCert,
      privateKey: pemKey,
      notBefore: cert.validity.notBefore,
      notAfter: cert.validity.notAfter,
    };
  }

  static CreateHostCert(hostCertCN, validDomains, rootCAObject) {
    if (!hostCertCN.toString().trim())
      throw new Error('"hostCertCN" must be a String');
    if (!Array.isArray(validDomains))
      throw new Error('"validDomains" must be an Array of Strings');
    if (
      !rootCAObject ||
      !rootCAObject.hasOwnProperty('certificate') ||
      !rootCAObject.hasOwnProperty('privateKey')
    )
      throw new Error(
        '"rootCAObject" must be an Object with the properties "certificate" & "privateKey"',
      );

    // Convert the Root CA PEM details, to a forge Object
    let caCert = forge.pki.certificateFromPem(rootCAObject.certificate);
    let caKey = forge.pki.privateKeyFromPem(rootCAObject.privateKey);

    // Create a new Keypair for the Host Certificate
    const hostKeys = forge.pki.rsa.generateKeyPair(2048);

    // Define the attributes/properties for the Host Certificate
    const attributes = [
      {
        shortName: 'C',
        value: DEFAULT_C,
      },
      {
        shortName: 'ST',
        value: DEFAULT_ST,
      },
      {
        shortName: 'L',
        value: DEFAULT_L,
      },
      {
        shortName: 'CN',
        value: hostCertCN,
      },
    ];

    const extensions = [
      {
        name: 'basicConstraints',
        cA: false,
      },
      {
        name: 'nsCertType',
        server: true,
      },
      {
        name: 'subjectKeyIdentifier',
      },
      {
        name: 'authorityKeyIdentifier',
        authorityCertIssuer: true,
        serialNumber: caCert.serialNumber,
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
      },
      {
        name: 'subjectAltName',
        altNames: validDomains.map((domain) => {
          return { type: 2, value: domain };
        }),
      },
    ];

    // Create an empty Certificate
    let newHostCert = forge.pki.createCertificate();

    // Set the attributes for the new Host Certificate
    newHostCert.publicKey = hostKeys.publicKey;
    newHostCert.serialNumber = randomSerialNumber();
    newHostCert.validity.notBefore = getCertNotBefore();
    newHostCert.validity.notAfter = getCertNotAfter(
      newHostCert.validity.notBefore,
    );
    newHostCert.setSubject(attributes);
    newHostCert.setIssuer(caCert.subject.attributes);
    newHostCert.setExtensions(extensions);

    // Sign the new Host Certificate using the CA
    newHostCert.sign(caKey, forge.md.sha512.create());

    // Convert to PEM format
    let pemHostCert = forge.pki.certificateToPem(newHostCert);
    let pemHostKey = forge.pki.privateKeyToPem(hostKeys.privateKey);

    return {
      certificate: pemHostCert,
      privateKey: pemHostKey,
      notBefore: newHostCert.validity.notBefore,
      notAfter: newHostCert.validity.notAfter,
    };
  }
}

let CA = CertificateGeneration.CreateRootCA();

/* The following certificate:
	- Will be called 'testing.com'.
	- Will be valid for 'testing.com' and 'test.com'.
	- Will be signed by the CA we just created above.
*/
let hostCert = CertificateGeneration.CreateHostCert(
  'testing.com',
  ['testing.com', 'test.com'],
  CA,
);

// Saving Root CA certificate and private key to files
fse.outputFileSync('RootCACertificate.pem', CA.certificate);
fse.outputFileSync('RootCAPrivateKey.pem', CA.privateKey);

// Saving host certificate and private key to files
fse.outputFileSync('HostCertificate.pem', hostCert.certificate);
fse.outputFileSync('HostPrivateKey.pem', hostCert.privateKey);
