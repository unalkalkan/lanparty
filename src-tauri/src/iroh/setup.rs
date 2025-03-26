use anyhow::Result as AnyhowResult;
use iroh::Endpoint;
use nextauri::{get_or_create_secret, ALPN};

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