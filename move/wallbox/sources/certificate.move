module wallbox::certificate;

use std::string::{Self, String};
use sui::clock::Clock;
use sui::event;
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

public struct AgentRunCertificate has key, store {
    id: UID,
    run_id: String,
    agent_id: String,
    capsule_hash: String,
    walrus_blob_id: String,
    schema_version: String,
    created_at_ms: u64,
}

public struct CertificateCreated has copy, drop {
    certificate_id: address,
    run_id: String,
    agent_id: String,
    capsule_hash: String,
    walrus_blob_id: String,
    schema_version: String,
    created_at_ms: u64,
}

public entry fun create_certificate(
    run_id: String,
    agent_id: String,
    capsule_hash: String,
    walrus_blob_id: String,
    schema_version: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let cert = AgentRunCertificate {
        id: object::new(ctx),
        run_id: clone_string(&run_id),
        agent_id: clone_string(&agent_id),
        capsule_hash: clone_string(&capsule_hash),
        walrus_blob_id: clone_string(&walrus_blob_id),
        schema_version: clone_string(&schema_version),
        created_at_ms: clock.timestamp_ms(),
    };

    event::emit(CertificateCreated {
        certificate_id: object::uid_to_address(&cert.id),
        run_id,
        agent_id,
        capsule_hash,
        walrus_blob_id,
        schema_version,
        created_at_ms: cert.created_at_ms,
    });

    transfer::public_transfer(cert, tx_context::sender(ctx));
}

fun clone_string(value: &String): String {
    string::utf8(*string::bytes(value))
}
