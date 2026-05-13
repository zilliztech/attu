# Run Attu with local Milvus mutual TLS in Docker

This guide shows how to run Attu against a local Milvus standalone deployment with mutual TLS (mTLS) enabled. It is intended for local development and verification.

Tested with:

- `milvusdb/milvus:v3.0-beta`
- `zilliz/attu:v3.0.0-beta.4`
- A Docker Compose Milvus deployment using the Docker network named `milvus`

> Do not reuse these self-signed certificate commands for production as-is. For production, use certificates issued and rotated by your organization's CA or secret-management system.

## 1. Generate local TLS certificates

The commands below create a local CA, a Milvus server certificate, and an Attu client certificate under `~/workspace/volumes/milvus/tls`.

The server certificate includes `standalone` in the Subject Alternative Name (SAN), because the Attu container connects to Milvus through Docker DNS at `standalone:19530` in the examples below.

```bash
CERT_DIR="$HOME/workspace/volumes/milvus/tls"
mkdir -p "$CERT_DIR"

cat > "$CERT_DIR/openssl.cnf" <<'EOF'
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[ dn ]
C = US
ST = CA
L = Local
O = Milvus Local Test
OU = Attu TLS Test
CN = milvus-standalone

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ v3_req ]
basicConstraints = CA:false
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = milvus-standalone
DNS.2 = standalone
DNS.3 = localhost
DNS.4 = milvus
DNS.5 = host.docker.internal
IP.1 = 127.0.0.1
IP.2 = ::1

[ v3_client ]
basicConstraints = CA:false
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
EOF

openssl genrsa -out "$CERT_DIR/ca.key" 4096
openssl req -x509 -new -nodes -key "$CERT_DIR/ca.key" -sha256 -days 3650 \
  -subj "/C=US/ST=CA/L=Local/O=Milvus Local Test/OU=Attu TLS Test/CN=Milvus Local Test CA" \
  -out "$CERT_DIR/ca.pem" \
  -extensions v3_ca -config "$CERT_DIR/openssl.cnf"

openssl genrsa -out "$CERT_DIR/server.key" 2048
openssl req -new -key "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" \
  -subj "/C=US/ST=CA/L=Local/O=Milvus Local Test/OU=Attu TLS Test/CN=milvus-standalone" \
  -config "$CERT_DIR/openssl.cnf"
openssl x509 -req -in "$CERT_DIR/server.csr" -CA "$CERT_DIR/ca.pem" -CAkey "$CERT_DIR/ca.key" -CAcreateserial \
  -out "$CERT_DIR/server.pem" -days 3650 -sha256 -extensions v3_req -extfile "$CERT_DIR/openssl.cnf"

openssl genrsa -out "$CERT_DIR/client.key" 2048
openssl req -new -key "$CERT_DIR/client.key" -out "$CERT_DIR/client.csr" \
  -subj "/C=US/ST=CA/L=Local/O=Milvus Local Test/OU=Attu TLS Test/CN=attu-client" \
  -config "$CERT_DIR/openssl.cnf"
openssl x509 -req -in "$CERT_DIR/client.csr" -CA "$CERT_DIR/ca.pem" -CAkey "$CERT_DIR/ca.key" -CAcreateserial \
  -out "$CERT_DIR/client.pem" -days 3650 -sha256 -extensions v3_client -extfile "$CERT_DIR/openssl.cnf"

chmod 755 "$CERT_DIR"
chmod 644 "$CERT_DIR"/*.pem "$CERT_DIR"/*.key
ls -l "$CERT_DIR"
```

Expected files:

- `ca.pem` — CA certificate used by Attu to verify Milvus.
- `server.pem` / `server.key` — Milvus server certificate and private key.
- `client.pem` / `client.key` — Attu client certificate and private key for mTLS.

## 2. Enable mTLS in Milvus Docker Compose

In the Milvus `docker-compose.yml`, configure the `standalone` service to enable two-way TLS and point Milvus at the certificate files mounted under `/var/lib/milvus/tls`.

Example `standalone` service fragment:

```yaml
services:
  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v3.0-beta
    command: ["milvus", "run", "standalone"]
    security_opt:
      - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
      MQ_TYPE: woodpecker
      COMMON_SECURITY_TLSMODE: 2
      PROXY_HTTP_ENABLED: "false"
      TLS_SERVERPEMPATH: /var/lib/milvus/tls/server.pem
      TLS_SERVERKEYPATH: /var/lib/milvus/tls/server.key
      TLS_CAPEMPATH: /var/lib/milvus/tls/ca.pem
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - etcd
      - minio

networks:
  default:
    name: milvus
```

Notes:

- `COMMON_SECURITY_TLSMODE: 2` enables Milvus external gRPC mutual TLS.
- `TLS_SERVERPEMPATH`, `TLS_SERVERKEYPATH`, and `TLS_CAPEMPATH` configure the server cert/key and CA.
- `PROXY_HTTP_ENABLED: "false"` avoids Milvus trying to share the same port for proxy HTTP and external gRPC when TLS mode is enabled.
- The Compose network name is `milvus`; Attu joins this network in the `docker run` command below.

Restart Milvus:

```bash
docker compose -f ~/workspace/docker-compose.yml up -d
docker compose -f ~/workspace/docker-compose.yml ps
```

Wait until `milvus-standalone` is healthy.

## 3. Pull the Attu image

```bash
docker pull zilliz/attu:v3.0.0-beta.4
```

## 4. Start Attu with the mTLS connection pre-configured

This command starts Attu, mounts the generated certificates read-only, and creates a default Milvus connection on first launch.

```bash
docker rm -f attu-tls-test >/dev/null 2>&1 || true && \
docker run -d \
  --name attu-tls-test \
  --network milvus \
  -p 3000:3000 \
  -v "$HOME/workspace/volumes/milvus/tls:/etc/attu/certs:ro" \
  -e ATTU_DB_PATH=/tmp/attu-tls-test.db \
  -e MILVUS_NAME=milvus-mtls-local \
  -e MILVUS_ADDRESS=standalone:19530 \
  -e MILVUS_SSL=true \
  -e MILVUS_TLS_ROOT_CERT_PATH=/etc/attu/certs/ca.pem \
  -e MILVUS_TLS_PRIVATE_KEY_PATH=/etc/attu/certs/client.key \
  -e MILVUS_TLS_CERT_CHAIN_PATH=/etc/attu/certs/client.pem \
  -e MILVUS_TLS_SERVER_NAME=standalone \
  zilliz/attu:v3.0.0-beta.4
```

Open Attu at <http://localhost:3000>.

For a persistent Attu database, replace the temporary DB path with a named volume:

```bash
-v attu-data:/data \
-e ATTU_DB_PATH=/data/attu.db \
```

The pre-configured connection is inserted only once per Attu database. If you change TLS environment variables and reuse the same `ATTU_DB_PATH`, edit the connection in the UI or start with a fresh Attu database.

## 5. Optional command-line verification

After `attu-tls-test` starts, you can verify the exact same mTLS settings from inside the Attu container with the Milvus Node.js SDK bundled in the image:

```bash
docker exec attu-tls-test sh -lc 'cd /app/.output/server && node -e "import(\"@zilliz/milvus2-sdk-node\").then(async ({ MilvusClient }) => { const client = new MilvusClient({ address: \"standalone:19530\", ssl: true, tls: { rootCertPath: \"/etc/attu/certs/ca.pem\", privateKeyPath: \"/etc/attu/certs/client.key\", certChainPath: \"/etc/attu/certs/client.pem\", serverName: \"standalone\" } }); const result = await client.listCollections(); console.log(JSON.stringify(result, null, 2)); await client.closeConnection(); }).catch((error) => { console.error(error); process.exit(1); })"'
```

A successful response includes `status.error_code: "Success"` and the current collection list.

## Troubleshooting

### `proxy server(http) and external grpc server share the same port, tls mode must be 0`

Set `PROXY_HTTP_ENABLED: "false"` in the Milvus `standalone` service, or configure proxy HTTP to use a different port.

### Hostname verification fails

Make sure the value of `MILVUS_TLS_SERVER_NAME` matches a DNS name in the server certificate SAN list. In this guide, Attu connects to `standalone:19530`, so `MILVUS_TLS_SERVER_NAME=standalone` is used.

### mTLS handshake fails

Check that:

- Milvus is running with `COMMON_SECURITY_TLSMODE: 2`.
- Attu has all three mTLS paths set:
  - `MILVUS_TLS_ROOT_CERT_PATH`
  - `MILVUS_TLS_PRIVATE_KEY_PATH`
  - `MILVUS_TLS_CERT_CHAIN_PATH`
- The Attu certificate mount is readable inside the container:

```bash
docker exec attu-tls-test ls -l /etc/attu/certs
```

### Attu starts but the default connection does not change

The default connection created from `MILVUS_ADDRESS` is inserted only once per Attu SQLite database. Remove the test container and use a fresh `ATTU_DB_PATH`, or edit the saved connection in the UI.
