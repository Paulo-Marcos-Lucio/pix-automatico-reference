package dev.pmlsp.pixauto.infrastructure.security.dpop;

import com.nimbusds.jose.jwk.JWK;

import java.time.Instant;

public record DPoPProof(String htm, String htu, Instant iat, String jti, JWK jwk, String thumbprint) {
}
