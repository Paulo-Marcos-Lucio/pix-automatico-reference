package dev.pmlsp.pixauto.domain.model;

import java.util.Objects;

public record EndUser(String document, String name) {
    public EndUser {
        Objects.requireNonNull(document, "document");
        Objects.requireNonNull(name, "name");
        String digits = document.replaceAll("\\D", "");
        if (digits.length() != 11 && digits.length() != 14) {
            throw new IllegalArgumentException("document must be CPF(11) or CNPJ(14)");
        }
    }

    public DocumentType documentType() {
        String digits = document.replaceAll("\\D", "");
        return digits.length() == 11 ? DocumentType.CPF : DocumentType.CNPJ;
    }

    public enum DocumentType { CPF, CNPJ }
}
