use anyhow::Result as AnyhowResult;
use iroh::{protocol::Router, Endpoint};
use iroh_gossip::net::Gossip;
use std::{fs, str::FromStr};
use anyhow::Context;
use iroh::SecretKey;

/// The ALPN for the lan party.
///
/// It is basically just passing data through 1:1, except that the connecting
/// side will send a fixed size handshake to make sure the stream is created.
pub const ALPN: &[u8] = b"LANPARTYV0";

pub async fn init_iroh_endpoint() -> AnyhowResult<Endpoint> {
    let secret_key = get_or_create_secret()?;
    let builder = Endpoint::builder()
        .alpns(vec![ALPN.to_vec()])
        .secret_key(secret_key)
        .discovery_n0();
    let endpoint = builder.bind().await?;
    println!("Listening on {:?}", endpoint.node_addr().await?);
    Ok(endpoint)
} 

pub async fn setup_iroh_router(endpoint: Endpoint) -> AnyhowResult<(Gossip, Router)> {
    // create the gossip protocol
    let gossip = Gossip::builder().spawn(endpoint.clone()).await?;

    // setup router
    let router = Router::builder(endpoint.clone())
        .accept(iroh_gossip::net::GOSSIP_ALPN, gossip.clone())
        .spawn()
        .await?;

    Ok((gossip, router))
}

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
        let key =  SecretKey::generate(rand::rngs::OsRng);
        eprintln!("using secret key {}", key);
        fs::write(path, key.to_string().as_bytes()).context("failed to write secret key")?;
        Ok(key)
      }
      Err(e) => Err(e).context("failed to check for secret key file"),
    }
  }