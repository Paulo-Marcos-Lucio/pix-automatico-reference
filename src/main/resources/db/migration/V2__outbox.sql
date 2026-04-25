-- V2: transactional outbox for reliable event publishing

create table outbox (
    event_id        uuid primary key,
    aggregate_type  varchar(64) not null,
    aggregate_id    uuid not null,
    event_type      varchar(64) not null,
    payload         text not null,
    occurred_at     timestamp with time zone not null,
    created_at      timestamp with time zone not null,
    published_at    timestamp with time zone,
    attempts        integer not null default 0
);

-- Partial index dramatically speeds up the poller's query.
create index idx_outbox_unpublished on outbox (created_at)
    where published_at is null;

create index idx_outbox_aggregate on outbox (aggregate_type, aggregate_id);
