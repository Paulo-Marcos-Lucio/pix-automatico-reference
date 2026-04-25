package dev.pmlsp.pixauto.domain.model;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * End-to-End Identifier do SPI/Pix. Formato: E + 8 digitos ISPB + YYYYMMDDHHmm + 11 caracteres alfanumericos.
 * Total: 32 chars. Referencia: Manual de Tempos SPI.
 */
public record EndToEndId(String value) {

    private static final Pattern PATTERN = Pattern.compile("E\\d{8}\\d{12}[A-Za-z0-9]{11}");
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    public EndToEndId {
        Objects.requireNonNull(value, "value");
        if (!PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("invalid E2E id: " + value);
        }
    }

    public static EndToEndId generate(String ispb, LocalDateTime now) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 11);
        return new EndToEndId("E%s%s%s".formatted(ispb, now.format(TS), suffix));
    }

    public static EndToEndId generate(String ispb) {
        return generate(ispb, LocalDateTime.now(ZoneOffset.UTC));
    }
}
