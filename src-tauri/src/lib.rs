use std::{fs, str::FromStr};
use anyhow::Context;
use iroh::key::SecretKey;

/// The ALPN for the lan party.
///
/// It is basically just passing data through 1:1, except that the connecting
/// side will send a fixed size handshake to make sure the stream is created.
pub const ALPN: &[u8] = b"LANPARTYV0";

/// Get the secret key or generate a new one.
///
/// The secret key is stored in a file named `secret.key` in the current directory.
/// If the file exists, the secret key is read from it. Otherwise, a new secret key is generated
/// and stored in the file.
pub fn get_or_create_secret() -> anyhow::Result<SecretKey> {
    let path = "secret.key";
    match fs::exists(path) {
      Ok(true) => {
        let secret = fs::read(path).context("failed to read secret key")?;
        let secret = String::from_utf8(secret).context("invalid secret key")?;
        SecretKey::from_str(&secret).context("invalid secret")
      }
      Ok(false) => {
        let key = SecretKey::generate();
        eprintln!("using secret key {}", key);
        fs::write(path, key.to_string().as_bytes()).context("failed to write secret key")?;
        Ok(key)
      }
      Err(e) => Err(e).context("failed to check for secret key file"),
    }
  }