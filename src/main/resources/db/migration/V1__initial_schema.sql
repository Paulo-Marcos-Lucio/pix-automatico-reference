-- V1: initial schema for Pix Automatico reference

create table consents (
    id                 uuid primary key,
    payer_document     varchar(14) not null,
    payer_name         varchar(255) not null,
    receiver_key_type  varchar(20) not null,
    receiver_key_value varchar(255) not null,
    frequency          varchar(20) not null,
    amount             numeric(19, 2) not null,
    currency           varchar(3) not null,
    first_charge       date not null,
    end_date           date,
    max_occurrences    integer,
    status             varchar(30) not null,
    created_at         timestamp with time zone not null,
    authorized_at      timestamp with time zone,
    revoked_at         timestamp with time zone,
    revocation_reason  varchar(500),
    version            bigint not null default 0
);

create index idx_consents_payer on consents (payer_document);
create index idx_consents_status on consents (status);

create table subscriptions (
    id                   uuid primary key,
    consent_id           uuid not null references consents (id),
    external_reference   varchar(255),
    created_at           timestamp with time zone not null,
    status               varchar(20) not null,
    last_charge_date     date,
    charge_count         integer not null default 0,
    version              bigint not null default 0
);

create index idx_subscriptions_consent on subscriptions (consent_id);
create index idx_subscriptions_status on subscriptions (status);

create table charges (
    id                uuid primary key,
    subscription_id   uuid not null references subscriptions (id),
    consent_id        uuid not null references consents (id),
    amount            numeric(19, 2) not null,
    currency          varchar(3) not null,
    scheduled_for     date not null,
    created_at        timestamp with time zone not null,
    status            varchar(20) not null,
    end_to_end_id     varchar(32),
    initiated_at      timestamp with time zone,
    settled_at        timestamp with time zone,
    error_code        varchar(64),
    error_message     varchar(500),
    attempt_count     integer not null default 0,
    version           bigint not null default 0
);

create index idx_charges_sub_status on charges (subscription_id, status);
create unique index idx_charges_e2eid on charges (end_to_end_id) where end_to_end_id is not null;
create index idx_charges_scheduled on charges (scheduled_for) where status = 'SCHEDULED';
